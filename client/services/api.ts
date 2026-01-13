import { AdProject, ProjectSettings, ReferenceFile, TTSVoice, Scene, DialogueLine, ChatAttachment, AspectRatio } from "../types";

const API_BASE = 'http://localhost:3005/api';

// --- AUTH ---
export const register = async (userData: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
    }
    return res.json();
};

export const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
    }
    return res.json();
};

// --- AI GENERATION ---

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
    userId?: string,
    projectId?: string
): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, aspectRatio, visualAnchorDataUrl, userId, projectId })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const generateVideoClip = async (
    scene: Scene,
    aspectRatio: AspectRatio,
    sourceImageDataUrl?: string,
    userId?: string,
    projectId?: string
): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, aspectRatio, sourceImageDataUrl, userId, projectId })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const generateVoiceover = async (
    text: string,
    voice: TTSVoice,
    dialogue?: DialogueLine[],
    userId?: string,
    projectId?: string
): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/voiceover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, dialogue, userId, projectId })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.url;
};

export const generateMusic = async (
    moodDescription: string,
    durationSeconds: number = 30,
    userId?: string,
    projectId?: string
): Promise<string | null> => {
    const response = await fetch(`${API_BASE}/generate/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodDescription, duration: durationSeconds, userId, projectId })
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

// --- PROJECTS ---
export const getProjects = async (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${API_BASE}/projects${query}`);
    return res.json();
};

export const getProjectById = async (id: string): Promise<AdProject | null> => {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) return null;
    return response.json();
};

export const deleteProject = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete project');
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
