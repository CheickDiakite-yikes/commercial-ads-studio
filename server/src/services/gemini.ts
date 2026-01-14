import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AspectRatio, ProjectSettings, ReferenceFile, TTSVoice, Scene, DialogueLine, ChatAttachment } from "../types";

// --- AUDIO UTILITIES (PCM to WAV) ---
const createWavHeader = (sampleRate: number, numChannels: number, numFrames: number) => {
    const blockAlign = numChannels * 2; // 16-bit = 2 bytes
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;
    const buffer = Buffer.alloc(44);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // fmt sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    buffer.writeUInt16LE(numChannels, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample

    // data sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    return buffer;
};

const pcmToWavBuffer = (pcmData: Uint8Array, sampleRate: number, channels: number): Buffer => {
    // pcmData is Uint8Array of 16-bit little-endian samples
    const numFrames = pcmData.length / (channels * 2);
    const header = createWavHeader(sampleRate, channels, numFrames);
    return Buffer.concat([header, Buffer.from(pcmData)]);
};

const base64ToUint8Array = (base64: string) => {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
};

// --- DATA URL PARSING ---
const parseDataUrl = (dataUrl: string) => {
    try {
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            // It might just be the base64 string already if not a data URL
            return { mimeType: 'image/jpeg', base64: dataUrl };
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

const adPlanSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        concept: { type: Type.STRING },
        musicMood: { type: Type.STRING },
        masterCharacterProfile: { type: Type.STRING, description: "EXTREMELY DETAILED 300+ word physical description of the main character. Must include: Skin texture (pores, freckles), exact eye shape/color, hair texture/strand behavior, facial structure (cheekbones, jawline), and body type. This is the 'Source of Truth' for the character." },
        visualStyleProfile: { type: Type.STRING, description: "Detailed world description." },
        fullScript: { type: Type.STRING },
        script: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    speaker: { type: Type.STRING },
                    text: { type: Type.STRING }
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
                    duration: { type: Type.INTEGER },
                    character: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING, description: "Must copy the 'masterCharacterProfile' here to ensure consistency." },
                            hair: { type: Type.STRING },
                            face: { type: Type.STRING },
                            wardrobe: { type: Type.STRING }
                        },
                        required: ["description", "wardrobe"]
                    },
                    environment: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING },
                            look: { type: Type.STRING },
                            lighting: { type: Type.STRING },
                            background_motion: { type: Type.STRING }
                        },
                        required: ["location", "look", "lighting"]
                    },
                    camera: {
                        type: Type.OBJECT,
                        properties: {
                            framing: { type: Type.STRING },
                            movement: { type: Type.STRING },
                            notes: { type: Type.STRING }
                        },
                        required: ["framing", "movement"]
                    },
                    action_blocking: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                time_window: { type: Type.STRING },
                                notes: { type: Type.STRING }
                            }
                        }
                    },
                    visual_summary_prompt: { type: Type.STRING },
                    textOverlay: { type: Type.STRING },
                    overlayConfig: {
                        type: Type.OBJECT,
                        properties: {
                            position: { type: Type.STRING, enum: ['center', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] },
                            size: { type: Type.STRING, enum: ['small', 'medium', 'large', 'xl'] }
                        },
                        required: ["position", "size"]
                    }
                },
                required: ["id", "order", "duration", "character", "environment", "camera", "visual_summary_prompt", "action_blocking"]
            }
        },
        ffmpegCommand: { type: Type.STRING }
    },
    required: ["title", "concept", "scenes", "musicMood", "fullScript", "masterCharacterProfile"]
};

export const generateAdPlan = async (
    prompt: string,
    settings: ProjectSettings,
    referenceFiles: ReferenceFile[]
): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-pro-preview";

    const contentParts: any[] = [];

    let textContext = "REFERENCE MATERIALS:\n";
    let hasLinks = false;

    for (const file of referenceFiles) {
        if (file.type === 'image' || file.type === 'pdf') {
            const base64 = file.content.includes(',') ? file.content.split(',')[1] : file.content;
            const mimeType = file.mimeType || (file.type === 'image' ? 'image/png' : 'application/pdf');
            contentParts.push({ inlineData: { mimeType: mimeType, data: base64 } });
        } else if (file.type === 'link') {
            hasLinks = true;
            textContext += `- YouTube/Web Link: ${file.content}\n`;
        } else {
            textContext += `- File: ${file.name}: ${file.content.substring(0, 500)}...\n`;
        }
    }

    const settingsContext = `
    SETTINGS:
    - Mode: ${settings.mode}
    - Aspect Ratio: ${settings.aspectRatio}
    - Text Overlays: ${settings.useTextOverlays}
    - Custom Script: ${settings.customScript}
    - Music Theme: ${settings.musicTheme}
  `;

    const fullPromptText = `
    ${textContext}
    ${settingsContext}
    USER REQUEST: "${prompt}"

    TASK: Generate a 30-second Video Ad Plan using the "Director's JSON" structure.
    
    CRITICAL INSTRUCTION - CHARACTER CONSISTENCY:
    You MUST generate a 'masterCharacterProfile' that is AT LEAST 300 WORDS long.
    Do not be vague. define every wrinkle, the exact shade of skin (e.g. "warm sienna with cool undertones"), the texture of hair (e.g. "3b curls with slight frizz at the crown"), specific facial landmarks (e.g. "a small mole above the left eyebrow").
    This 'masterCharacterProfile' MUST be pasted verbatim into 'scene.character.description' for EVERY scene to ensure the video generation model sees the exact same prompt every time.
    
    INSTRUCTIONS:
    1. **Detailed Breakdowns**: For EVERY scene, you must generate specific details for Camera (Framing/Movement), Character (Wardrobe/Hair), and Environment (Lighting/Look).
    2. **Consistency**: The 'character.description' and 'environment.look' should be somewhat consistent across scenes unless the location changes.
    3. **Action Blocking**: Use the 'action_blocking' array to describe exactly what happens in the 4-6 second clip.
    4. **Visual Summary**: Also provide a 'visual_summary_prompt' which is a single cohesive paragraph summarizing the scene for a text-to-video model.
    
    CONSTRAINTS:
    - Duration: Exactly 30s.
    - Scenes: 4s or 6s each.
    - Script: 60-70 words.
  `;

    contentParts.push({ text: fullPromptText });

    try {
        const requestConfig: any = {
            systemInstruction: "You are an elite Film Director. You specialize in Hyper-Consistent Character Design. You break down scenes into granular technical components (Lighting, Wardrobe, Camera, Blocking) to ensure perfect production consistency.",
            responseMimeType: "application/json",
            responseSchema: adPlanSchema,
        };

        if (hasLinks) {
            requestConfig.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: contentParts }],
            config: requestConfig
        });
        const plan = JSON.parse(response.text || "{}");

        // CONSISTENCY ENFORCEMENT: Programmatically overwrite scene descriptions
        if (plan.masterCharacterProfile && plan.scenes) {
            plan.scenes.forEach((scene: any) => {
                if (scene.character) {
                    scene.character.description = plan.masterCharacterProfile;
                }
            });
        }

        return plan;
    } catch (error) {
        console.error("Ad Plan Generation Failed:", error);
        throw error;
    }
};

export const generateStoryboardImage = async (
    scene: Scene,
    aspectRatio: AspectRatio,
    visualAnchorDataUrl?: string,
): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const aspect = aspectRatio === AspectRatio.SixteenNine ? '16:9' : '9:16';

    const parts: any[] = [];

    // 1. Inject Visual Anchor
    if (visualAnchorDataUrl) {
        const parsed = parseDataUrl(visualAnchorDataUrl);
        if (parsed) {
            parts.push({
                inlineData: { mimeType: parsed.mimeType, data: parsed.base64 }
            });
            parts.push({ text: "REFERENCE IMAGE: Use the subject from this image. Keep their face and body consistent." });
        }
    }

    // 2. Construct the Director's Prompt
    // We use the FULL character description here to ensure the storyboard matches the video.
    const prompt = `
      Create a photorealistic cinematic shot.
      
      [CAMERA]: ${scene.camera.framing}, ${scene.camera.movement}. ${scene.camera.notes}
      
      [LIGHTING & ATMOSPHERE]: ${scene.environment.lighting}, ${scene.environment.look}.
      
      [LOCATION]: ${scene.environment.location}.
      
      [SUBJECT]: ${scene.character.description}
      - Hair: ${scene.character.hair}
      - Wardrobe: ${scene.character.wardrobe}
      - Face: ${scene.character.face}
      
      [ACTION]: ${scene.action_blocking.map(a => a.notes).join('. ')}
      
      [STYLE]: High-end commercial, 8k resolution, highly detailed.
    `;

    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: [{ parts }],
            config: {
                // @ts-ignore
                imageConfig: { aspectRatio: aspect, imageSize: "1024x1024" }
            }
        });

        // @ts-ignore
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        return null;
    } catch (e) {
        console.error("Storyboard Image Generation Failed:", e);
        return null;
    }
};

const internalGenerateVideo = async (
    ai: GoogleGenAI,
    prompt: string,
    aspect: string,
    imageInput?: { base64: string, mimeType: string }
): Promise<string | null> => {
    try {
        let requestPayload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspect }
        };

        if (imageInput) {
            requestPayload.image = { imageBytes: imageInput.base64, mimeType: imageInput.mimeType };
        }

        // @ts-ignore
        let operation = await ai.models.generateVideos(requestPayload);
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            // @ts-ignore
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        // @ts-ignore
        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) return null;

        // Fetch the video content from the URI (which might be protected or require key)
        const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const buffer = await response.arrayBuffer();

        // Convert to base64 data URL for frontend
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:video/mp4;base64,${base64}`;
    } catch (error) {
        console.error("Video Generation Error:", error);
        return null;
    }
}

export const generateVideoClip = async (
    scene: Scene,
    aspectRatio: AspectRatio,
    sourceImageDataUrl?: string
): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const aspect = aspectRatio === AspectRatio.SixteenNine ? '16:9' : '9:16';

    // CONSISTENCY HACK: Even if we have an image, we enforce the detailed description in the prompt.
    // This guides the model to maintain the identity even when transforming the image.
    const veoPrompt = `
      Cinematic video.
      [CHARACTER]: ${scene.character.description}
      [ACTION]: ${scene.action_blocking.map(a => a.notes).join('. ')}
      Camera: ${scene.camera.movement}.
      Lighting: ${scene.environment.lighting}.
    `;

    if (sourceImageDataUrl) {
        const parsed = parseDataUrl(sourceImageDataUrl);
        if (parsed) {
            const videoUrl = await internalGenerateVideo(ai, veoPrompt, aspect, parsed);
            if (videoUrl) return videoUrl;
        }
    }

    return await internalGenerateVideo(ai, veoPrompt + " (Cinematic, Photorealistic)", aspect, undefined);
};

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

                // @ts-ignore
                config.speechConfig = { multiSpeakerVoiceConfig: { speakerVoiceConfigs: speakerVoiceConfigs } };
                promptContent = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');
            } else {
                promptContent = text;
                // @ts-ignore
                config.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
            }
        } else {
            promptContent = text;
            // @ts-ignore
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
            // WAV conversion
            const wavBuffer = pcmToWavBuffer(pcmData, 24000, 1);
            return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
        }
        return null;
    } catch (error) {
        console.error("TTS Error", error);
        return null;
    }
};

import * as fs from 'fs';
import * as path from 'path';

// ... (other imports)

export const sendChatMessage = async (
    history: any[],
    message: string,
    attachments?: ChatAttachment[],
    project?: any
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let parts: any[] = [];
    let hasLinks = false;

    // 1. Handle Manual Attachments
    if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
            if (att.type === 'link') {
                hasLinks = true;
                parts.push({ text: `[REFERENCE LINK]: ${att.url} (Use Google Search to analyze this link)` });
            } else {
                console.log(`[Chat] Processing attachment: ${att.mimeType}, size: ${att.base64Data.length} bytes`);
                parts.push({
                    inlineData: { mimeType: att.mimeType, data: att.base64Data }
                });
            }
        });
    }

    // 2. Handle Project Context (Auto-Video Understanding)
    if (project && project.scenes) {
        console.log(`[Chat] Analyzing project context for videos...`);
        // We limit to the last 3 generated videos to avoid payload limits/latency, prioritizing recent work.
        // Or if specific scene is mentioned in 'message', we could target that, but for now we send recent context.
        const validScenes = project.scenes.filter((s: any) => s.videoUrl && s.videoUrl.startsWith('/api/assets/'));

        // Take up to 3 most recent scenes (or all if few)
        const scenesToAttach = validScenes.slice(-3);

        for (const scene of scenesToAttach) {
            try {
                // Parse URL: /api/assets/userId/projectId/filename.mp4
                // parts = ["", "api", "assets", "userId", "projectId", "filename"]
                const urlParts = scene.videoUrl.split('/');
                if (urlParts.length >= 6) {
                    const userId = urlParts[3];
                    const projectId = urlParts[4];
                    const filename = urlParts[5];
                    const filePath = path.join(__dirname, '../../data/assets', userId, projectId, filename);

                    if (fs.existsSync(filePath)) {
                        console.log(`[Chat] Auto-attaching scene ${scene.id} video: ${filename}`);
                        const videoBuffer = fs.readFileSync(filePath);
                        const base64Video = videoBuffer.toString('base64');

                        parts.push({ text: `[CONTEXT] Scene ${scene.order} Video:` });
                        parts.push({
                            inlineData: {
                                mimeType: 'video/mp4', // Assumption based on generation output
                                data: base64Video
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("[Chat] Failed to attach project video context", e);
            }
        }
    }

    parts.push({ text: message });
    let systemInstruction = "You are a helpful AI Creative Director.";

    const config: any = { systemInstruction: systemInstruction };
    if (hasLinks) config.tools = [{ googleSearch: {} }];

    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: config
    });

    const result = await chat.sendMessage({ message: parts });
    return result.text;
}

export const generateMusic = async (mood: string, duration: number = 30): Promise<string | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const tryGenerate = async (model: string) => {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: `Generate ${mood} music for ${duration} seconds.` }] }],
            config: {
                // @ts-ignore
                responseModalities: [Modality.AUDIO]
            }
        });
        // @ts-ignore
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    };

    try {
        console.log(`[Music] Attempting to generate '${mood}' music (${duration}s) with lyria-realtime-exp...`);
        const base64Audio = await tryGenerate('lyria-realtime-exp');
        if (base64Audio) {
            console.log(`[Music] Success! Received ${base64Audio.length} bytes from Lyria.`);
            const pcmData = base64ToUint8Array(base64Audio);
            // Lyria usually returns 44.1kHz stereo
            const wavBuffer = pcmToWavBuffer(pcmData, 44100, 2);
            return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
        } else {
            console.warn("[Music] Lyria returned no audio data.");
        }
    } catch (error) {
        console.warn("[Music] Lyria generation failed, falling back to gemini-2.0-flash-exp", error);
        try {
            const base64Audio = await tryGenerate('gemini-2.0-flash-exp');
            if (base64Audio) {
                console.log(`[Music] Success (Fallback)! Received ${base64Audio.length} bytes.`);
                const pcmData = base64ToUint8Array(base64Audio);
                // Gemini Flash might allow 24kHz mono/stereo, but let's assume standard handling
                const wavBuffer = pcmToWavBuffer(pcmData, 24000, 1);
                return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
            }
        } catch (fallbackError) {
            console.error("[Music] Music Generation Fallback Failed", fallbackError);
        }
    }
    return null;
};
