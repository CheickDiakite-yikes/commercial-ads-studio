export enum AspectRatio {
  SixteenNine = '16:9',
  NineSixteen = '9:16',
}

export enum TTSVoice {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  Aoede = 'Aoede'
}

export interface ReferenceFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'text';
  content: string;
  previewUrl?: string;
}

export interface ProjectSettings {
  customScript: string;
  musicTheme: string;
  useTextOverlays: 'yes' | 'no' | 'auto';
  textOverlayFont?: string;
  preferredVoice: TTSVoice | 'auto';
  aspectRatio: AspectRatio;
}

export interface Scene {
  id: string;
  order: number;
  duration: 4 | 6; // Veo 3 constraints
  visualPrompt: string;
  textOverlay: string; // Text is still per-scene
  status: 'pending' | 'generating' | 'complete' | 'failed';
  videoUrl?: string; // The video blob
}

export interface AdProject {
  title: string;
  concept: string;
  musicMood: string;
  fullScript: string; // The cohesive script for the whole ad
  
  // Assets
  scenes: Scene[];
  voiceoverUrl?: string; // Single audio file for the whole ad
  musicUrl?: string;     // Single audio file for the whole ad
  
  // State
  ffmpegCommand?: string;
  isGenerating: boolean;
  currentPhase: 'planning' | 'video_production' | 'voiceover' | 'scoring' | 'mixing' | 'ready';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}