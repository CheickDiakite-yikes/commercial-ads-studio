import React, { useState, useEffect, useRef } from 'react';
import { AdProject, AspectRatio, ChatMessage, ProjectSettings, ReferenceFile, TTSVoice, OverlayConfig } from './types';
import * as GeminiService from './services/geminiService';
import { ArrowUpCircle, Film, Layers, Settings, FileText, Music, Mic, X, Plus, Play, Download, MessageSquare, Loader2, Pause, CheckCircle2, Menu } from 'lucide-react';

// --- Reference Manager (Left Panel) ---
const ReferenceManager: React.FC<{
  files: ReferenceFile[];
  setFiles: React.Dispatch<React.SetStateAction<ReferenceFile[]>>;
}> = ({ files, setFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: ReferenceFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'text',
          content: event.target?.result as string, 
          previewUrl: file.type.includes('image') ? URL.createObjectURL(file) : undefined
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-slate-800">Assets</h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-slate-900 text-white rounded-full hover:bg-pink-500 transition-colors shadow-lg"
        >
          <Plus size={20} />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,text/plain" />
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {files.length === 0 && (
            <div className="text-slate-400 text-sm text-center mt-10 italic">No assets uploaded.</div>
        )}
        {files.map(file => (
          <div key={file.id} className="memphis-card p-3 rounded-xl relative group">
            <button 
              onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={12} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                {file.type === 'image' && file.previewUrl ? <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" /> : <FileText className="text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 uppercase">{file.type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Settings Panel (Right Panel) ---
const SettingsPanel: React.FC<{
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
}> = ({ settings, setSettings }) => {
  return (
    <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
      <h2 className="text-2xl font-display font-bold text-slate-800">Studio Settings</h2>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aspect Ratio</label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.values(AspectRatio) as AspectRatio[]).map(ratio => (
            <button
              key={ratio}
              onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio }))}
              className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${settings.aspectRatio === ratio ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-[2px_2px_0px_0px_rgba(236,72,153,1)]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Mic size={14} /> Voice</label>
        <select 
          className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-pink-500 outline-none"
          value={settings.preferredVoice}
          onChange={(e) => setSettings(prev => ({ ...prev, preferredVoice: e.target.value as TTSVoice | 'auto' }))}
        >
          <option value="auto">Let AI Decide</option>
          {Object.values(TTSVoice).map(voice => <option key={voice} value={voice}>{voice}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Layers size={14} /> Text Overlays</label>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {['yes', 'auto', 'no'].map((opt) => (
                 <button key={opt} onClick={() => setSettings(prev => ({ ...prev, useTextOverlays: opt as any }))} className={`flex-1 py-2 text-xs font-bold rounded-md capitalize ${settings.useTextOverlays === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{opt}</button>
            ))}
        </div>
        {settings.useTextOverlays !== 'no' && (
            <input type="text" placeholder="Preferred Font (Optional)" className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm" value={settings.textOverlayFont || ''} onChange={(e) => setSettings(prev => ({...prev, textOverlayFont: e.target.value}))} />
        )}
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Music size={14} /> Music Theme</label>
        <input type="text" placeholder="e.g., Upbeat..." className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm" value={settings.musicTheme} onChange={(e) => setSettings(prev => ({...prev, musicTheme: e.target.value}))} />
      </div>
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><FileText size={14} /> Custom Script</label>
        <textarea placeholder="Enter lines..." className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm h-32 resize-none" value={settings.customScript} onChange={(e) => setSettings(prev => ({...prev, customScript: e.target.value}))} />
      </div>
    </div>
  );
};

// --- Helper for Text Overlays ---
const getOverlayClasses = (config?: OverlayConfig) => {
    const pos = config?.position || 'center';
    const size = config?.size || 'large';
    
    // Base classes (with responsive padding safe zones)
    let containerClasses = "absolute inset-0 pointer-events-none flex p-8 md:p-16 z-20 transition-all duration-500";
    let textClasses = "font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight";

    // Position Mapping
    switch(pos) {
        case 'top-left': containerClasses += " items-start justify-start text-left"; break;
        case 'top-right': containerClasses += " items-start justify-end text-right"; break;
        case 'bottom-left': containerClasses += " items-end justify-start text-left"; break;
        case 'bottom-right': containerClasses += " items-end justify-end text-right"; break;
        case 'top': containerClasses += " items-start justify-center text-center"; break;
        case 'bottom': containerClasses += " items-end justify-center text-center"; break;
        case 'center': 
        default: containerClasses += " items-center justify-center text-center"; break;
    }

    // Size Mapping (Relative to viewport)
    // Toned down slightly to ensure it fits better on screens as per user feedback
    switch(size) {
        case 'small': textClasses += " text-lg md:text-2xl max-w-sm"; break;
        case 'medium': textClasses += " text-2xl md:text-4xl max-w-xl"; break;
        case 'xl': textClasses += " text-5xl md:text-7xl max-w-4xl"; break;
        case 'large': 
        default: textClasses += " text-3xl md:text-5xl max-w-3xl"; break;
    }
    
    return { containerClasses, textClasses };
};

// --- Middle Panel: Advanced Sequencer Player ---
const ProjectBoard: React.FC<{
  project: AdProject | null;
  setProject: React.Dispatch<React.SetStateAction<AdProject | null>>;
  settings: ProjectSettings;
}> = ({ project, setProject, settings }) => {
  const [activeTab, setActiveTab] = useState<'output' | 'ingredients'>('output');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Master Sequencer State
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  
  const musicRef = useRef<HTMLAudioElement>(null);
  const voRef = useRef<HTMLAudioElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Calculate Total Duration
  const totalDuration = project ? project.scenes.reduce((acc, scene) => acc + scene.duration, 0) : 0;

  // 1. Playback Loop
  useEffect(() => {
    let interval: number;
    if (isPlaying && totalDuration > 0) {
        interval = window.setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + 0.1; // 100ms ticks
                if (next >= totalDuration) {
                    setIsPlaying(false);
                    return 0;
                }
                return next;
            });
        }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // 2. Sync Active Scene & Video Elements
  useEffect(() => {
    if (!project) return;
    
    // Determine which scene is active based on currentTime
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

    // Sync Video Elements (Opacity Stack Method)
    videoRefs.current.forEach((vid, idx) => {
        if (!vid) return;
        
        // Ensure all videos are attempting to play so they are ready
        // 'loop' is true on the element, so they won't stop
        if (isPlaying && vid.paused) {
             vid.play().catch(() => {});
        } else if (!isPlaying && !vid.paused) {
             vid.pause();
        }

        // Switch visibility using Opacity and Z-Index
        if (idx === newIndex) {
            vid.style.opacity = '1';
            vid.style.zIndex = '10';
        } else {
            vid.style.opacity = '0';
            vid.style.zIndex = '0';
        }
    });

  }, [currentTime, project, isPlaying]);

  // 3. Audio Sync
  useEffect(() => {
    if (isPlaying) {
        if (musicRef.current && project?.musicUrl) {
            musicRef.current.play().catch(e => console.log('Music play blocked', e));
        }
        if (voRef.current && project?.voiceoverUrl) {
            voRef.current.play().catch(e => console.log('VO play blocked', e));
        }
    } else {
        musicRef.current?.pause();
        voRef.current?.pause();
    }
  }, [isPlaying, project]);

  // 4. Reset on stop
  useEffect(() => {
      if (currentTime === 0) {
          if (musicRef.current) musicRef.current.currentTime = 0;
          if (voRef.current) voRef.current.currentTime = 0;
          
          // Reset all videos to start
          videoRefs.current.forEach(vid => {
              if (vid) vid.currentTime = 0;
          });
      }
  }, [currentTime]);

  const handleAudioError = (source: string, e: any) => {
      // Prevent circular JSON error by logging safe strings instead of the event object
      const errorMsg = e instanceof Error ? e.message : 'Unknown playback error';
      console.error(`${source} Playback Error:`, errorMsg, e.target?.src || 'No src');
  };

  if (!project) {
    return (
        <div className="h-full flex items-center justify-center text-slate-400 font-display">
            <div className="text-center">
                <Film size={48} className="mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the Agent<br/>to generate a project.</p>
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

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/40 bg-white/10 backdrop-blur-sm">
        <button onClick={() => setActiveTab('output')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'output' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50' : 'text-slate-500 hover:text-slate-700'}`}>Final Output</button>
        <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'ingredients' ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50' : 'text-slate-500 hover:text-slate-700'}`}>Ingredients</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        
        {/* Progress Overlay */}
        {project.isGenerating && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md w-full space-y-6">
                    <Loader2 className="animate-spin text-pink-500 mx-auto" size={48} />
                    <h3 className="text-2xl font-display font-bold text-slate-900">Production In Progress</h3>
                    
                    <div className="space-y-4">
                        {/* Phase 1: Planning */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${project.currentPhase === 'planning' ? 'bg-pink-100 text-pink-900' : 'text-slate-400'}`}>
                            {project.currentPhase !== 'planning' && project.scenes.length > 0 ? <CheckCircle2 className="text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                            <span className="font-bold">Phase 1: Creative Brief & Storyboard</span>
                        </div>
                        {/* Phase 2: Video */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${project.currentPhase === 'video_production' ? 'bg-pink-100 text-pink-900' : 'text-slate-400'}`}>
                             {(project.currentPhase === 'voiceover' || project.currentPhase === 'scoring' || project.currentPhase === 'mixing' || project.currentPhase === 'ready') ? <CheckCircle2 className="text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                            <span className="font-bold">Phase 2: Video Generation (Veo)</span>
                        </div>
                        {/* Phase 3: VO */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${project.currentPhase === 'voiceover' ? 'bg-pink-100 text-pink-900' : 'text-slate-400'}`}>
                             {(project.currentPhase === 'scoring' || project.currentPhase === 'mixing' || project.currentPhase === 'ready') ? <CheckCircle2 className="text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                            <span className="font-bold">Phase 3: Voiceover Recording (TTS)</span>
                        </div>
                        {/* Phase 4: Scoring */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${project.currentPhase === 'scoring' ? 'bg-pink-100 text-pink-900' : 'text-slate-400'}`}>
                             {(project.currentPhase === 'mixing' || project.currentPhase === 'ready') ? <CheckCircle2 className="text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                            <span className="font-bold">Phase 4: Music Composition (Lyria)</span>
                        </div>
                         {/* Phase 5: Mixing */}
                         <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${project.currentPhase === 'mixing' ? 'bg-pink-100 text-pink-900' : 'text-slate-400'}`}>
                             {project.currentPhase === 'ready' ? <CheckCircle2 className="text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                            <span className="font-bold">Phase 5: Final Mix & Stitch</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'output' ? (
          <div className="flex flex-col items-center h-full">
            {/* Audio Elements (Hidden but Active) */}
            {/* Note: We force re-render when URLs change to ensure new Blobs are loaded */}
            {project.musicUrl && <audio key={project.musicUrl} ref={musicRef} src={project.musicUrl} volume={0.3} crossOrigin="anonymous" onError={(e) => handleAudioError("Music", e)} />}
            {project.voiceoverUrl && <audio key={project.voiceoverUrl} ref={voRef} src={project.voiceoverUrl} volume={1.0} crossOrigin="anonymous" onError={(e) => handleAudioError("Voice", e)} />}

            {/* Video Sequencer Container */}
            <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border border-slate-800 ${
                settings.aspectRatio === '16:9' ? 'w-full aspect-video' : 'h-[50vh] md:h-[600px] aspect-[9/16]'
            }`}>
                {/* Render ALL video elements stacked. Control Z-Index and Opacity */}
                {project.scenes.map((scene, idx) => (
                    <video
                        key={scene.id}
                        preload="auto"
                        ref={el => videoRefs.current[idx] = el}
                        src={scene.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                        style={{ 
                            opacity: idx === 0 ? 1 : 0,
                            zIndex: idx === 0 ? 10 : 0
                        }}
                        muted // Muted as we use separate audio tracks
                        playsInline
                        loop // Loop individual clips so they don't freeze if timing is off by ms
                    />
                ))}

                {/* Overlays with Dynamic Positioning and Sizing */}
                <div className={containerClasses}>
                    <h2 className={textClasses}>
                        {activeScene?.textOverlay}
                    </h2>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 md:p-3 bg-white rounded-full text-black hover:bg-pink-400 hover:text-white transition-colors shadow-lg"
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-xs md:text-sm tracking-wide">
                                {formatTime(currentTime)} / {formatTime(totalDuration)}
                            </span>
                            <span className="text-white/60 text-[10px] md:text-xs font-mono">
                                PHASE: FINAL MIX
                            </span>
                        </div>
                    </div>
                     <div className="hidden md:flex items-center gap-2 text-white/50 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Music size={12} />
                        <span className="text-xs font-bold uppercase">{project.musicMood}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 w-full max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 mb-2">{project.title}</h1>
                <p className="text-sm md:text-base text-slate-600 mb-6">{project.concept}</p>
                <div className="flex flex-col md:flex-row gap-4">
                    <button className="btn-primary px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800">
                        <Download size={18} /> Export Mixed MP4
                    </button>
                    <button className="btn-primary px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                        Copy FFmpeg Command
                    </button>
                </div>
                {project.ffmpegCommand && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg overflow-x-auto">
                        <code className="text-xs text-green-400 font-mono whitespace-pre">{project.ffmpegCommand}</code>
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-slate-800">Master Tracks</h3>
            
            {/* Master Audio Tracks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-pink-700 font-bold">
                        <Mic size={18} /> Master Voiceover
                    </div>
                    <p className="text-xs text-slate-600 italic line-clamp-3">"{project.fullScript}"</p>
                    {project.voiceoverUrl ? (
                        <audio controls src={project.voiceoverUrl} className="w-full h-8 mt-2" crossOrigin="anonymous" onError={(e) => handleAudioError("Voice Master", e)} />
                    ) : (
                        <div className="text-xs text-red-400 italic">No audio generated.</div>
                    )}
                </div>
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-teal-700 font-bold">
                        <Music size={18} /> Master Score
                    </div>
                    <p className="text-xs text-slate-600 capitalize">{project.musicMood} Theme</p>
                     {project.musicUrl ? (
                        <audio controls src={project.musicUrl} className="w-full h-8 mt-2" crossOrigin="anonymous" onError={(e) => handleAudioError("Music Master", e)} />
                    ) : (
                        <div className="text-xs text-red-400 italic">No audio generated.</div>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-display font-bold text-slate-800 mt-8">Visual Timeline</h3>
            <div className="space-y-2">
                {project.scenes.map((scene, idx) => (
                    <div key={scene.id} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-lg">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                        <div className="w-24 aspect-video bg-black rounded overflow-hidden">
                             {scene.videoUrl && <video src={scene.videoUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-slate-500 uppercase">Duration: {scene.duration}s</div>
                            <div className="text-sm text-slate-800 line-clamp-1">{scene.visualPrompt}</div>
                            {/* Visual indicator of text placement logic */}
                            {scene.overlayConfig && (
                                <div className="mt-1 flex gap-2">
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">Pos: {scene.overlayConfig.position}</span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">Size: {scene.overlayConfig.size}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Agent Chat ---
const AgentChat: React.FC<{
  onGenerate: (prompt: string) => void;
  isProcessing: boolean;
}> = ({ onGenerate, isProcessing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'model', text: 'Hello! I am your AI Creative Director. Ready to produce your ad?', timestamp: Date.now() }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (input.toLowerCase().includes('create') || input.toLowerCase().includes('generate')) {
        onGenerate(userMsg.text);
    } else {
        const response = await GeminiService.sendChatMessage(messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), userMsg.text);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response, timestamp: Date.now() }]);
    }
  };

  return (
    <div className={`absolute bottom-4 right-4 md:bottom-8 md:right-8 z-50 transition-all duration-300 ${isOpen ? 'w-[calc(100vw-2rem)] md:w-96 h-[500px]' : 'w-16 h-16'}`}>
      {!isOpen && <button onClick={() => setIsOpen(true)} className="w-16 h-16 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"><MessageSquare size={24} /></button>}
      {isOpen && (
        <div className="w-full h-full flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden ring-4 ring-slate-900/5">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="font-bold font-display">Creative Director</span></div>
            <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100"><X size={18} /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map(msg => (<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>{msg.text}</div></div>))}
            {isProcessing && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-500"><Loader2 className="animate-spin" size={12} />Producing Ad...</div></div>}
          </div>
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
                <input type="text" className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500" placeholder="Type request..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                <button onClick={handleSend} className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800"><ArrowUpCircle size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---
export default function App() {
  // Fix: Initialize with environment variable existence to support deployed environments.
  // This allows the app to start immediately if API_KEY is set in build/deployment config.
  const [apiKeyReady, setApiKeyReady] = useState(!!process.env.API_KEY);
  
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [settings, setSettings] = useState<ProjectSettings>({ customScript: '', musicTheme: '', useTextOverlays: 'auto', preferredVoice: 'auto', aspectRatio: AspectRatio.SixteenNine });
  const [project, setProject] = useState<AdProject | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  useEffect(() => {
    const initKey = async () => {
        // If env var is already present, we are ready.
        if (process.env.API_KEY) return;

        // Fallback for AI Studio (Veo) context
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (hasKey) {
                setApiKeyReady(true);
            }
        }
    };
    initKey();
  }, []);

  const handleApiKeySelection = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
             setApiKeyReady(true);
        }
    } else { 
        alert("This app requires an API Key. If you are deploying this app, please add your Google AI Studio API Key as an environment variable named 'API_KEY' in your deployment settings."); 
    }
  };

  const handleGenerateProject = async (prompt: string) => {
    setIsProcessing(true);
    try {
        // Phase 1: Planning
        const plan = await GeminiService.generateAdPlan(prompt, settings, referenceFiles);
        const newProject: AdProject = {
            title: plan.title, concept: plan.concept, musicMood: plan.musicMood, fullScript: plan.fullScript,
            scenes: plan.scenes.map((s: any) => ({ ...s, status: 'pending' })),
            ffmpegCommand: plan.ffmpegCommand, isGenerating: true, currentPhase: 'planning'
        };
        setProject(newProject);

        // Phase 2: Video Production (Parallel scenes)
        setProject(prev => prev ? ({...prev, currentPhase: 'video_production'}) : null);
        const updatedScenes = [...newProject.scenes];
        // Sequentially generate scenes to avoid rate limits in demo, but show as "Phase 2"
        for (let i = 0; i < updatedScenes.length; i++) {
            const videoUrl = await GeminiService.generateVideoClip(updatedScenes[i].visualPrompt, settings.aspectRatio);
            updatedScenes[i].videoUrl = videoUrl || undefined;
            updatedScenes[i].status = 'complete';
            setProject(prev => prev ? ({ ...prev, scenes: [...updatedScenes] }) : null);
        }

        // Phase 3: Voiceover (Single Track)
        setProject(prev => prev ? ({...prev, currentPhase: 'voiceover'}) : null);
        const voiceToUse = settings.preferredVoice !== 'auto' ? settings.preferredVoice : TTSVoice.Kore;
        const voUrl = await GeminiService.generateVoiceover(plan.fullScript, voiceToUse as TTSVoice);
        setProject(prev => prev ? ({...prev, voiceoverUrl: voUrl || undefined}) : null);

        // Phase 4: Scoring (Single Track)
        setProject(prev => prev ? ({...prev, currentPhase: 'scoring'}) : null);
        const musicUrl = await GeminiService.generateMusic(plan.musicMood);
        setProject(prev => prev ? ({...prev, musicUrl: musicUrl || undefined}) : null);

        // Phase 5: Final Mix
        setProject(prev => prev ? ({...prev, currentPhase: 'mixing'}) : null);
        await new Promise(r => setTimeout(r, 1000)); // Simulate stitch time
        setProject(prev => prev ? ({...prev, currentPhase: 'ready', isGenerating: false}) : null);

    } catch (e) {
        console.error("Generation failed", e);
        alert("Failed to generate project. See console.");
        setIsProcessing(false);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!apiKeyReady) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-6 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold">AdStudio<span className="text-pink-500">.ai</span></h1>
            <p className="text-slate-400 max-w-md">Create world-class video ads with a fully autonomous creative director.</p>
            <button onClick={handleApiKeySelection} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-pink-500 hover:text-white transition-all shadow-xl">Connect Google AI Studio Key</button>
            <p className="text-xs text-slate-500 max-w-xs opacity-60">If you are the developer, ensure <code>API_KEY</code> is set in your environment variables.</p>
        </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/40 backdrop-blur-md border-b border-white/50 z-20 relative">
            <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="lg:hidden p-2 text-slate-700 hover:bg-white/50 rounded-lg transition-colors">
                <Menu />
            </button>
            
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-lg shadow-lg" />
                <span className="text-xl font-display font-bold text-slate-900">AdStudio<span className="text-pink-600">.ai</span></span>
            </div>

            <button onClick={() => setShowRightPanel(!showRightPanel)} className="lg:hidden p-2 text-slate-700 hover:bg-white/50 rounded-lg transition-colors">
                <Settings />
            </button>

            <div className="hidden lg:flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase bg-white/50 px-3 py-1 rounded-full border border-white">Gemini 3 Pro</span>
                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img src="https://picsum.photos/100" alt="User" />
                </div>
            </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
            <div className="w-full h-full grid grid-cols-1 lg:grid-cols-4">
                
                {/* Left Panel (Reference Manager) */}
                <div className={`
                    fixed inset-y-0 left-0 w-80 lg:w-full lg:static lg:col-span-1 
                    bg-white/80 backdrop-blur-xl lg:bg-white/20 lg:backdrop-blur-md 
                    border-r border-white/40 shadow-2xl lg:shadow-lg z-30 transition-transform duration-300 ease-in-out
                    ${showLeftPanel ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="h-full relative pt-16 lg:pt-0">
                        <button onClick={() => setShowLeftPanel(false)} className="lg:hidden absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-600"><X size={16}/></button>
                        <ReferenceManager files={referenceFiles} setFiles={setReferenceFiles} />
                    </div>
                </div>

                {/* Center Panel (Project Board) */}
                <div className="col-span-1 lg:col-span-2 relative bg-white/5 w-full h-full overflow-hidden">
                    <ProjectBoard project={project} setProject={setProject} settings={settings} />
                </div>

                {/* Right Panel (Settings) */}
                <div className={`
                    fixed inset-y-0 right-0 w-80 lg:w-full lg:static lg:col-span-1 
                    bg-white/80 backdrop-blur-xl lg:bg-white/20 lg:backdrop-blur-md 
                    border-l border-white/40 shadow-2xl lg:shadow-lg z-30 transition-transform duration-300 ease-in-out
                    ${showRightPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    <div className="h-full relative pt-16 lg:pt-0">
                         <button onClick={() => setShowRightPanel(false)} className="lg:hidden absolute top-4 left-4 p-2 bg-slate-100 rounded-full text-slate-600"><X size={16}/></button>
                        <SettingsPanel settings={settings} setSettings={setSettings} />
                    </div>
                </div>

            </div>

             {/* Mobile Overlay for panels */}
            {(showLeftPanel || showRightPanel) && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => { setShowLeftPanel(false); setShowRightPanel(false); }}
                />
            )}
        </div>
        
        <AgentChat onGenerate={handleGenerateProject} isProcessing={isProcessing} />
    </div>
  );
}