import React, { useState, useEffect, useRef } from 'react';
import { AdProject, AspectRatio, ChatMessage, ProjectSettings, ReferenceFile, TTSVoice, OverlayConfig, ProjectMode, ChatAttachment, Scene } from './types';
import * as ApiService from './services/api';
import { ProjectBrowser } from './components/ProjectBrowser';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { ArrowUpCircle, Film, Layers, Settings, FileText, Music, Mic, X, Plus, Play, Download, MessageSquare, Loader2, Pause, CheckCircle2, Menu, ImagePlus, User, Eye, Sparkles, Paperclip, FileImage, FileVideo, Link as LinkIcon, Youtube, Image as ImageIcon, VenetianMask, Palette, Video, Camera, Shirt, Sun, ChevronDown, ChevronUp, LogOut } from 'lucide-react';

// --- Reference Manager (Left Panel) ---
const ReferenceManager: React.FC<{
    files: ReferenceFile[];
    setFiles: React.Dispatch<React.SetStateAction<ReferenceFile[]>>;
    visualAnchor: ReferenceFile | null;
    setVisualAnchor: React.Dispatch<React.SetStateAction<ReferenceFile | null>>;
}> = ({ files, setFiles, visualAnchor, setVisualAnchor }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const anchorInputRef = useRef<HTMLInputElement>(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAnchor: boolean = false) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                const mimeType = result.match(/^data:(.+);base64/)?.[1];

                const newFile: ReferenceFile = {
                    id: Date.now().toString(),
                    name: file.name,
                    type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'text',
                    content: result,
                    previewUrl: file.type.includes('image') ? URL.createObjectURL(file) : undefined,
                    mimeType: mimeType
                };
                if (isAnchor) {
                    setVisualAnchor(newFile);
                } else {
                    setFiles(prev => [...prev, newFile]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const addLink = () => {
        if (!linkUrl.trim()) return;
        const newFile: ReferenceFile = {
            id: Date.now().toString(),
            name: linkUrl,
            type: 'link',
            content: linkUrl
        };
        setFiles(prev => [...prev, newFile]);
        setLinkUrl('');
        setShowLinkInput(false);
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-8 custom-scrollbar">
            {/* Visual Anchor Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-violet-300/70 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} className="text-violet-400" /> Visual Anchor
                    </h2>
                    {visualAnchor && (
                        <button
                            onClick={() => setVisualAnchor(null)}
                            className="text-xs text-red-400 hover:text-red-500 font-bold"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div
                    onClick={() => anchorInputRef.current?.click()}
                    className={`
                relative h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group
                ${visualAnchor
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-white/10 hover:border-pink-500/50 hover:bg-white/5 bg-black/20'}
            `}
                >
                    <input type="file" ref={anchorInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />

                    {visualAnchor ? (
                        <>
                            <img src={visualAnchor.previewUrl} alt="Anchor" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm">Change Anchor</span>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-2 group-hover:text-pink-400 transition-colors">
                            <ImagePlus size={32} />
                            <span className="text-xs font-bold text-center px-4">Upload Character or<br />Product Reference</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-white/40 leading-tight">
                    This image will be used as a strict visual reference for <strong>every</strong> generated scene to ensure consistency.
                </p>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* General Assets Section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-display font-bold text-white">Assets</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowLinkInput(!showLinkInput)}
                            className="p-2 bg-white/5 text-white/60 rounded-full hover:bg-pink-500 hover:text-white transition-all shadow-sm border border-white/10"
                            title="Add Link"
                        >
                            <LinkIcon size={20} />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white text-black rounded-full hover:bg-pink-500 hover:text-white transition-all shadow-lg hover:shadow-pink-500/50"
                            title="Upload File"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,text/plain" onChange={(e) => handleFileUpload(e, false)} />
                </div>

                {/* Link Input Drawer */}
                {showLinkInput && (
                    <div className="mb-4 bg-black/40 p-2 rounded-xl border border-pink-500/30 shadow-sm flex gap-2 animate-in slide-in-from-top-2 backdrop-blur-sm">
                        <input
                            type="text"
                            placeholder="Paste YouTube or Web URL..."
                            className="flex-1 text-sm outline-none px-2 bg-transparent text-white placeholder:text-white/20"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addLink()}
                        />
                        <button onClick={addLink} className="bg-pink-500 hover:bg-pink-400 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors">Add</button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {files.length === 0 && (
                        <div className="text-white/20 text-sm text-center mt-10 italic">No general assets uploaded.</div>
                    )}
                    {files.map(file => (
                        <div key={file.id} className="glass-panel p-3 rounded-xl relative group hover:bg-white/10 transition-colors border border-white/5">
                            <button
                                onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-400"
                            >
                                <X size={12} />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-black/30 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                                    {file.type === 'image' && file.previewUrl ? <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" /> :
                                        file.type === 'link' ? <Youtube className="text-red-500" /> : <FileText className="text-white/40" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white/90 truncate">{file.name}</p>
                                    <p className="text-xs text-white/40 uppercase">{file.type}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SettingsPanel: React.FC<{
    settings: ProjectSettings;
    setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
}> = ({ settings, setSettings }) => {
    return (
        <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Studio Settings</h2>

            {/* Project Mode Selector */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-violet-300/70 uppercase tracking-wider flex items-center gap-2"><Sparkles size={14} className="text-violet-400" /> Project Mode</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Commercial', 'Music Video', 'Trippy', 'Cinematic'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setSettings(prev => ({ ...prev, mode: mode as ProjectMode }))}
                            className={`p-2 text-xs font-bold rounded-lg border transition-all ${settings.mode === mode ? 'border-purple-500/50 bg-purple-500/20 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold text-rose-300/70 uppercase tracking-wider flex items-center gap-2"><Film size={14} className="text-rose-400" /> Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-3">
                    {(Object.values(AspectRatio) as AspectRatio[]).map(ratio => (
                        <button
                            key={ratio}
                            onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio }))}
                            className={`p-3 rounded-xl border font-bold text-sm transition-all ${settings.aspectRatio === ratio ? 'border-pink-500/50 bg-pink-500/20 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5'}`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <label className="text-xs font-bold text-sky-300/70 uppercase tracking-wider flex items-center gap-2"><Mic size={14} className="text-sky-400" /> Voice</label>
                <select
                    className="w-full p-3 rounded-xl border border-white/10 bg-black/40 text-white focus:border-pink-500/50 outline-none appearance-none"
                    value={settings.preferredVoice}
                    onChange={(e) => setSettings(prev => ({ ...prev, preferredVoice: e.target.value as TTSVoice | 'auto' }))}
                >
                    <option value="auto" className="bg-slate-900">Let AI Decide</option>
                    {Object.values(TTSVoice).map(voice => <option key={voice} value={voice} className="bg-slate-900">{voice}</option>)}
                </select>
            </div>
            <div className="space-y-3">
                <label className="text-xs font-bold text-amber-300/70 uppercase tracking-wider flex items-center gap-2"><Layers size={14} className="text-amber-400" /> Text Overlays</label>
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                    {['yes', 'auto', 'no'].map((opt) => (
                        <button key={opt} onClick={() => setSettings(prev => ({ ...prev, useTextOverlays: opt as any }))} className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${settings.useTextOverlays === opt ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-white/30 hover:text-white/60'}`}>{opt}</button>
                    ))}
                </div>
                <div className="min-h-[48px]">
                    {settings.useTextOverlays !== 'no' && (
                        <input type="text" placeholder="Preferred Font (Optional)" className="w-full p-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm focus:border-pink-500/50 outline-none placeholder:text-white/20" value={settings.textOverlayFont || ''} onChange={(e) => setSettings(prev => ({ ...prev, textOverlayFont: e.target.value }))} />
                    )}
                </div>
            </div>
            <div className="space-y-3">
                <label className="text-xs font-bold text-fuchsia-300/70 uppercase tracking-wider flex items-center gap-2"><Music size={14} className="text-fuchsia-400" /> Music Theme</label>
                <input type="text" placeholder="e.g., Upbeat..." className="w-full p-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm focus:border-pink-500/50 outline-none placeholder:text-white/20" value={settings.musicTheme} onChange={(e) => setSettings(prev => ({ ...prev, musicTheme: e.target.value }))} />
            </div>
            <div className="space-y-3">
                <label className="text-xs font-bold text-emerald-300/70 uppercase tracking-wider flex items-center gap-2"><FileText size={14} className="text-emerald-400" /> Custom Script</label>
                <textarea placeholder="Enter lines..." className="w-full p-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm h-32 resize-none focus:border-pink-500/50 outline-none placeholder:text-white/20" value={settings.customScript} onChange={(e) => setSettings(prev => ({ ...prev, customScript: e.target.value }))} />
            </div>
        </div>
    );
};
const getOverlayClasses = (config?: OverlayConfig) => {
    const pos = config?.position || 'center';
    const size = config?.size || 'large';
    let containerClasses = "absolute inset-0 pointer-events-none flex p-8 md:p-16 z-20 transition-all duration-500";
    let textClasses = "font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight";
    switch (pos) {
        case 'top-left': containerClasses += " items-start justify-start text-left"; break;
        case 'top-right': containerClasses += " items-start justify-end text-right"; break;
        case 'bottom-left': containerClasses += " items-end justify-start text-left"; break;
        case 'bottom-right': containerClasses += " items-end justify-end text-right"; break;
        case 'top': containerClasses += " items-start justify-center text-center"; break;
        case 'bottom': containerClasses += " items-end justify-center text-center"; break;
        case 'center': default: containerClasses += " items-center justify-center text-center"; break;
    }
    switch (size) {
        case 'small': textClasses += " text-lg md:text-2xl max-w-sm"; break;
        case 'medium': textClasses += " text-2xl md:text-4xl max-w-xl"; break;
        case 'xl': textClasses += " text-5xl md:text-7xl max-w-4xl"; break;
        case 'large': default: textClasses += " text-3xl md:text-5xl max-w-3xl"; break;
    }
    return { containerClasses, textClasses };
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, textAlign: CanvasTextAlign) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    ctx.textAlign = textAlign;
    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), x, y + (i * lineHeight));
    });
};

const drawTextOverlayToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, text: string, config?: OverlayConfig) => {
    if (!text) return;
    const pos = config?.position || 'center';
    const size = config?.size || 'large';
    const scale = width < height ? width / 720 : height / 720;
    let fontSize = 48;
    switch (size) {
        case 'small': fontSize = 24; break;
        case 'medium': fontSize = 36; break;
        case 'xl': fontSize = 72; break;
        case 'large': default: fontSize = 48; break;
    }
    fontSize = fontSize * scale;
    ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    const padding = 64 * scale;
    const lineHeight = fontSize * 1.2;
    const maxWidth = width * 0.8;
    let x = width / 2;
    let y = height / 2;
    let align: CanvasTextAlign = 'center';
    switch (pos) {
        case 'top-left': x = padding; y = padding + fontSize; align = 'left'; break;
        case 'top-right': x = width - padding; y = padding + fontSize; align = 'right'; break;
        case 'bottom-left': x = padding; y = height - padding - (lineHeight * 2); align = 'left'; break;
        case 'bottom-right': x = width - padding; y = height - padding - (lineHeight * 2); align = 'right'; break;
        case 'top': x = width / 2; y = padding + fontSize; align = 'center'; break;
        case 'bottom': x = width / 2; y = height - padding - (lineHeight * 2); align = 'center'; break;
        case 'center': default: x = width / 2; y = height / 2; align = 'center'; break;
    }
    wrapText(ctx, text, x, y, maxWidth, lineHeight, align);
};


// --- Middle Panel: Advanced Sequencer Player ---
const ProjectBoard: React.FC<{
    project: AdProject | null;
    setProject: React.Dispatch<React.SetStateAction<AdProject | null>>;
    settings: ProjectSettings;
}> = ({ project, setProject, settings }) => {
    const [activeTab, setActiveTab] = useState<'output' | 'ingredients'>('output');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [activeSceneIndex, setActiveSceneIndex] = useState(0);

    const musicRef = useRef<HTMLAudioElement>(null);
    const voRef = useRef<HTMLAudioElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const totalDuration = project?.scenes?.reduce((acc, scene) => acc + scene.duration, 0) || 0;

    useEffect(() => {
        if (!project || !project.scenes) return; // FIX CRASH HERE
        let animationFrameId: number;
        let lastTime = performance.now();

        const loop = () => {
            const now = performance.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            if (isPlaying && totalDuration > 0) {
                setCurrentTime(prev => {
                    const next = prev + dt;
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        if (isExporting) stopExport();
                        return 0;
                    }
                    return next;
                });

                if (isExporting && canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    const vid = videoRefs.current[activeSceneIndex];
                    if (ctx && vid) {
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        try {
                            ctx.drawImage(vid, 0, 0, ctx.canvas.width, ctx.canvas.height);
                        } catch (e) { }
                        const scene = project?.scenes[activeSceneIndex];
                        if (scene?.textOverlay) {
                            drawTextOverlayToCanvas(ctx, ctx.canvas.width, ctx.canvas.height, scene.textOverlay, scene.overlayConfig);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        if (isPlaying) {
            lastTime = performance.now();
            loop();
        } else {
            cancelAnimationFrame(animationFrameId);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, totalDuration, isExporting, activeSceneIndex, project]);

    useEffect(() => {
        if (!project || !project.scenes) return; // FIX: Ensure scenes exist
        let accumulatedTime = 0;
        let newIndex = 0;
        for (let i = 0; i < project.scenes.length; i++) {
            if (currentTime >= accumulatedTime && currentTime < accumulatedTime + project.scenes[i].duration) {
                newIndex = i;
                break;
            }
            accumulatedTime += project.scenes[i].duration;
        }
        setActiveSceneIndex(newIndex);

        videoRefs.current.forEach((vid, idx) => {
            if (!vid) return;
            if (isPlaying && vid.paused) {
                vid.play().catch(() => { });
            } else if (!isPlaying && !vid.paused) {
                vid.pause();
            }
            if (idx === newIndex) {
                vid.style.opacity = '1';
                vid.style.zIndex = '10';
            } else {
                vid.style.opacity = '0';
                vid.style.zIndex = '0';
            }
        });
    }, [currentTime, project, isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            if (musicRef.current && project?.musicUrl) musicRef.current.play().catch(e => console.log('Music play blocked', e));
            if (voRef.current && project?.voiceoverUrl) voRef.current.play().catch(e => console.log('VO play blocked', e));
        } else {
            musicRef.current?.pause();
            voRef.current?.pause();
        }
    }, [isPlaying, project]);

    const handleExport = async () => {
        if (!canvasRef.current || !project) return;
        setIsExporting(true);
        setCurrentTime(0);
        chunksRef.current = [];

        const Actx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Actx();
        audioCtxRef.current = ctx;
        const dest = ctx.createMediaStreamDestination();

        if (musicRef.current) {
            try {
                const source = ctx.createMediaElementSource(musicRef.current);
                source.connect(dest);
                source.connect(ctx.destination);
            } catch (e) { console.warn("Audio node reuse issue", e); }
        }
        if (voRef.current) {
            try {
                const source = ctx.createMediaElementSource(voRef.current);
                source.connect(dest);
                source.connect(ctx.destination);
            } catch (e) { console.warn("Audio node reuse issue", e); }
        }

        const canvasStream = canvasRef.current.captureStream(30);
        const combinedTracks = [...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
        const combinedStream = new MediaStream(combinedTracks);

        let mimeType = 'video/webm;codecs=vp9';
        if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';
        else if (MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm';

        const recorder = new MediaRecorder(combinedStream, { mimeType });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            a.download = `${project.title.replace(/\s+/g, '_')}_final_mix.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setIsExporting(false);
            if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsPlaying(true);
    };

    const stopExport = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
        setIsPlaying(false);
    };

    const handleAudioError = (source: string, e: any) => {
        console.error(`${source} Playback Error:`, e.message, e.target?.src);
    };

    if (!project) {
        return (
            <div className="h-full flex items-center justify-center text-slate-400 font-display">
                <div className="text-center">
                    <Film size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with the Agent<br />to generate a project.</p>
                </div>
            </div>
        );
    }

    const formatTime = (time: number) => {
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const activeScene = project.scenes[activeSceneIndex];
    const overlayConfig = activeScene?.overlayConfig;
    const { containerClasses, textClasses } = getOverlayClasses(overlayConfig);
    const canvasW = settings.aspectRatio === AspectRatio.SixteenNine ? 1280 : 720;
    const canvasH = settings.aspectRatio === AspectRatio.SixteenNine ? 720 : 1280;

    return (
        <div className="h-full flex flex-col text-white">
            <canvas ref={canvasRef} width={canvasW} height={canvasH} className="hidden absolute pointer-events-none" />

            {/* Glowing Tabs */}
            <div className="flex border-b border-white/10 relative">
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
                <button
                    onClick={() => setActiveTab('output')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 relative
                    ${activeTab === 'output' ? 'text-white' : 'text-white/40 hover:text-white/70'}
                    `}
                >
                    Final Output
                    {activeTab === 'output' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 relative
                    ${activeTab === 'ingredients' ? 'text-white' : 'text-white/40 hover:text-white/70'}
                    `}
                >
                    Director's View
                    {activeTab === 'ingredients' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 shadow-[0_0_10px_#14b8a6]" />
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
                {/* Generating Loading State */}
                {project.isGenerating && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-white/10 m-4">
                        <div className="max-w-md w-full space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full" />
                                <Loader2 className="animate-spin text-pink-400 relative z-10 mx-auto" size={48} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white tracking-tight">Production In Progress</h3>
                            <div className="space-y-3">
                                {['planning', 'storyboarding', 'video_production', 'voiceover', 'scoring', 'mixing', 'ready'].map((phase, i) => {
                                    const labels: any = { planning: 'Creative Brief', storyboarding: 'Storyboards', video_production: 'Video Generation', voiceover: 'Voice Recording', scoring: 'Music Composition', mixing: 'Final Mix', ready: 'Ready' };
                                    const isActive = project.currentPhase === phase;
                                    const isDone = ['planning', 'storyboarding', 'video_production', 'voiceover', 'scoring', 'mixing', 'ready'].indexOf(project.currentPhase) > i;
                                    return (
                                        <div key={phase} className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${isActive ? 'bg-pink-500/10 border-pink-500/30 text-white' : 'bg-transparent border-transparent text-white/30'}`}>
                                            {isDone ? <CheckCircle2 className="text-green-400" size={20} /> : <div className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-pink-500 animate-pulse' : 'border-white/10'}`} />}
                                            <span className="font-medium text-sm">{labels[phase]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Exporting Loading State */}
                {isExporting && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white">
                        <Loader2 className="animate-spin text-pink-500 mx-auto mb-4" size={48} />
                        <h3 className="text-2xl font-display font-bold">Rendering Final Mix...</h3>
                        <div className="mt-4 font-mono text-xl text-pink-400">{formatTime(currentTime)} / {formatTime(totalDuration)}</div>
                    </div>
                )}

                {activeTab === 'output' ? (
                    <div className="flex flex-col items-center h-full max-w-5xl mx-auto">
                        {project.musicUrl && <audio key={project.musicUrl} ref={musicRef} src={project.musicUrl} crossOrigin="anonymous" onError={(e) => handleAudioError("Music", e)} onLoadedMetadata={(e) => { e.currentTarget.volume = 0.6; }} />}
                        {project.voiceoverUrl && <audio key={project.voiceoverUrl} ref={voRef} src={project.voiceoverUrl} crossOrigin="anonymous" onError={(e) => handleAudioError("Voice", e)} onLoadedMetadata={(e) => { e.currentTarget.volume = 1.0; }} />}

                        {/* Title Section */}
                        <div className="text-center mb-6 space-y-2">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 drop-shadow-sm">
                                {project.title}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-sm text-pink-200/60 font-medium tracking-wide uppercase">
                                <span>{project.mode || 'Commercial'}</span>
                                <span className="w-1 h-1 rounded-full bg-pink-500" />
                                <span>{formatTime(totalDuration)}</span>
                            </div>
                        </div>

                        {/* Device Frame / Player */}
                        <div className={`relative p-2 rounded-3xl glass-panel shadow-2xl transition-all duration-500
                            ${settings.aspectRatio === '16:9' ? 'w-full aspect-video max-w-4xl' : 'h-[60vh] md:h-[650px] aspect-[9/16]'}
                        `}>
                            {/* Glossy Reflection overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20" />

                            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black ring-1 ring-white/10">
                                {project.scenes.map((scene, idx) => (
                                    <React.Fragment key={scene.id}>
                                        {scene.storyboardUrl && !scene.videoUrl && (
                                            <img src={scene.storyboardUrl} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out" style={{ opacity: idx === 0 ? 1 : 0, zIndex: idx === 0 ? 5 : 0 }} />
                                        )}
                                        <video preload="auto" ref={(el) => { videoRefs.current[idx] = el; }} src={scene.videoUrl} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out" style={{ opacity: idx === 0 ? 1 : 0, zIndex: idx === 0 ? 10 : 0 }} muted playsInline loop crossOrigin="anonymous" />
                                    </React.Fragment>
                                ))}
                                <div className={containerClasses}><h2 className={textClasses}>{activeScene?.textOverlay}</h2></div>
                            </div>
                        </div>

                        {/* Control Bar (Glassmorphism Pill) */}
                        <div className="w-full mt-8 glass-panel rounded-2xl p-4 flex flex-col items-center gap-4 z-10 max-w-2xl backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                            {/* Scrubber */}
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative group cursor-pointer hover:h-3 transition-all">
                                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_15px_#ec4899] transition-all duration-100 ease-linear" style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }} />
                            </div>

                            <div className="w-full flex items-center justify-between px-2">
                                <span className="font-mono text-xs font-bold text-white/50">{formatTime(currentTime)}</span>

                                <div className="flex items-center gap-6">
                                    <button onClick={() => setCurrentTime(0)} className="text-white/50 hover:text-white transition-colors"><Layers size={20} className="rotate-180" /></button>

                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        disabled={isExporting}
                                        className="w-14 h-14 flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                    </button>

                                    <button onClick={handleExport} disabled={isExporting} className="text-white/50 hover:text-white transition-colors">
                                        <Download size={20} />
                                    </button>
                                </div>

                                <span className="font-mono text-xs font-bold text-white/50">{formatTime(totalDuration)}</span>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                                <VenetianMask className="text-purple-500" />
                                Director's Breakdown
                            </h3>
                            <p className="text-sm text-slate-500">
                                The AI Agent has deconstructed the video into granular technical components to ensure maximum consistency across scenes.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {project.scenes.map((scene, idx) => (
                                <div key={scene.id} className="relative group">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                                        <h4 className="font-bold text-slate-700">Scene {idx + 1} ({scene.duration}s)</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* VISUAL */}
                                        <div className="md:col-span-4 lg:col-span-3">
                                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
                                                {scene.videoUrl ? (
                                                    <video src={scene.videoUrl} className="w-full h-full object-cover" />
                                                ) : scene.storyboardUrl ? (
                                                    <img src={scene.storyboardUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                                                )}
                                                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg">
                                                    <p className="text-[10px] text-white/90 line-clamp-2">{scene.visual_summary_prompt}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* INGREDIENTS */}
                                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Camera Card */}
                                            <div className="glass-panel p-3 rounded-xl hover:bg-sky-500/10 transition-colors border border-sky-500/20">
                                                <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider mb-2">
                                                    <Camera size={14} className="text-sky-400" /> Camera
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-white/70"><span className="font-bold text-sky-200">Framing:</span> {scene.camera.framing}</p>
                                                    <p className="text-xs text-white/70"><span className="font-bold text-sky-200">Move:</span> {scene.camera.movement}</p>
                                                </div>
                                            </div>

                                            {/* Lighting Card */}
                                            <div className="glass-panel p-3 rounded-xl hover:bg-amber-500/10 transition-colors border border-amber-500/20">
                                                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
                                                    <Sun size={14} className="text-amber-400" /> Lighting & Env
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-white/70"><span className="font-bold text-amber-200">Light:</span> {scene.environment.lighting}</p>
                                                    <p className="text-xs text-white/70"><span className="font-bold text-amber-200">Loc:</span> {scene.environment.location}</p>
                                                </div>
                                            </div>

                                            {/* Wardrobe Card */}
                                            <div className="glass-panel p-3 rounded-xl hover:bg-violet-500/10 transition-colors border border-violet-500/20">
                                                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
                                                    <Shirt size={14} className="text-violet-400" /> Character
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-white/70 line-clamp-2">{scene.character.description}</p>
                                                    <p className="text-[10px] text-violet-300 font-mono mt-1 bg-violet-500/20 p-1 rounded inline-block border border-violet-500/30">
                                                        Wearing: {scene.character.wardrobe}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Card */}
                                            <div className="glass-panel p-3 rounded-xl hover:bg-emerald-500/10 transition-colors border border-emerald-500/20">
                                                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
                                                    <Video size={14} className="text-emerald-400" /> Action Blocking
                                                </div>
                                                <ul className="text-xs text-white/60 list-disc list-inside space-y-1">
                                                    {scene.action_blocking.map((action, i) => (
                                                        <li key={i}>{action.notes}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

const AgentChat: React.FC<{
    onGenerate: (prompt: string, attachments?: ChatAttachment[]) => void;
    isProcessing: boolean;
    project: AdProject | null;
}> = ({ onGenerate, isProcessing, project }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Hello! I am your AI Creative Director. Tell me about the ad you want to create.', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if ((!input.trim() && attachments.length === 0) || isProcessing) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now(),
            attachments: [...attachments]
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAttachments([]);

        // Check if we should generate a project
        const isGenerationRequest = input.toLowerCase().includes('generate') || input.toLowerCase().includes('create') || input.toLowerCase().includes('make a video');

        if (isGenerationRequest && !project) {
            // Trigger generation
            const thinkingMsg: ChatMessage = { id: 'thinking', role: 'model', text: 'Developing creative concept...', timestamp: Date.now(), isThinking: true };
            setMessages(prev => [...prev, thinkingMsg]);

            await onGenerate(input, userMsg.attachments);

            setMessages(prev => prev.filter(m => m.id !== 'thinking').concat({
                id: Date.now().toString(),
                role: 'model',
                text: "I've drafted a creative brief and storyboard based on your request. Check out the project board!",
                timestamp: Date.now()
            }));
        } else {
            // Normal Chat
            const thinkingMsg: ChatMessage = { id: 'thinking', role: 'model', text: 'Thinking...', timestamp: Date.now(), isThinking: true };
            setMessages(prev => [...prev, thinkingMsg]);

            try {
                const history = messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

                const response = await ApiService.sendChatMessage(history, userMsg.text, project || undefined, userMsg.attachments);

                setMessages(prev => prev.filter(m => m.id !== 'thinking').concat({
                    id: Date.now().toString(),
                    role: 'model',
                    text: response || "I'm not sure how to respond to that.",
                    timestamp: Date.now()
                }));
            } catch (e) {
                setMessages(prev => prev.filter(m => m.id !== 'thinking').concat({
                    id: Date.now().toString(),
                    role: 'model',
                    text: "Sorry, I encountered an error.",
                    timestamp: Date.now()
                }));
            }
        }
    };

    const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                const base64 = result.split(',')[1];
                const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'link';

                const newAtt: ChatAttachment = {
                    id: Date.now().toString(),
                    type: type as any,
                    url: URL.createObjectURL(file), // Preview URL
                    mimeType: file.type,
                    base64Data: base64
                };
                setAttachments(prev => [...prev, newAtt]);
            };
            reader.readAsDataURL(file);
        }
    }

    const addLink = () => {
        if (!linkUrl.trim()) return;
        const newAtt: ChatAttachment = {
            id: Date.now().toString(),
            type: 'link',
            url: linkUrl,
            mimeType: 'text/uri-list',
            base64Data: ''
        };
        setAttachments(prev => [...prev, newAtt]);
        setLinkUrl('');
        setShowLinkInput(false);
    };

    return (
        <div className={`
        fixed bottom-1 right-1 left-1 lg:left-auto lg:bottom-6 lg:right-6 lg:w-96 
        glass-panel z-[1000] 
        flex flex-col overflow-hidden transition-all duration-300 shadow-2xl
        ${isOpen ? 'h-[50vh] lg:h-[600px] border border-white/10 rounded-3xl' : 'h-14 lg:h-14 w-auto rounded-full cursor-pointer hover:bg-white/10 border-none'}
        `}>
            {/* Header */}
            <div
                className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white flex justify-between items-center cursor-pointer hover:saturate-150 transition-all border-b border-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
                    <span className="font-bold text-sm tracking-wide">AI Creative Director</span>
                </div>
                <div className="flex items-center gap-2">
                    {isProcessing && <Loader2 size={16} className="animate-spin text-white" />}
                    {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 custom-scrollbar">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm box-shadow-md backdrop-blur-md ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-tr-none shadow-[0_4px_15px_rgba(236,72,153,0.3)]' : 'bg-white/10 border border-white/10 text-white/90 rounded-tl-none'}`}>
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mb-2 flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                                    {msg.attachments.map(att => (
                                        <div key={att.id} className="relative group shrink-0">
                                            {att.type === 'image' ? (
                                                <img src={att.url} className="w-16 h-16 object-cover rounded-lg border border-white/20" />
                                            ) : att.type === 'video' ? (
                                                <video src={att.url} className="w-16 h-16 object-cover rounded-lg border border-white/20" muted />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-red-400 border border-white/10">
                                                    <Youtube size={24} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {msg.isThinking ? (
                                <div className="flex gap-1 items-center px-1">
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-150" />
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white/5 border-t border-white/10 backdrop-blur-xl">
                {showLinkInput && (
                    <div className="flex gap-2 mb-2 animate-in slide-in-from-bottom-2">
                        <input
                            type="text"
                            placeholder="Paste YouTube or Web URL..."
                            className="flex-1 bg-black/40 text-white rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500 border border-white/10"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addLink()}
                        />
                        <button onClick={addLink} className="bg-pink-500 text-white px-3 rounded-lg text-xs font-bold hover:bg-pink-400">Add</button>
                        <button onClick={() => setShowLinkInput(false)} className="bg-white/10 text-white/60 px-2 rounded-lg hover:text-white"><X size={14} /></button>
                    </div>
                )}

                {attachments.length > 0 && (
                    <div className="flex gap-2 mb-2 px-2 overflow-x-auto custom-scrollbar">
                        {attachments.map(att => (
                            <div key={att.id} className="relative group shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-black/40 overflow-hidden border border-white/10 flex items-center justify-center">
                                    {att.type === 'image' ? (
                                        <img src={att.url} className="w-full h-full object-cover" />
                                    ) : att.type === 'video' ? (
                                        <video src={att.url} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <LinkIcon size={16} className="text-white/60" />
                                    )}
                                </div>
                                <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowLinkInput(!showLinkInput)} className="p-2 text-white/50 hover:text-pink-400 hover:bg-white/10 rounded-full transition-colors">
                        <LinkIcon size={20} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/50 hover:text-pink-400 hover:bg-white/10 rounded-full transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleAttachment} />

                    <input
                        className="flex-1 bg-black/40 text-white border border-white/10 rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-pink-500 outline-none placeholder:text-white/30 transition-all font-medium"
                        placeholder="Describe your ad..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSend}
                        disabled={(!input && attachments.length === 0) || isProcessing}
                        className="p-2 bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-full hover:shadow-[0_0_15px_#ec4899] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
                    >
                        <ArrowUpCircle size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export const App: React.FC = () => {
    // Auth State
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    // App State
    const [files, setFiles] = useState<ReferenceFile[]>([]);
    const [visualAnchor, setVisualAnchor] = useState<ReferenceFile | null>(null);
    const [settings, setSettings] = useState<ProjectSettings>({
        customScript: '',
        musicTheme: 'Commercial',
        useTextOverlays: 'auto',
        preferredVoice: 'auto',
        aspectRatio: AspectRatio.SixteenNine,
        mode: 'Commercial' as ProjectMode
    });
    const [project, setProject] = useState<AdProject | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [showPortfolio, setShowPortfolio] = useState(false);
    const [hasKey, setHasKey] = useState(false);

    // Check for cached token on load
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleAuthSuccess = (userData: any, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setShowAuthModal(false);
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setProject(null);
    };

    useEffect(() => {
        setHasKey(true);
    }, []);

    // Autosave Project with Thumbnail Logic
    useEffect(() => {
        if (project) {
            const saveTimeout = setTimeout(() => {
                // Find best thumbnail: Frame 1 > Storyboard 1 > Visual Anchor
                const thumb = project.scenes?.[0]?.videoUrl || project.scenes?.[0]?.storyboardUrl || visualAnchor?.content;
                const projectToSave = { ...project, thumbnailUrl: thumb, userId: user?.id }; // Added userId if available

                ApiService.saveProject(projectToSave)
                    .then(res => {
                        console.log('Project autosaved', res.id);
                        // CRITICAL FIX: Update local project ID so subsequent saves are updates, not creates
                        if (!project.id && res.id) {
                            setProject(prev => prev ? { ...prev, id: res.id } : null);
                        }
                    })
                    .catch(err => console.error('Autosave failed', err));
            }, 2000);
            return () => clearTimeout(saveTimeout);
        }
    }, [project, visualAnchor, user]);


    // --- RENDER ---
    if (!user) {
        return (
            <>
                <LandingPage
                    onLoginClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    onSignupClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                />
                {showAuthModal && (
                    <AuthModal
                        mode={authMode}
                        onClose={() => setShowAuthModal(false)}
                        onSuccess={handleAuthSuccess}
                        switchToLogin={() => setAuthMode('login')}
                        switchToSignup={() => setAuthMode('signup')}
                    />
                )}
            </>
        );
    }

    const handleGenerate = async (prompt: string, attachments?: ChatAttachment[]) => {
        setIsProcessing(true);
        try {
            // ... (rest of generation logic remains same)
            // 1. Plan
            const plan = await ApiService.generateAdPlan(prompt, settings, files);

            const newProject: AdProject = {
                ...plan,
                isGenerating: true,
                currentPhase: 'storyboarding',
                scenes: plan.scenes.map((s: any) => ({ ...s, status: 'pending' })),
                mode: settings.mode,
                thumbnailUrl: visualAnchor?.content // Initial thumbnail
            };
            setProject(newProject);

            // ... (rest of logic)
            // 2. Storyboards
            const scenesWithStoryboards = await Promise.all(newProject.scenes.map(async (scene: Scene) => {
                const img = await ApiService.generateStoryboardImage(
                    scene,
                    settings.aspectRatio,
                    visualAnchor?.content,
                    user?.id,
                    newProject.id
                );
                return { ...scene, storyboardUrl: img || undefined, status: 'pending' } as Scene;
            }));

            // Update project with first storyboard as thumbnail if available
            setProject(prev => prev ? {
                ...prev,
                scenes: scenesWithStoryboards as any,
                currentPhase: 'video_production',
                thumbnailUrl: scenesWithStoryboards[0]?.storyboardUrl || prev.thumbnailUrl
            } : null);

            // 3. Videos
            const scenesWithVideo: any[] = [];

            for (const scene of scenesWithStoryboards) {
                setProject(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, status: 'generating' } as Scene : s)
                    };
                });

                const video = await ApiService.generateVideoClip(
                    scene,
                    settings.aspectRatio,
                    scene.storyboardUrl,
                    user?.id,
                    newProject.id
                );

                const updatedScene = { ...scene, videoUrl: video || undefined, status: 'complete' } as Scene;
                scenesWithVideo.push(updatedScene);

                setProject(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        scenes: prev.scenes.map(s => s.id === scene.id ? updatedScene : s) as any,
                        // Update thumbnail to video if it's the first scene
                        thumbnailUrl: (scene.order === 1 && video) ? video : prev.thumbnailUrl
                    };
                });
            }

            // ... (rest of audio logic)
            // 4. Audio
            setProject(prev => prev ? { ...prev, currentPhase: 'voiceover' } : null);
            const vo = await ApiService.generateVoiceover(plan.fullScript, settings.preferredVoice === 'auto' ? TTSVoice.Kore : settings.preferredVoice, plan.script, user?.id, newProject.id);
            setProject(prev => prev ? { ...prev, currentPhase: 'scoring', voiceoverUrl: vo || undefined } : null);

            const music = await ApiService.generateMusic(plan.musicMood || settings.musicTheme, 30, user?.id, newProject.id);
            setProject(prev => prev ? { ...prev, currentPhase: 'ready', musicUrl: music || undefined, isGenerating: false } : null);
            setIsProcessing(false);

        } catch (e) {
            console.error("Generation failed", e);
            setIsProcessing(false);
            setProject(prev => prev ? { ...prev, isGenerating: false } : null);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden cosmic-bg text-white font-sans">
            <header className="h-16 flex items-center justify-between px-4 md:px-6 z-20 relative shrink-0 border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
                {/* Mobile: Left Button opens Assets */}
                <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="lg:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors">
                    <Menu />
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 hidden md:flex bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)] items-center justify-center text-white font-bold font-display">A</div>
                    <span className="text-xl font-display font-bold text-white tracking-tight">AdStudio<span className="text-pink-500">.ai</span></span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mobile Portfolio Button */}
                    <button onClick={() => setShowPortfolio(true)} className="lg:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors">
                        <Layers size={20} />
                    </button>

                    {/* Mobile: Right Button opens Settings */}
                    <button onClick={() => setShowRightPanel(!showRightPanel)} className="lg:hidden p-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors">
                        <Settings />
                    </button>

                    {/* Mobile Sign Out */}
                    <button onClick={handleLogout} className="lg:hidden p-2 text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    <button
                        onClick={() => setShowPortfolio(true)}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-pink-200"
                    >
                        <Layers size={14} /> My Projects
                    </button>
                    <div className="w-8 h-8 bg-white/10 rounded-full overflow-hidden border border-white/20 shadow-md">
                        <img src="https://picsum.photos/100" alt="User" />
                    </div>
                    <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </header>

            {showPortfolio && (
                <ProjectBrowser
                    onClose={() => setShowPortfolio(false)}
                    onLoadProject={(p) => {
                        setProject(p);
                        setSettings((prev) => ({ ...prev, ...p.settings } as any)); // Restore settings
                        setShowPortfolio(false);
                    }}
                />
            )}

            <div className="flex-1 relative overflow-hidden">
                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-4">

                    {/* Left Panel (Reference Manager) - Sliding on Mobile */}
                    <div className={`
                        fixed inset-y-0 left-0 w-80 lg:w-full lg:static lg:col-span-1 
                        glass-panel border-r border-white/10 z-30 transition-transform duration-300 ease-in-out
                        ${showLeftPanel ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="h-full relative pt-16 lg:pt-0">
                            <button onClick={() => setShowLeftPanel(false)} className="lg:hidden absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/60"><X size={16} /></button>
                            <ReferenceManager
                                files={files}
                                setFiles={setFiles}
                                visualAnchor={visualAnchor}
                                setVisualAnchor={setVisualAnchor}
                            />
                        </div>
                    </div>

                    {/* Center Panel (Project Board) */}
                    <div className="col-span-1 lg:col-span-2 relative w-full h-full overflow-hidden">
                        <ProjectBoard project={project} setProject={setProject} settings={settings} />
                    </div>

                    {/* Right Panel (Settings) - Sliding on Mobile */}
                    <div className={`
                        fixed inset-y-0 right-0 w-80 lg:w-full lg:static lg:col-span-1 
                        glass-panel border-l border-white/10 z-30 transition-transform duration-300 ease-in-out
                        ${showRightPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="h-full relative pt-16 lg:pt-0">
                            <button onClick={() => setShowRightPanel(false)} className="lg:hidden absolute top-4 left-4 p-2 bg-white/10 rounded-full text-white/60"><X size={16} /></button>
                            <SettingsPanel settings={settings} setSettings={setSettings} />
                        </div>
                    </div>

                </div>

                {/* Mobile Overlay for panels */}
                {(showLeftPanel || showRightPanel) && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
                        onClick={() => { setShowLeftPanel(false); setShowRightPanel(false); }}
                    />
                )}
            </div>

            {/* Mobile Bottom Padding to prevent content cut-off */}
            <div className="h-24 lg:hidden shrink-0"></div>

            <AgentChat onGenerate={handleGenerate} isProcessing={isProcessing} project={project} />
        </div >
    );
}