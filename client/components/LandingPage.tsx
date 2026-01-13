import React, { useState } from 'react';
import { ArrowRight, Play, Sparkles, Youtube, Aperture, Music } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-pink-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-900/10 rounded-full blur-[150px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center text-white font-bold font-display">A</div>
                    <span className="text-xl font-display font-bold text-white tracking-tight">AdStudio<span className="text-pink-500">.ai</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onLoginClick} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Log In</button>
                    <button onClick={onSignupClick} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all transform hover:scale-105">Get Started</button>
                </div>
            </nav>

            {/* Hero */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-sm">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span className="text-xs font-medium text-white/80">AI-Powered Commercial Generation</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">
                    Create broadcast-ready ads<br />in minutes, not months.
                </h1>

                <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-10 leading-relaxed">
                    AdStudio combines state-of-the-art video, audio, and script generation models into a single, intuitive director's suite. From concept to final cut instantly.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <button onClick={onSignupClick} className="group bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-lg font-bold shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] transition-all transform hover:-translate-y-1 flex items-center gap-2">
                        Start Creating Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 rounded-full text-lg font-bold border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Play size={20} fill="currentColor" /> Watch Demo
                    </button>
                </div>

                {/* Hero Image / UI Mockup */}
                <div className="mt-20 relative w-full max-w-5xl aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 pointer-events-none" />

                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="UI" />

                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 cursor-pointer hover:scale-110 transition-transform">
                            <Play size={32} fill="white" className="ml-1" />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full max-w-5xl">
                    {[
                        { label: 'Wait Time', value: '< 2 min' },
                        { label: 'Video Quality', value: '1080p' },
                        { label: 'Audio', value: 'Dolby 5.1' },
                        { label: 'Cost', value: '$0.00' }
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col gap-1 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <span className="text-3xl font-bold font-display text-white">{s.value}</span>
                            <span className="text-sm text-white/40 uppercase tracking-wider">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
