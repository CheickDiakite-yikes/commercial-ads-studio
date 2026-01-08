import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AspectRatio, ProjectSettings, ReferenceFile, Scene, TTSVoice } from "../types";

// This will be initialized with the key from the user selection
let genAI: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
  console.log("Gemini initialized with API Key.");
};

// --- 1. The Creative Director Agent ---

const adPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the ad campaign" },
    concept: { type: Type.STRING, description: "Brief explanation of the creative direction and story" },
    musicMood: { type: Type.STRING, description: "Description of music style/genre/mood" },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          order: { type: Type.INTEGER },
          duration: { type: Type.INTEGER, description: "Must be either 4 or 6 seconds" },
          visualPrompt: { type: Type.STRING, description: "Highly detailed, cinematic visual description for AI video generation. Focus on lighting, camera movement, subject action, and texture." },
          scriptLine: { type: Type.STRING, description: "Spoken voiceover line for this scene" },
          textOverlay: { type: Type.STRING, description: "Short, punchy text to appear on screen" }
        },
        required: ["id", "order", "duration", "visualPrompt", "scriptLine", "textOverlay"]
      }
    },
    ffmpegCommand: { type: Type.STRING, description: "A robust ffmpeg command to stitch these files" }
  },
  required: ["title", "concept", "scenes", "musicMood", "ffmpegCommand"]
};

export const generateAdPlan = async (
  prompt: string,
  settings: ProjectSettings,
  referenceFiles: ReferenceFile[]
): Promise<any> => {
  if (!genAI) throw new Error("API Key not initialized");

  const model = "gemini-3-pro-preview";
  console.log("Generating Ad Plan with Model:", model);
  
  // Construct Context from RAG (Reference Files)
  let context = "REFERENCE MATERIALS:\n";
  referenceFiles.forEach(file => {
    context += `- File: ${file.name} (${file.type}): ${file.content.substring(0, 500)}...\n`;
  });

  const settingsContext = `
    SETTINGS:
    - Aspect Ratio: ${settings.aspectRatio}
    - Voice Preference: ${settings.preferredVoice}
    - Text Overlays: ${settings.useTextOverlays}
    - Custom Script provided: ${settings.customScript ? "Yes (prioritize this)" : "No"}
    - Custom Music Theme: ${settings.musicTheme}
  `;

  const systemInstruction = `
    You are a world-class AI Creative Director and Producer for a Hollywood-style ad agency. 
    Your goal is to create a cohesive, emotionally resonant, and visually stunning video ad plan.
    
    Constraints:
    1. Total ad length: Max 30 seconds.
    2. Scene duration: MUST be either 4 or 6 seconds exactly. Never 8.
    3. Output strictly structured JSON.
    4. Harness FFmpeg knowledge for the 'ffmpegCommand' field.
    5. If the user provided reference files, strictly adhere to their branding/tone.
    6. If 'useTextOverlays' is 'no', leave textOverlay fields empty.
    
    IMPORTANT: For 'visualPrompt', be extremely descriptive. Use terms like "cinematic lighting", "4k", "slow motion", "depth of field", "photorealistic". 
    Avoid generic descriptions. The video generation model needs high fidelity details.
  `;

  const fullPrompt = `
    ${context}
    ${settingsContext}
    
    USER REQUEST: "${prompt}"
    ${settings.customScript ? `USER SCRIPT: "${settings.customScript}"` : ""}
    
    Generate the ad production plan now.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: adPlanSchema,
        thinkingConfig: { thinkingBudget: 4096 } 
      }
    });

    console.log("Ad Plan Generated:", response.text);
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
  duration: 4 | 6
): Promise<string | null> => {
    if (!genAI || !currentApiKey) throw new Error("API Key not initialized");

    const aspect = aspectRatio === AspectRatio.SixteenNine ? '16:9' : '9:16';
    console.log(`Starting Veo Generation. Prompt: "${visualPrompt.substring(0, 30)}...", Aspect: ${aspect}`);
    
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

        console.log("Veo Operation Started:", operation);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await genAI.operations.getVideosOperation({ operation: operation });
            console.log("Veo Polling...", operation.metadata);
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) {
            console.error("Veo completed but no URI found.");
            return null;
        }

        console.log("Veo URI obtained. Fetching content...");
        
        // Critical Fix: Fetch the video bytes using the key and create a Blob URL.
        // Direct URIs often fail in <video> tags due to auth/CORS.
        const response = await fetch(`${videoUri}&key=${currentApiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log("Video Blob URL created:", blobUrl);
        
        return blobUrl;

    } catch (error) {
        console.error("Veo Generation Error:", error);
        return null;
    }
};


// --- 3. TTS Generation ---

export const generateVoiceover = async (text: string, voice: TTSVoice): Promise<string | null> => {
  if (!genAI) throw new Error("API Key not initialized");
  if (!text) return null;

  console.log(`Generating TTS for: "${text.substring(0, 20)}..." using ${voice}`);

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

// --- 4. Music Generation (Simulated/Placeholder) ---
// Note: Google's GenAI SDK does not currently expose a public 'Music Generation' model (like Lyria) 
// in the standard library. To satisfy the prompt's requirement for a working app, 
// we will simulate this by selecting high-quality royalty-free tracks based on the mood.

const MOOD_TRACKS: Record<string, string> = {
    'upbeat': 'https://cdn.pixabay.com/download/audio/2024/05/20/audio_34b92569de.mp3?filename=uplifting-background-music-for-videos-corporates-presentations-205562.mp3',
    'cinematic': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_5119a9705a.mp3?filename=cinematic-atmosphere-score-2-21142.mp3',
    'emotional': 'https://cdn.pixabay.com/download/audio/2022/05/05/audio_13b5646142.mp3?filename=emotional-piano-110266.mp3',
    'corporate': 'https://cdn.pixabay.com/download/audio/2024/02/07/audio_4f0b2a7585.mp3?filename=corporate-music-189688.mp3',
    'jazz': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_5245842187.mp3?filename=smooth-jazz-110757.mp3'
};

export const generateMusic = async (moodDescription: string): Promise<string> => {
    console.log("Selecting Music for mood:", moodDescription);
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerMood = moodDescription.toLowerCase();
    let selectedTrack = MOOD_TRACKS['cinematic']; // Default

    if (lowerMood.includes('happy') || lowerMood.includes('upbeat') || lowerMood.includes('fun')) selectedTrack = MOOD_TRACKS['upbeat'];
    else if (lowerMood.includes('business') || lowerMood.includes('corporate') || lowerMood.includes('tech')) selectedTrack = MOOD_TRACKS['corporate'];
    else if (lowerMood.includes('sad') || lowerMood.includes('emotional') || lowerMood.includes('touching')) selectedTrack = MOOD_TRACKS['emotional'];
    else if (lowerMood.includes('jazz') || lowerMood.includes('lounge')) selectedTrack = MOOD_TRACKS['jazz'];

    console.log("Music Track Selected:", selectedTrack);
    return selectedTrack;
};

// --- 5. Chat Helper ---
export const sendChatMessage = async (history: any[], message: string) => {
    if (!genAI) throw new Error("API Key not initialized");
    const chat = genAI.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "You are a helpful AI assistant for AdStudio. If the user asks to generate an ad, simply acknowledge and say you are starting the process."
        }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text;
}