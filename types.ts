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

export type ProjectMode = 'Commercial' | 'Music Video' | 'Trippy' | 'Cinematic';

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface ReferenceFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'text' | 'link';
  content: string; // Base64 or Text or URL
  previewUrl?: string;
  mimeType?: string; 
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'link';
  url: string; 
  mimeType: string;
  base64Data: string; 
}

export interface ProjectSettings {
  customScript: string;
  musicTheme: string;
  useTextOverlays: 'yes' | 'no' | 'auto';
  textOverlayFont?: string;
  preferredVoice: TTSVoice | 'auto';
  aspectRatio: AspectRatio;
  mode: ProjectMode;
}

export interface OverlayConfig {
  position: 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large' | 'xl';
}

export interface Scene {
  id: string;
  order: number;
  duration: 4 | 6;
  visualPrompt: string;
  textOverlay: string;
  overlayConfig?: OverlayConfig;
  status: 'pending' | 'generating' | 'complete' | 'failed';
  storyboardUrl?: string; // New: Holds the generated static image
  videoUrl?: string;
}

export interface AdProject {
  title: string;
  concept: string;
  musicMood: string;
  fullScript: string;
  script?: DialogueLine[];
  
  scenes: Scene[];
  voiceoverUrl?: string;
  musicUrl?: string;
  visualAnchor?: string;
  
  ffmpegCommand?: string;
  isGenerating: boolean;
  // Added 'storyboarding' phase
  currentPhase: 'planning' | 'storyboarding' | 'video_production' | 'voiceover' | 'scoring' | 'mixing' | 'ready';
  mode?: ProjectMode;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  attachments?: ChatAttachment[]; 
}