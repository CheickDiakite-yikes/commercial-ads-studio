import React, { useState, useEffect, useRef } from 'react';
import { AdProject, AspectRatio, ChatMessage, ProjectSettings, ReferenceFile, Scene, TTSVoice } from './types';
import * as GeminiService from './services/geminiService';
import { ArrowUpCircle, Film, Layers, Settings, FileText, Music, Mic, X, Plus, Play, Download, MessageSquare, Loader2, Image as ImageIcon, Volume2, VolumeX, Pause } from 'lucide-react';

// --- Components defined internally for single-file adherence, normally separated ---

// 1. Reference Manager (Left Panel)
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
      // For demo, reading as DataURL. Real RAG would need text extraction for PDFs.
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
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf,text/plain"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {files.length === 0 && (
            <div className="text-slate-400 text-sm text-center mt-10 italic">
                No reference files. Upload brand assets, logos, or decks here.
            </div>
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
                {file.type === 'image' && file.previewUrl ? (
                  <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="text-slate-400" />
                )}
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

// 2. Settings Panel (Right Panel)
const SettingsPanel: React.FC<{
  settings: ProjectSettings;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettings>>;
}> = ({ settings, setSettings }) => {
  return (
    <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
      <h2 className="text-2xl font-display font-bold text-slate-800">Studio Settings</h2>
      
      {/* Aspect Ratio */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aspect Ratio</label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.values(AspectRatio) as AspectRatio[]).map(ratio => (
            <button
              key={ratio}
              onClick={() => setSettings(prev => ({ ...prev, aspectRatio: ratio }))}
              className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                settings.aspectRatio === ratio 
                  ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-[2px_2px_0px_0px_rgba(236,72,153,1)]' 
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Mic size={14} /> Voice
        </label>
        <select 
          className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 focus:border-pink-500 outline-none transition-colors"
          value={settings.preferredVoice}
          onChange={(e) => setSettings(prev => ({ ...prev, preferredVoice: e.target.value as TTSVoice | 'auto' }))}
        >
          <option value="auto">Let AI Decide</option>
          {Object.values(TTSVoice).map(voice => (
            <option key={voice} value={voice}>{voice}</option>
          ))}
        </select>
      </div>

      {/* Text Overlays */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} /> Text Overlays
        </label>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {['yes', 'auto', 'no'].map((opt) => (
                 <button
                 key={opt}
                 onClick={() => setSettings(prev => ({ ...prev, useTextOverlays: opt as any }))}
                 className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${
                    settings.useTextOverlays === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                 }`}
               >
                 {opt}
               </button>
            ))}
        </div>
        {settings.useTextOverlays !== 'no' && (
            <input 
                type="text" 
                placeholder="Preferred Font (Optional)"
                className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm"
                value={settings.textOverlayFont || ''}
                onChange={(e) => setSettings(prev => ({...prev, textOverlayFont: e.target.value}))}
            />
        )}
      </div>

      {/* Music */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Music size={14} /> Music Theme
        </label>
        <input 
            type="text"
            placeholder="e.g., Upbeat, Corporate, Jazz..."
            className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm"
            value={settings.musicTheme}
            onChange={(e) => setSettings(prev => ({...prev, musicTheme: e.target.value}))}
        />
      </div>

      {/* Script */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FileText size={14} /> Custom Script
        </label>
        <textarea 
            placeholder="Enter specific lines needed..."
            className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm h-32 resize-none"
            value={settings.customScript}
            onChange={(e) => setSettings(prev => ({...prev, customScript: e.target.value}))}
        />
      </div>
    </div>
  );
};

// 3. Middle Panel (Project Board)
const ProjectBoard: React.FC<{
  project: AdProject | null;
  setProject: React.Dispatch<React.SetStateAction<AdProject | null>>;
}> = ({ project, setProject }) => {
  const [activeTab, setActiveTab] = useState<'output' | 'ingredients'>('output');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync music with play state
  useEffect(() => {
    if (activeTab === 'output' && project?.musicUrl && audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.warn("Audio play interrupted", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, activeTab, project]);

  // Handle Scene Transitions
  useEffect(() => {
    let interval: any;
    if (isPlaying && project && activeTab === 'output') {
        const sceneDuration = project.scenes[currentSceneIndex]?.duration || 4;
        
        interval = setTimeout(() => {
            setCurrentSceneIndex(prev => {
                if (prev >= project.scenes.length - 1) {
                    setIsPlaying(false);
                    return 0; // Reset
                }
                return prev + 1;
            });
        }, sceneDuration * 1000);
    }
    return () => clearTimeout(interval);
  }, [isPlaying, project, activeTab, currentSceneIndex]);

  // Reset audio when resetting to start
  useEffect(() => {
      if (currentSceneIndex === 0 && audioRef.current && isPlaying) {
          audioRef.current.currentTime = 0;
      }
  }, [currentSceneIndex, isPlaying]);


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

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/40 bg-white/10 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('output')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'output' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Final Output
        </button>
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'ingredients' ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Ingredients
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        {project.isGenerating && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
                <p className="font-display font-bold text-slate-800">Generating Assets...</p>
                <p className="text-sm text-slate-500 mt-2">Gemini is creating Veo 3.1 Videos, TTS Audio & Music</p>
                <p className="text-xs text-slate-400 mt-1">This may take up to 30-60 seconds.</p>
            </div>
        )}

        {activeTab === 'output' ? (
          <div className="flex flex-col items-center h-full">
            {/* Background Music Audio Element (Hidden) */}
            {project.musicUrl && (
                <audio ref={audioRef} src={project.musicUrl} loop volume={0.4} />
            )}

            {/* Player Container */}
            <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border border-slate-800 ${
                // Simulate aspect ratio roughly
                project.scenes[0].videoUrl && project.scenes[0].videoUrl.includes('16:9') ? 'w-full aspect-video' : 'h-[600px] aspect-[9/16]'
            }`}>
                {/* Scene Video */}
                {project.scenes[currentSceneIndex]?.videoUrl ? (
                     <video 
                        ref={videoRef}
                        key={project.scenes[currentSceneIndex].videoUrl} // Force re-render on src change
                        src={project.scenes[currentSceneIndex].videoUrl} 
                        className="w-full h-full object-cover animate-fade-in"
                        autoPlay={isPlaying}
                        loop // Loop individual clips for effect if duration mismatches slightly
                        muted // Muted because we handle audio separately in a real stitch
                     />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 space-y-4">
                         <Film size={48} className="opacity-20" />
                         <span className="text-xs uppercase tracking-widest opacity-50">Scene {currentSceneIndex + 1} Pending</span>
                    </div>
                )}
                
                {/* Text Overlay */}
                {project.scenes[currentSceneIndex]?.textOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h2 className={`text-4xl md:text-6xl font-black text-white text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] px-6 ${project.scenes[currentSceneIndex].textOverlay.length > 20 ? 'text-2xl' : ''}`}>
                            {project.scenes[currentSceneIndex].textOverlay}
                        </h2>
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-3 bg-white rounded-full text-black hover:bg-pink-400 hover:text-white transition-colors shadow-lg"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm tracking-wide">
                                SCENE {currentSceneIndex + 1} / {project.scenes.length}
                            </span>
                            <span className="text-white/60 text-xs font-mono">
                                {project.scenes[currentSceneIndex]?.visualPrompt.substring(0, 30)}...
                            </span>
                        </div>
                    </div>
                    {project.musicUrl && (
                        <div className="flex items-center gap-2 text-white/50 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                            <Music size={12} />
                            <span className="text-xs font-bold uppercase">{project.musicMood}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 w-full max-w-2xl">
                <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">{project.title}</h1>
                <p className="text-slate-600 mb-6">{project.concept}</p>
                <div className="flex gap-4">
                    <button className="btn-primary px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800">
                        <Download size={18} /> Export MP4
                    </button>
                    <button className="btn-primary px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50">
                        Copy FFmpeg Command
                    </button>
                </div>
                {project.ffmpegCommand && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg overflow-x-auto relative group">
                        <div className="absolute top-2 right-2 bg-slate-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            FFmpeg Stitch Command
                        </div>
                        <code className="text-xs text-green-400 font-mono whitespace-pre">{project.ffmpegCommand}</code>
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-slate-800">Project Ingredients</h3>
            
            {/* Music Ingredient */}
            {project.musicUrl && (
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
                        <Music size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800">Background Score</h4>
                        <p className="text-sm text-slate-500 capitalize">{project.musicMood} Theme</p>
                    </div>
                    <audio controls src={project.musicUrl} className="h-8 w-48" />
                </div>
            )}

            <div className="grid gap-4">
                {project.scenes.map((scene, idx) => (
                    <div key={scene.id} className="bg-white/50 border border-white p-4 rounded-xl flex gap-4 items-start shadow-sm transition-transform hover:scale-[1.01]">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {idx + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded">{scene.duration}s Shot</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${scene.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {scene.status === 'complete' ? 'Ready' : 'Processing...'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 group relative overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-600 uppercase">
                                        <Film size={12} /> Visual Prompt
                                    </div>
                                    <p className="text-sm text-slate-700 italic mb-2">"{scene.visualPrompt}"</p>
                                    {scene.videoUrl ? (
                                        <div className="aspect-video bg-black rounded overflow-hidden relative">
                                            <video src={scene.videoUrl} className="w-full h-full object-cover" muted onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                                            <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">Hover to play</div>
                                        </div>
                                    ) : (
                                        <div className="h-24 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">Waiting for Veo...</div>
                                    )}
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-pink-600 uppercase">
                                        <Mic size={12} /> Script (TTS)
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">"{scene.scriptLine}"</p>
                                    {scene.audioUrl ? (
                                        <audio controls src={scene.audioUrl} className="w-full h-8" />
                                    ) : (
                                        <div className="h-8 bg-slate-200 rounded animate-pulse" />
                                    )}
                                </div>
                            </div>
                            {scene.textOverlay && (
                                <div className="text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 inline-block">
                                    <span className="font-bold">Overlay:</span> {scene.textOverlay}
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

// 4. Chat Bubble (Agent)
const AgentChat: React.FC<{
  onGenerate: (prompt: string) => void;
  isProcessing: boolean;
}> = ({ onGenerate, isProcessing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AI Creative Director. Let\'s create a world-class ad. Upload your assets and tell me what you need.', timestamp: Date.now() }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Check if this looks like a generation request (simple heuristic for demo)
    if (input.toLowerCase().includes('create') || input.toLowerCase().includes('make') || input.toLowerCase().includes('generate')) {
        onGenerate(userMsg.text);
    } else {
        // Just chat
        const response = await GeminiService.sendChatMessage(
             messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
             userMsg.text
        );
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response, timestamp: Date.now() }]);
    }
  };

  return (
    <div className={`absolute bottom-8 right-8 z-50 transition-all duration-300 ${isOpen ? 'w-96 h-[500px]' : 'w-16 h-16'}`}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-full h-full flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden ring-4 ring-slate-900/5">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-bold font-display">Creative Director</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100">
                <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-pink-500 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isProcessing && (
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="animate-spin" size={12} />
                        Thinking & Producing...
                    </div>
                </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Describe your ad..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800"
                >
                    <ArrowUpCircle size={20} />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [settings, setSettings] = useState<ProjectSettings>({
    customScript: '',
    musicTheme: '',
    useTextOverlays: 'auto',
    preferredVoice: 'auto',
    aspectRatio: AspectRatio.SixteenNine
  });
  const [project, setProject] = useState<AdProject | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize API Key via AI Studio standard
  useEffect(() => {
    const initKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (hasKey) {
                // In the real window.aistudio environment, the key is injected into env or handled by the proxy.
                // For this code structure, we assume we need to pass a key string or the library handles it.
                // The prompt says "The selected API key is available via process.env.API_KEY".
                // Since this runs in browser, we rely on the environment being shimmed correctly.
                GeminiService.initializeGemini(process.env.API_KEY || 'VALID_KEY_PLACEHOLDER');
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
             GeminiService.initializeGemini(process.env.API_KEY || 'VALID_KEY_PLACEHOLDER');
             setApiKeyReady(true);
        }
    } else {
        alert("AI Studio environment not detected. Please ensure this app runs within the Google AI Studio IDX or compatible environment.");
    }
  };

  const handleGenerateProject = async (prompt: string) => {
    setIsProcessing(true);
    try {
        // 1. Plan the Ad
        const plan = await GeminiService.generateAdPlan(prompt, settings, referenceFiles);
        
        const newProject: AdProject = {
            title: plan.title,
            concept: plan.concept,
            musicMood: plan.musicMood,
            musicUrl: undefined,
            scenes: plan.scenes.map((s: any) => ({ ...s, status: 'pending' })),
            ffmpegCommand: plan.ffmpegCommand,
            isGenerating: true
        };

        setProject(newProject);

        // 2. Generate Music (Parallel Start)
        GeminiService.generateMusic(plan.musicMood).then(url => {
            setProject(prev => prev ? ({ ...prev, musicUrl: url }) : null);
        });

        // 3. Generate Assets (Sequential for demo clarity/rate limits)
        const updatedScenes = [...newProject.scenes];

        for (let i = 0; i < updatedScenes.length; i++) {
            // Update status
            updatedScenes[i].status = 'generating_video';
            setProject(prev => prev ? ({ ...prev, scenes: [...updatedScenes] }) : null);

            // Generate Video (Veo)
            const videoUrl = await GeminiService.generateVideoClip(
                updatedScenes[i].visualPrompt, 
                settings.aspectRatio, 
                updatedScenes[i].duration
            );
            
            updatedScenes[i].videoUrl = videoUrl || undefined;
            updatedScenes[i].status = 'generating_audio';
            setProject(prev => prev ? ({ ...prev, scenes: [...updatedScenes] }) : null);

            // Generate Audio (TTS)
            const voiceToUse = settings.preferredVoice !== 'auto' ? settings.preferredVoice : TTSVoice.Kore;
            const audioUrl = await GeminiService.generateVoiceover(updatedScenes[i].scriptLine, voiceToUse as TTSVoice);
            
            updatedScenes[i].audioUrl = audioUrl || undefined;
            updatedScenes[i].status = 'complete';
            setProject(prev => prev ? ({ ...prev, scenes: [...updatedScenes] }) : null);
        }

        setProject(prev => prev ? ({ ...prev, isGenerating: false }) : null);

    } catch (e) {
        console.error("Generation failed", e);
        alert("Failed to generate project plan. See console.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (!apiKeyReady) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-6">
            <h1 className="text-5xl font-display font-bold">AdStudio<span className="text-pink-500">.ai</span></h1>
            <p className="text-slate-400">Please select a Paid API Key (Veo requires billing).</p>
            <button 
                onClick={handleApiKeySelection}
                className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-pink-500 hover:text-white transition-all shadow-xl"
            >
                Connect Google AI Studio Key
            </button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-slate-500 underline">Billing Documentation</a>
        </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
        {/* Header (Minimal) */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/40 backdrop-blur-md border-b border-white/50 z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-lg shadow-lg" />
                <span className="text-xl font-display font-bold text-slate-900">AdStudio<span className="text-pink-600">.ai</span></span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase bg-white/50 px-3 py-1 rounded-full border border-white">Gemini 3 Pro</span>
                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img src="https://picsum.photos/100" alt="User" />
                </div>
            </div>
        </header>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-4 overflow-hidden relative">
            
            {/* Left Panel: Assets (25%) */}
            <div className="col-span-1 border-r border-white/40 bg-white/20 backdrop-blur-md shadow-lg z-10 relative">
                <ReferenceManager files={referenceFiles} setFiles={setReferenceFiles} />
            </div>

            {/* Middle Panel: Project (50%) */}
            <div className="col-span-2 relative bg-white/5">
                <ProjectBoard project={project} setProject={setProject} />
                
                {/* Floating Chat Bubble - Positioned absolute relative to middle panel container, actually fixed in code but conceptually here */}
                <div className="absolute bottom-6 right-6">
                     {/* Implemented as a fixed overlay in AgentChat component for z-index management, passed handler */}
                </div>
            </div>

            {/* Right Panel: Settings (25%) */}
            <div className="col-span-1 border-l border-white/40 bg-white/20 backdrop-blur-md shadow-lg z-10 relative">
                <SettingsPanel settings={settings} setSettings={setSettings} />
            </div>

        </div>

        <AgentChat onGenerate={handleGenerateProject} isProcessing={isProcessing} />
    </div>
  );
}