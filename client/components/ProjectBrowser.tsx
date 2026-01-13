import React, { useEffect, useState } from 'react';
import { AdProject } from '../types';
import * as ApiService from '../services/api';
import { Clock, Film, Play, Sparkles, Trash2 } from 'lucide-react';

interface ProjectBrowserProps {
    onLoadProject: (project: AdProject) => void;
    onClose: () => void;
}

export const ProjectBrowser: React.FC<{ onClose: () => void, onLoadProject: (p: AdProject) => void }> = ({ onClose, onLoadProject }) => {
    const [projects, setProjects] = useState<AdProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Get user ID from local storage as backup if prop context not available
                const userStr = localStorage.getItem('auth_user');
                const user = userStr ? JSON.parse(userStr) : null;

                const data = await ApiService.getProjects(user?.id);
                setProjects(data);
            } catch (error) {
                console.error('Failed to load projects', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent opening the project
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await ApiService.deleteProject(id);
                setProjects(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error('Failed to delete project', error);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-6xl h-full max-h-[90vh] glass-panel rounded-3xl flex flex-col overflow-hidden relative border border-white/20 shadow-2xl">

                {/* Header */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/30 to-slate-900/30">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                            <Film className="text-pink-500" />
                            My Portfolio
                        </h2>
                        <p className="text-white/40 mt-1">Manage and view your past creations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-white/30 animate-pulse">
                            Loading Projects...
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
                            <Sparkles size={48} className="text-white/10" />
                            <p className="text-xl">No projects yet. Start creating!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => onLoadProject(project)}
                                    className="group relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:-translate-y-1"
                                >
                                    {/* Thumbnail Image */}
                                    {project.thumbnailUrl ? (
                                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                                            <Film size={32} className="text-white/10 group-hover:text-pink-500/50 transition-colors" />
                                        </div>
                                    )}

                                    {/* Overlay Info */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white text-lg truncate flex-1">{project.title}</h3>
                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="text-white/40 hover:text-red-500 transition-colors p-1"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-1 text-xs text-white/50">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {(project as any).updated_at ? formatDate((project as any).updated_at) : formatDate((project as any).created_at)}
                                            </span>
                                            <span className="uppercase tracking-wider font-bold text-pink-400/80 text-[10px] border border-pink-500/20 px-2 py-0.5 rounded-full bg-pink-500/5">
                                                {project.mode || 'Commercial'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]">
                                        <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                            <Play fill="white" className="text-white ml-1" size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
