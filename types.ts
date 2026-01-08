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

export enum VideoResolution {
  HD = '720p',
  FHD = '1080p'
}

export interface ReferenceFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'text';
  content: string; // Base64 or text content
  previewUrl?: string;
}

export interface ProjectSettings {
  customScript: string;
  musicTheme: string; // Or specific upload
  useTextOverlays: 'yes' | 'no' | 'auto';
  textOverlayFont?: string;
  preferredVoice: TTSVoice | 'auto';
  aspectRatio: AspectRatio;
}

export interface Scene {
  id: string;
  order: number;
  duration: 4 | 6; // Veo 3 constraints for this app
  visualPrompt: string; // For Veo
  scriptLine: string; // For TTS
  textOverlay: string; 
  status: 'pending' | 'generating_video' | 'generating_audio' | 'complete' | 'failed';
  videoUrl?: string; // Result from Veo
  audioUrl?: string; // Result from TTS
  thumbnail?: string;
}

export interface AdProject {
  title: string;
  concept: string;
  musicMood: string;
  musicUrl?: string; // Added music URL
  ffmpegCommand?: string; // Generated FFmpeg command
  scenes: Scene[];
  isGenerating: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}