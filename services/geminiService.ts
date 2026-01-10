import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AspectRatio, ProjectSettings, ReferenceFile, TTSVoice, AdProject, DialogueLine, ChatAttachment } from "../types";

// --- AUDIO UTILITIES (PCM to WAV) ---

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const createWavHeader = (sampleRate: number, numChannels: number, numFrames: number) => {
  const blockAlign = numChannels * 2; // 16-bit = 2 bytes
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  return buffer;
};

const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const pcmToWavBlob = (pcmData: Uint8Array, sampleRate: number, channels: number): Blob => {
    // pcmData is Uint8Array of 16-bit little-endian samples
    const numFrames = pcmData.length / (channels * 2);
    const header = createWavHeader(sampleRate, channels, numFrames);
    return new Blob([header, pcmData], { type: 'audio/wav' });
};

// --- DATA URL PARSING ---
const parseDataUrl = (dataUrl: string) => {
    try {
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error("Invalid Data URL format");
        }
        return {
            mimeType: matches[1],
            base64: matches[2]
        };
    } catch (e) {
        console.error("Data URL Parsing failed", e);
        return null;
    }
};

// --- HELPER: FETCH BLOB AND CONVERT TO BASE64 ---
const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


// --- 1. The Creative Director Agent ---

const adPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    concept: { type: Type.STRING },
    musicMood: { type: Type.STRING },
    fullScript: { type: Type.STRING, description: "A cohesive, timing-aware voiceover script or summary of the dialogue." },
    script: {
        type: Type.ARRAY,
        description: "Phase 3: Narrative Dialogue structure. Use this if the ad involves characters talking.",
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING, description: "Name of the character (e.g. 'Narrator', 'Hero', 'Alien')" },
                text: { type: Type.STRING, description: "The spoken line." }
            }
        }
    },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          order: { type: Type.INTEGER },
          duration: { type: Type.INTEGER, description: "4 or 6" },
          visualPrompt: { type: Type.STRING, description: "Detailed visual description for Veo. Describe lighting, camera angle, and subject detail." },
          textOverlay: { type: Type.STRING, description: "Optional short text overlay." },
          overlayConfig: {
            type: Type.OBJECT,
            description: "Configuration for the text overlay placement and size.",
            properties: {
              position: { 
                type: Type.STRING, 
                enum: ['center', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
                description: "Where to place the text based on the visual composition (negative space)."
              },
              size: { 
                type: Type.STRING, 
                enum: ['small', 'medium', 'large', 'xl'],
                description: "Font size. Use XL only for 1-2 words. Use Small/Medium for longer sentences."
              }
            },
            required: ["position", "size"]
          }
        },
        required: ["id", "order", "duration", "visualPrompt", "overlayConfig"]
      }
    },
    ffmpegCommand: { type: Type.STRING }
  },
  required: ["title", "concept", "scenes", "musicMood", "fullScript", "ffmpegCommand"]
};

export const generateAdPlan = async (
  prompt: string,
  settings: ProjectSettings,
  referenceFiles: ReferenceFile[]
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  // Phase 3.5: Multimodal Prompt Construction
  const contentParts: any[] = [];
  
  let textContext = "REFERENCE MATERIALS:\n";
  let hasLinks = false;

  // Process references: Images become InlineData parts, text is aggregated
  for (const file of referenceFiles) {
      if (file.type === 'image' || file.type === 'pdf') {
          // Try to extract pure base64
          const base64 = file.content.includes(',') ? file.content.split(',')[1] : file.content;
          const mimeType = file.mimeType || (file.type === 'image' ? 'image/png' : 'application/pdf');
          
          contentParts.push({
              inlineData: {
                  mimeType: mimeType,
                  data: base64
              }
          });
      } else if (file.type === 'link') {
          hasLinks = true;
          textContext += `- YouTube/Web Link: ${file.content} (Please use Google Search to analyze the style, content, and vibe of this link)\n`;
      } else {
          textContext += `- File: ${file.name}: ${file.content.substring(0, 500)}...\n`;
      }
  }

  // Phase 2: Mode specific instructions
  let modeInstructions = "";
  switch (settings.mode) {
    case "Music Video":
        modeInstructions = "MODE: MUSIC VIDEO. Ignore standard commercial timing rules. Focus on visual loops, abstract imagery, beat synchronization, and artistic flair. The visual prompts should be rhythmic and dynamic.";
        break;
    case "Trippy":
        modeInstructions = "MODE: TRIPPY / PSYCHEDELIC. Automatically inject style modifiers like 'fractal, neon, surrealism, dreamcore, kaleidoscope' into EVERY visualPrompt. Make the visuals mind-bending.";
        break;
    case "Cinematic":
        modeInstructions = "MODE: CINEMATIC. Focus on '8k, anamorphic lens, dramatic lighting, depth of field, blockbuster movie feel'.";
        break;
    case "Commercial":
    default:
        modeInstructions = "MODE: COMMERCIAL. Standard broadcast quality. Clear, concise, product-focused.";
        break;
  }

  const settingsContext = `
    SETTINGS:
    - Mode: ${settings.mode}
    - Aspect Ratio: ${settings.aspectRatio}
    - Voice Preference: ${settings.preferredVoice}
    - Text Overlays: ${settings.useTextOverlays}
    - Custom Script provided: ${settings.customScript ? "Yes" : "No"}
    - Music Theme: ${settings.musicTheme}
  `;

  const fullPromptText = `
    ${textContext}
    ${settingsContext}
    USER REQUEST: "${prompt}"
    ${settings.customScript ? `USER SCRIPT: "${settings.customScript}"` : ""}
    
    ${modeInstructions}

    TASK: Generate a precise 30-second Video Ad Plan.
    
    CONSTRAINTS:
    1. Total Duration must be exactly 30 seconds.
    2. Scenes must be 4s or 6s. (e.g., 5 scenes of 6s, or mix).
    3. The 'fullScript' (or 'script' array) must be timed perfectly for a 30s read. Aim for exactly 60-75 words.
    
    PHASE 3 NARRATIVE UPDATE:
    - If the user request implies a conversation or distinct characters, populate the 'script' array with { speaker, text } objects.
    - If it's a standard voiceover, use the 'script' array with a single speaker 'Narrator'.
    
    DESIGN DIRECTIVE (Text Overlays):
    - Analyze your own 'visualPrompt' AND any attached reference images to find negative space.
    - Example: If the video or reference shows a subject on the right, place text 'center-left'.
  `;

  // Add the main text prompt as the last part
  contentParts.push({ text: fullPromptText });

  try {
    const requestConfig: any = {
      systemInstruction: "You are a world-class AI Creative Director. You understand video editing timing and visual composition perfectly.",
      responseMimeType: "application/json",
      responseSchema: adPlanSchema,
    };

    // Enable Google Search if links are present
    if (hasLinks) {
        console.log("Links detected, enabling Google Search tool...");
        requestConfig.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: contentParts }],
      config: requestConfig
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Ad Plan Generation Failed:", error);
    throw error;
  }
};

// --- 2. Storyboard Generation (NEW: Image Consistency Layer) ---

export const generateStoryboardImage = async (
    visualPrompt: string,
    aspectRatio: AspectRatio,
    visualAnchorDataUrl?: string
): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const aspect = aspectRatio === AspectRatio.SixteenNine ? '16:9' : '9:16';
    
    console.log(`[Storyboard] Generating image for: "${visualPrompt.substring(0, 30)}..."`);
    
    const parts: any[] = [];
    
    // Inject Visual Anchor if available for CONSISTENCY
    if (visualAnchorDataUrl) {
        const parsed = parseDataUrl(visualAnchorDataUrl);
        if (parsed) {
            parts.push({
                inlineData: {
                    mimeType: parsed.mimeType,
                    data: parsed.base64
                }
            });
            // Strong instruction to strictly follow the image
            parts.push({ text: "INSTRUCTION: The image above is a STRICT character/style reference. Generate a new scene featuring this exact character/style." });
        }
    }

    parts.push({ text: `Generate a high-quality, photorealistic cinematic shot. Scene Description: ${visualPrompt}` });

    try {
        // We use gemini-3-pro-image-preview for high fidelity instruction following
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts },
            config: {
                imageConfig: {
                    aspectRatio: aspect,
                    imageSize: "1K"
                }
            }
        });

        // Extract image
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64 = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                // Return as Data URL
                return `data:${mimeType};base64,${base64}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Storyboard Image Generation Failed:", e);
        return null;
    }
};

// --- 3. Veo 3.1 Video Generation (UPDATED: Supports Image Input) ---

export const generateVideoClip = async (
  visualPrompt: string, 
  aspectRatio: AspectRatio,
  sourceImageDataUrl?: string // Now accepts the Storyboard Image as input
): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const aspect = aspectRatio === AspectRatio.SixteenNine ? '16:9' : '9:16';
    
    console.log(`[Veo] Starting generation. Input Image Present: ${!!sourceImageDataUrl}`);

    try {
        let requestPayload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: visualPrompt, // Still provide prompt for motion guidance
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspect
            }
        };

        // IMAGE-TO-VIDEO: This locks consistency
        if (sourceImageDataUrl) {
            const parsed = parseDataUrl(sourceImageDataUrl);
            if (parsed) {
                console.log(`[Veo] Using Storyboard Image for Image-to-Video generation`);
                requestPayload.image = {
                    imageBytes: parsed.base64,
                    mimeType: parsed.mimeType
                };
            }
        }

        let operation = await ai.models.generateVideos(requestPayload);

        console.log(`[Veo] Operation started. Name: ${operation.name}`);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log(`[Veo] Polling... Done: ${operation.done}`);
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) {
            console.error("[Veo] No video URI in response", operation);
            return null;
        }

        const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;

    } catch (error) {
        console.error("[Veo] Generation Error:", error);
        return null;
    }
};

// --- 4. TTS Generation (PCM to WAV) ---

export const generateVoiceover = async (text: string, voice: TTSVoice, dialogue?: DialogueLine[]): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (!text && (!dialogue || dialogue.length === 0)) return null;

  try {
    let config: any = { responseModalities: [Modality.AUDIO] };
    let promptContent = "";

    if (dialogue && dialogue.length > 0) {
        const uniqueSpeakers = Array.from(new Set(dialogue.map(d => d.speaker)));
        if (uniqueSpeakers.length > 1) {
            const availableVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'];
            const speakerVoiceConfigs = uniqueSpeakers.map((speaker, idx) => ({
                speaker: speaker,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: availableVoices[idx % availableVoices.length] } }
            }));

            config.speechConfig = { multiSpeakerVoiceConfig: { speakerVoiceConfigs: speakerVoiceConfigs } };
            promptContent = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');
        } else {
            promptContent = text;
            config.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
        }
    } else {
        promptContent = text;
        config.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: promptContent }] }],
        config: config
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
        const pcmData = base64ToUint8Array(base64Audio);
        const wavBlob = pcmToWavBlob(pcmData, 24000, 1);
        return URL.createObjectURL(wavBlob);
    }
    return null;
  } catch (error) {
      console.error("TTS Error", error);
      return null;
  }
};

// --- 5. Music Generation (Real Lyria with Fallback) ---
// ... (Keeping existing music generation code as is, omitted for brevity but assumed present)
const MOOD_TRACKS: Record<string, string> = {
    'upbeat': 'https://cdn.pixabay.com/download/audio/2024/05/20/audio_34b92569de.mp3?filename=uplifting-background-music-for-videos-corporates-presentations-205562.mp3',
    'cinematic': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_5119a9705a.mp3?filename=cinematic-atmosphere-score-2-21142.mp3',
    'emotional': 'https://cdn.pixabay.com/download/audio/2022/05/05/audio_13b5646142.mp3?filename=emotional-piano-110266.mp3',
    'corporate': 'https://cdn.pixabay.com/download/audio/2024/02/07/audio_4f0b2a7585.mp3?filename=corporate-music-189688.mp3',
    'jazz': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5245842187.mp3?filename=smooth-jazz-110757.mp3'
};
const getFallbackMusic = (mood: string) => {
    const lowerMood = mood.toLowerCase();
    if (lowerMood.includes('happy') || lowerMood.includes('upbeat')) return MOOD_TRACKS['upbeat'];
    if (lowerMood.includes('business') || lowerMood.includes('tech')) return MOOD_TRACKS['corporate'];
    if (lowerMood.includes('sad') || lowerMood.includes('emotional')) return MOOD_TRACKS['emotional'];
    if (lowerMood.includes('jazz')) return MOOD_TRACKS['jazz'];
    return MOOD_TRACKS['cinematic'];
}
export const generateMusic = async (moodDescription: string, durationSeconds: number = 30): Promise<string | null> => {
    const triggerFallback = (reason: string) => {
        console.warn(`Falling back to stock music. Reason: ${reason}`);
        return getFallbackMusic(moodDescription);
    };
    return new Promise(async (resolve) => {
        let hasResolved = false;
        const safetyTimeout = setTimeout(() => {
            if (!hasResolved) { hasResolved = true; resolve(triggerFallback("Lyria Timeout")); }
        }, (durationSeconds * 1000) + 5000);

        try {
            const lyriaClient = new GoogleGenAI({ apiKey: process.env.API_KEY, apiVersion: 'v1alpha' });
            const SAMPLE_RATE = 48000;
            const CHANNELS = 2;
            const chunks: Uint8Array[] = [];
            // @ts-ignore
            const session = await lyriaClient.live.music.connect({
                model: 'models/lyria-realtime-exp',
                callbacks: {
                    onopen: () => {},
                    onmessage: (message: any) => {
                        if (message.serverContent?.audioChunks) {
                            for (const chunk of message.serverContent.audioChunks) { chunks.push(base64ToUint8Array(chunk.data)); }
                        }
                    },
                    onerror: (err: any) => { if (!hasResolved) { hasResolved = true; clearTimeout(safetyTimeout); resolve(triggerFallback("WebSocket Error")); } },
                    onclose: () => {},
                }
            });
            await session.setMusicGenerationConfig({ musicGenerationConfig: { musicGenerationMode: 'QUALITY' as any } });
            await session.setWeightedPrompts({ weightedPrompts: [{ text: moodDescription, weight: 1.0 }] });
            await session.play();
            setTimeout(async () => {
                if (hasResolved) return;
                if (chunks.length === 0) { hasResolved = true; clearTimeout(safetyTimeout); resolve(triggerFallback("No Data Received")); return; }
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const combinedPcm = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) { combinedPcm.set(chunk, offset); offset += chunk.length; }
                const wavBlob = pcmToWavBlob(combinedPcm, SAMPLE_RATE, CHANNELS);
                hasResolved = true; clearTimeout(safetyTimeout); resolve(URL.createObjectURL(wavBlob));
            }, durationSeconds * 1000);
        } catch (e) { if (!hasResolved) { hasResolved = true; clearTimeout(safetyTimeout); resolve(triggerFallback(`Exception: ${e}`)); } }
    });
};

// --- 6. Chat Helper ---
export const sendChatMessage = async (
    history: any[], 
    message: string, 
    project?: AdProject, 
    attachments?: ChatAttachment[]
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare the message parts
    let parts: any[] = [];
    let hasLinks = false;

    // Phase 3.5: Add Attachments first (so model sees them)
    if (attachments && attachments.length > 0) {
        console.log(`[Chat] Sending ${attachments.length} attachments.`);
        attachments.forEach(att => {
            if (att.type === 'link') {
                hasLinks = true;
                parts.push({ text: `[REFERENCE LINK]: ${att.url} (Use Google Search to analyze this link)` });
            } else {
                parts.push({
                    inlineData: {
                        mimeType: att.mimeType,
                        data: att.base64Data
                    }
                });
            }
        });
    }

    // Add User Text
    parts.push({ text: message });

    // Prepare system instructions with enhanced context if project exists
    let systemInstruction = "You are a helpful AI Creative Director. You are an expert in video production, editing, and storytelling.";
    
    if (project) {
        systemInstruction += `\n\nCURRENT PROJECT CONTEXT:
        Title: "${project.title}"
        Concept: "${project.concept}"
        Mode: "${project.mode || 'Commercial'}"
        
        When asked to critique or review, analyze the attached video clips or images for consistency, lighting, composition, and relevance to the script.
        `;

        // Attach video context if scenes are complete
        if (project.scenes && project.scenes.length > 0) {
            try {
                // Now we can attach storyboards OR videos for context
                const completedScenes = project.scenes.filter(s => s.status === 'complete' && (s.videoUrl || s.storyboardUrl));
                
                if (completedScenes.length > 0) {
                    const sceneParts = await Promise.all(
                        completedScenes.map(async (s) => {
                            // Prefer video, fallback to storyboard
                            const url = s.videoUrl || s.storyboardUrl;
                            const mime = s.videoUrl ? 'video/mp4' : 'image/png';
                            if (!url) return null;
                            const base64 = await urlToBase64(url);
                            return {
                                inlineData: {
                                    mimeType: mime,
                                    data: base64
                                }
                            };
                        })
                    );
                    
                    const validParts = sceneParts.filter(p => p !== null);
                    if (validParts.length > 0) {
                        parts = [...validParts, ...parts];
                        parts.push({ text: `\n\n[SYSTEM NOTE]: The user has attached ${validParts.length} scenes (videos or storyboards) from the current project for context.`});
                    }
                }
            } catch (e) {
                console.warn("Failed to attach video context to chat", e);
            }
        }
    }

    const config: any = { 
        systemInstruction: systemInstruction 
    };

    if (hasLinks) {
        config.tools = [{googleSearch: {}}];
    }

    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview', 
        history: history,
        config: config
    });
    
    const result = await chat.sendMessage({ 
        message: parts
    });
    
    return result.text;
}