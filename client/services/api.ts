import { AdProject, ProjectSettings, ReferenceFile, TTSVoice, Scene, DialogueLine, ChatAttachment, AspectRatio } from "../types";

const API_BASE = '/api';

export const generateAdPlan = async (
    prompt: string,
    settings: ProjectSettings,
    referenceFiles: ReferenceFile[]
): Promise<any> => {
    const response = await fetch(`${API_BASE}/generate/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, settings, referenceFiles })
    });
    if (!response.ok) throw new Error('Failed to generate plan');
    return response.json();
};

export const generateStoryboardImage = async (
    scene: Scene,
    aspectRatio: AspectRatio,
    visualAnchorDataUrl?: string,
): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, aspectRatio, visualAnchorDataUrl })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const generateVideoClip = async (
    scene: Scene,
    aspectRatio: AspectRatio,
    sourceImageDataUrl?: string
): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, aspectRatio, sourceImageDataUrl })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const generateVoiceover = async (text: string, voice: TTSVoice, dialogue?: DialogueLine[]): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/voiceover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, dialogue })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const generateMusic = async (moodDescription: string, durationSeconds: number = 30): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodDescription, duration: durationSeconds })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const sendChatMessage = async (
    history: any[],
    message: string,
    project?: AdProject,
    attachments?: ChatAttachment[]
) => {
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message, attachments })
    });
    if (!response.ok) throw new Error('Chat failed');
    const data = await response.json();
    return data.text;
}

// --- Project Persistence ---

export const getProjects = async (): Promise<AdProject[]> => {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) return [];
    return response.json();
};

export const getProjectById = async (id: string): Promise<AdProject | null> => {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) return null;
    return response.json();
};

export const saveProject = async (project: AdProject): Promise<{ id: string, message: string }> => {
    const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error('Failed to save project');
    return response.json();
};
