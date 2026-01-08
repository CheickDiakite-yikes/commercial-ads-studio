import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AspectRatio, ProjectSettings, ReferenceFile, TTSVoice } from "../types";

let genAI: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
  console.log("Gemini initialized.");
};

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


// --- 1. The Creative Director Agent ---

const adPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    concept: { type: Type.STRING },
    musicMood: { type: Type.STRING },
    fullScript: { type: Type.STRING, description: "A cohesive, timing-aware voiceover script for the entire 30s ad." },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          order: { type: Type.INTEGER },
          duration: { type: Type.INTEGER, description: "4 or 6" },
          visualPrompt: { type: Type.STRING, description: "Detailed visual description for Veo." },
          textOverlay: { type: Type.STRING, description: "Optional short text overlay." }
        },
        required: ["id", "order", "duration", "visualPrompt"]
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
  if (!genAI) throw new Error("API Key not initialized");

  const model = "gemini-3-pro-preview";
  let context = "REFERENCE MATERIALS:\n";
  referenceFiles.forEach(file => {
    context += `- File: ${file.name}: ${file.content.substring(0, 500)}...\n`;
  });

  const settingsContext = `
    SETTINGS:
    - Aspect Ratio: ${settings.aspectRatio}
    - Voice Preference: ${settings.preferredVoice}
    - Text Overlays: ${settings.useTextOverlays}
    - Custom Script provided: ${settings.customScript ? "Yes" : "No"}
    - Music Theme: ${settings.musicTheme}
  `;

  const fullPrompt = `
    ${context}
    ${settingsContext}
    USER REQUEST: "${prompt}"
    ${settings.customScript ? `USER SCRIPT: "${settings.customScript}"` : ""}
    Generate a 30s ad plan. Scenes must be 4s or 6s.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction: "You are a world-class AI Creative Director.",
        responseMimeType: "application/json",
        responseSchema: adPlanSchema
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Ad Plan Generation Failed:", error);
    throw error;
  }
};

// --- 2. Veo 3.1 Video Generation ---

export const generateVideoClip = async (
  visualPrompt: string, 
  aspectRatio: AspectRatio, 
): Promise<string | null> => {
    if (!genAI || !currentApiKey) throw new Error("API Key not initialized");

    const aspect = aspectRatio === AspectRatio.SixteenNine ? '16:9' : '9:16';
    
    try {
        let operation = await genAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: visualPrompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspect
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await genAI.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) return null;

        const response = await fetch(`${videoUri}&key=${currentApiKey}`);
        if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Veo Error:", error);
        return null;
    }
};

// --- 3. TTS Generation (PCM to WAV) ---

export const generateVoiceover = async (text: string, voice: TTSVoice): Promise<string | null> => {
  if (!genAI) throw new Error("API Key not initialized");
  if (!text) return null;

  console.log("Generating Voiceover for:", text);

  try {
    // Note: This model returns raw PCM, 24kHz, Mono (1 channel)
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice }
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
        const pcmData = base64ToUint8Array(base64Audio);
        // TTS Spec: 24kHz, 1 Channel
        const wavBlob = pcmToWavBlob(pcmData, 24000, 1);
        const url = URL.createObjectURL(wavBlob);
        console.log("Voiceover Generated successfully:", url);
        return url;
    }
    return null;
  } catch (error) {
      console.error("TTS Error", error);
      return null;
  }
};

// --- 4. Music Generation (Real Lyria with Fallback) ---

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

export const generateMusic = async (moodDescription: string): Promise<string | null> => {
    if (!currentApiKey) throw new Error("API Key not initialized");
    console.log("Generating Music with Lyria for mood:", moodDescription);

    return new Promise(async (resolve) => {
        try {
            // CRITICAL FIX: Use v1alpha for Lyria as it is experimental
            const lyriaClient = new GoogleGenAI({ apiKey: currentApiKey, apiVersion: 'v1alpha' });
            
            // Lyria Spec: 48kHz, 2 Channels (Stereo)
            const SAMPLE_RATE = 48000;
            const CHANNELS = 2;
            const chunks: Uint8Array[] = [];

            // @ts-ignore - live property exists in the SDK but types might be lagging
            const session = await lyriaClient.live.music.connect({
                model: 'models/lyria-realtime-exp',
                callbacks: {
                    onmessage: (message: any) => {
                        if (message.serverContent?.audioChunks) {
                            for (const chunk of message.serverContent.audioChunks) {
                                chunks.push(base64ToUint8Array(chunk.data));
                            }
                        }
                    },
                    onerror: (err: any) => {
                        console.error("Lyria WebSocket Error:", err);
                        // Do not reject here immediately, wait for timeout or allow fallback below
                    },
                    onclose: () => console.log("Lyria Session Closed"),
                }
            });

            // Configure Lyria
            await session.setWeightedPrompts({
                weightedPrompts: [{ text: moodDescription, weight: 1.0 }]
            });

            await session.setMusicGenerationConfig({
                musicGenerationConfig: {
                    musicGenerationMode: 'QUALITY',
                    audioFormat: 'pcm16',
                    sampleRateHz: SAMPLE_RATE
                }
            });

            console.log("Starting Lyria stream...");
            await session.play();

            // Record for 20 seconds (shorter for safety) then stop
            setTimeout(async () => {
                if (chunks.length === 0) {
                    console.warn("Lyria produced no data. Falling back.");
                    resolve(getFallbackMusic(moodDescription));
                    return;
                }

                console.log("Stopping Lyria stream...");
                // Combine chunks
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const combinedPcm = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) {
                    combinedPcm.set(chunk, offset);
                    offset += chunk.length;
                }

                const wavBlob = pcmToWavBlob(combinedPcm, SAMPLE_RATE, CHANNELS);
                const url = URL.createObjectURL(wavBlob);
                console.log("Lyria Music Generated:", url);
                resolve(url);
            }, 20000);

        } catch (e) {
            console.error("Lyria Generation Failed (Connection):", e);
            console.log("Using Fallback Music");
            resolve(getFallbackMusic(moodDescription));
        }
    });
};

// --- 5. Chat Helper ---
export const sendChatMessage = async (history: any[], message: string) => {
    if (!genAI) throw new Error("API Key not initialized");
    const chat = genAI.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: { systemInstruction: "Helpful AI Assistant." }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text;
}