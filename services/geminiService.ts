import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AspectRatio, ProjectSettings, ReferenceFile, TTSVoice } from "../types";

let genAI: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
  console.log("Gemini initialized.");
};

// --- 1. The Creative Director Agent (Updated for Full Script) ---

const adPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    concept: { type: Type.STRING },
    musicMood: { type: Type.STRING },
    fullScript: { type: Type.STRING, description: "A cohesive, timing-aware voiceover script for the entire 30s ad. Do not include scene numbers, just the spoken text." },
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
    ffmpegCommand: { type: Type.STRING, description: "FFmpeg command to concat videos and mix audio." }
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
    context += `- File: ${file.name} (${file.type}): ${file.content.substring(0, 500)}...\n`;
  });

  const settingsContext = `
    SETTINGS:
    - Aspect Ratio: ${settings.aspectRatio}
    - Voice Preference: ${settings.preferredVoice}
    - Text Overlays: ${settings.useTextOverlays}
    - Custom Script provided: ${settings.customScript ? "Yes (Use this strictly)" : "No"}
    - Music Theme: ${settings.musicTheme}
  `;

  const systemInstruction = `
    You are a world-class AI Creative Director. Create a stunning video ad plan.
    
    Workflow:
    1. Plan a sequence of shots (Scenes) that total EXACTLY 28-30 seconds.
    2. Write a single, cohesive voiceover script ('fullScript') that flows naturally across these scenes.
    3. Define the visual prompts for Veo (video generation).
    
    Constraints:
    - Scenes must be 4s or 6s.
    - Total duration ~30s.
    - 'visualPrompt' must be cinematic and detailed (lighting, movement, lens).
  `;

  const fullPrompt = `
    ${context}
    ${settingsContext}
    USER REQUEST: "${prompt}"
    ${settings.customScript ? `USER SCRIPT: "${settings.customScript}"` : ""}
    Generate the ad production plan.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction,
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
    // Force 720p for speed/stability in demo
    
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

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await genAI.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) return null;

        // Fetch Blob
        const response = await fetch(`${videoUri}&key=${currentApiKey}`);
        if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Veo Error:", error);
        return null;
    }
};

// --- 3. TTS Generation (Single File) ---

export const generateVoiceover = async (text: string, voice: TTSVoice): Promise<string | null> => {
  if (!genAI) throw new Error("API Key not initialized");
  if (!text) return null;

  try {
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
        return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
      console.error("TTS Error", error);
      return null;
  }
};

// --- 4. Music (Simulated) ---

const MOOD_TRACKS: Record<string, string> = {
    'upbeat': 'https://cdn.pixabay.com/download/audio/2024/05/20/audio_34b92569de.mp3?filename=uplifting-background-music-for-videos-corporates-presentations-205562.mp3',
    'cinematic': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_5119a9705a.mp3?filename=cinematic-atmosphere-score-2-21142.mp3',
    'emotional': 'https://cdn.pixabay.com/download/audio/2022/05/05/audio_13b5646142.mp3?filename=emotional-piano-110266.mp3',
    'corporate': 'https://cdn.pixabay.com/download/audio/2024/02/07/audio_4f0b2a7585.mp3?filename=corporate-music-189688.mp3',
    'jazz': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5245842187.mp3?filename=smooth-jazz-110757.mp3'
};

export const generateMusic = async (moodDescription: string): Promise<string> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMood = moodDescription.toLowerCase();
    let selectedTrack = MOOD_TRACKS['cinematic'];

    if (lowerMood.includes('happy') || lowerMood.includes('upbeat')) selectedTrack = MOOD_TRACKS['upbeat'];
    else if (lowerMood.includes('business') || lowerMood.includes('tech')) selectedTrack = MOOD_TRACKS['corporate'];
    else if (lowerMood.includes('sad') || lowerMood.includes('emotional')) selectedTrack = MOOD_TRACKS['emotional'];
    else if (lowerMood.includes('jazz')) selectedTrack = MOOD_TRACKS['jazz'];

    return selectedTrack;
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