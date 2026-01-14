import React, { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { IconConcept, IconPreProd, IconProduction, IconPostProd, IconZap, IconGlobe, IconLayers, IconMagic, IconVideo, IconChat, IconSparkle, IconArrowRight, IconPlay, IconChevronDown, IconHelp } from './CinematicIcons';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
}

const faqData = [
    { q: "What is AdStudio.ai?", a: "AdStudio.ai is an AI-powered creative platform that transforms text prompts into broadcast-ready video commercials. No filming required." },
    { q: "How long does it take to generate an ad?", a: "Most ads are generated in under 2 minutes, including video, voiceover, and music." },
    { q: "What formats can I export?", a: "Export in 16:9 (YouTube/TV), 9:16 (TikTok/Reels), 1:1 (Instagram), and more. We support MP4 and WebM." },
    { q: "Is there a free trial?", a: "Yes! Start with 3 free ad generations. No credit card required." },
    { q: "Can I use my own brand assets?", a: "Absolutely. Upload logos, product images, and brand guidelines to maintain consistency across all generated content." },
];


export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse Spotlight Effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                containerRef.current.style.setProperty('--mouse-x', `${x}px`);
                containerRef.current.style.setProperty('--mouse-y', `${y}px`);
            }

            // 3D Tilt for cards
            document.querySelectorAll('.card-3d-content').forEach((card) => {
                const rect = (card as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Only animate if mouse is close/over
                if (Math.abs(e.clientX - (rect.left + centerX)) < 300 && Math.abs(e.clientY - (rect.top + centerY)) < 300) {
                    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
                    const rotateY = ((x - centerX) / centerX) * 10;
                    (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                } else {
                    (card as HTMLElement).style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);


    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                    entry.target.classList.add('animate-reveal');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-reveal').forEach((el) => {
            observerRef.current?.observe(el);
        });

        return () => observerRef.current?.disconnect();
    }, []);

    // Timeline Scroll Progress
    useEffect(() => {
        const handleScroll = () => {
            const timelineDesktop = document.getElementById('timeline-progress');
            const timelineMobile = document.getElementById('timeline-progress-mobile');

            // We can use the container as the reference for both
            const container = timelineDesktop?.parentElement || timelineMobile?.parentElement;

            if (container) {
                const rect = container.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Calculate progress
                const startOffset = windowHeight / 2;
                const totalDistance = rect.height;
                const scrolled = startOffset - rect.top;

                let percentage = (scrolled / totalDistance) * 100;
                percentage = Math.max(0, Math.min(100, percentage));

                if (timelineDesktop) timelineDesktop.style.height = `${percentage}%`;
                if (timelineMobile) timelineMobile.style.height = `${percentage}%`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white relative font-sans selection:bg-pink-500/30">
            {/* Film Grain Overlay */}
            <div className="film-grain" />
            {/* Dynamic Background with Stage Lights */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-pink-900/20 animate-aurora" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-500/10 to-transparent blur-[100px] animate-pulse-glow" />

                {/* Stage Light Beams */}
                <div className="stage-light-left" />
                <div className="stage-light-right" />
                <div className="stage-light-center" />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md border-b border-white/5 bg-black/20 transition-all duration-300">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center text-white font-bold font-display group-hover:rotate-12 transition-transform duration-300">A</div>
                        <span className="text-2xl font-display font-bold text-white tracking-tight">AdStudio<span className="text-pink-500">.ai</span></span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={onLoginClick} className="hidden md:block text-sm font-bold text-white/60 hover:text-white transition-colors uppercase tracking-wider">Log In</button>
                        <button onClick={onSignupClick} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* ========== HERO SECTION (REFINED) ========== */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">

                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="animate-float mb-8 relative z-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:bg-pink-500/20 transition-colors cursor-default">
                        <IconSparkle size={14} className="text-pink-400 animate-pulse" />
                        <span className="text-xs font-bold text-pink-200 uppercase tracking-widest">The Future of Advertising</span>
                    </div>
                </div>

                <h1 className="relative z-20 text-7xl md:text-9xl font-display font-black tracking-tighter mb-8 leading-[0.85] text-white drop-shadow-2xl opacity-0 animate-reveal delay-100 flex flex-col items-center">
                    <span className="relative inline-block">CREATE</span>
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 filter drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] glitch-text" data-text="UNREAL">
                        UNREAL
                    </span>
                    <span className="relative inline-block">ADS</span>
                </h1>

                <p className="relative z-20 text-lg md:text-2xl text-white/70 max-w-2xl mb-12 leading-relaxed opacity-0 animate-reveal delay-200 font-light">
                    Transform simple concepts into broadcast-ready commercials instantly.
                    <br /><span className="text-white font-medium">No cameras. No crew. Just AI.</span>
                </p>

                <div className="relative z-20 flex flex-col md:flex-row items-center gap-6 opacity-0 animate-reveal delay-300 w-full md:w-auto px-4">
                    <button onClick={onSignupClick} className="w-full md:w-auto group relative px-8 py-4 md:px-10 md:py-5 rounded-2xl bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_70px_rgba(255,255,255,0.4)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-white to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            Start Creating Free <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <button className="w-full md:w-auto px-8 py-4 md:px-10 md:py-5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconPlay size={12} fill="currentColor" />
                        </div>
                        Watch Showreel
                    </button>
                </div>
            </section>

            {/* Infinite Marquee Strip */}
            <div className="relative w-full py-4 bg-pink-600/10 border-y border-pink-500/20 overflow-hidden backdrop-blur-md z-20 marquee-container">
                <div className="inline-flex whitespace-nowrap animate-marquee">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex items-center gap-8 mx-4">
                            <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">COMMERCIAL VIDEO</span>
                            <IconSparkle size={16} className="text-white/30" />
                            <span className="text-2xl font-display font-bold text-white/20">MUSIC VIDEOS</span>
                            <IconSparkle size={16} className="text-white/30" />
                            <span className="text-2xl font-display font-bold text-white/20">SOCIAL MEDIA</span>
                            <IconSparkle size={16} className="text-white/30" />
                            <span className="text-2xl font-display font-bold text-white/20">DOCUMENTARY</span>
                            <IconSparkle size={16} className="text-white/30" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Strobe Divider */}
            <div className="relative w-full h-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent w-[200%] animate-aurora opacity-30 blur-3xl" />
            </div>

            {/* ========== DEMO VIDEO SECTION ========== */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-5xl mx-auto text-center scroll-reveal opacity-0 translate-y-10">
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">See It In Action</h2>
                    <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">Watch how AdStudio transforms a simple prompt into a stunning video commercial in seconds.</p>

                    <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl bg-gradient-to-br from-gray-900 to-black group cursor-pointer">
                        {/* Placeholder for demo video */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_60px_rgba(236,72,153,0.5)]">
                                <IconPlay size={40} fill="white" className="text-white ml-2" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute bottom-8 left-8 text-left">
                            <p className="text-sm text-white/50 uppercase tracking-wider mb-2">Demo Video</p>
                            <p className="text-2xl font-bold">From Prompt to Commercial in 90 Seconds</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FEATURES GRID ========== */}
            <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-10">
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">Powerful Features</h2>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto">Everything you need to create professional ads without a massive production budget.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { icon: <IconZap size={32} />, title: "Lightning Fast", desc: "Generate full video campaigns in under 120 seconds. No rendering queues." },
                        { icon: <IconGlobe size={32} />, title: "Global Reach", desc: "Auto-translate and dub ads into 50+ languages instantly with AI voices." },
                        { icon: <IconLayers size={32} />, title: "Multi-Format", desc: "Export for TikTok, Instagram, TV, and YouTube Shorts simultaneously." },
                        { icon: <IconMagic size={32} />, title: "AI Creative Director", desc: "Our AI understands brand context and generates on-strategy creative." },
                        { icon: <IconVideo size={32} />, title: "4K Quality", desc: "Broadcast-ready output with Dolby Atmos audio and HDR support." },
                        { icon: <IconChat size={32} />, title: "Chat-Based Editing", desc: "Refine your ads with natural language. Just tell us what to change." },
                    ].map((feature, i) => (
                        <div key={i} className={`
                            scroll-reveal opacity-0 translate-y-10 transition-all duration-700
                            card-3d-wrapper
                        `} style={{ transitionDelay: `${i * 100}ms` }}>
                            <div className="
                                card-3d-content spotlight-card
                                p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm
                                hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_50px_rgba(236,72,153,0.3)]
                                group cursor-default h-full relative overflow-hidden
                            ">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] relative z-10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-display font-bold mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed relative z-10">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== ANIMATED PRODUCTION PIPELINE (HOW IT WORKS) ========== */}
            <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent overflow-hidden">
                <div className="max-w-6xl mx-auto relative">
                    <div className="text-center mb-24 scroll-reveal opacity-0 translate-y-10">
                        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">Production Pipeline</h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">From concept to final render in four cinematic phases.</p>
                    </div>

                    {/* Timeline Container */}
                    <div className="relative pl-8 md:pl-0"> {/* Add padding left on mobile for the line */}

                        {/* --- DESKTOP LINES (Center) --- */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white/10 rounded-full hidden md:block" />
                        <div id="timeline-progress" className="absolute left-1/2 top-0 w-1 -translate-x-1/2 bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-full hidden md:block transition-all duration-100 ease-linear" style={{ height: '0%' }} />

                        {/* --- MOBILE LINES (Left) --- */}
                        <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/10 rounded-full md:hidden" />
                        <div id="timeline-progress-mobile" className="absolute left-2 top-0 w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-full md:hidden transition-all duration-100 ease-linear" style={{ height: '0%' }} />

                        {[
                            { phase: "Phase 01", title: "Concept", desc: "Input your text prompt. Our AI Director analyzes your request, proposing creative angles and visual styles.", icon: <IconConcept size={32} /> },
                            { phase: "Phase 02", title: "Pre-Production", desc: "Instant storyboard generation and shot planning. Review cinematic composition before a single frame is generated.", icon: <IconPreProd size={32} /> },
                            { phase: "Phase 03", title: "Production", desc: "High-fidelity video synthesis paired with AI-composed musical scores and professional voiceovers.", icon: <IconProduction size={32} /> },
                            { phase: "Phase 04", title: "Post-Production", desc: "Automated editing, color grading, and final rendering in 4K. Ready for broadcast.", icon: <IconPostProd size={32} /> },
                        ].map((item, i) => (
                            <div key={i} className={`flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 relative group timeline-item scroll-reveal opacity-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`} style={{ transitionDelay: `${i * 100}ms` }}>

                                {/* Content Card */}
                                <div className={`w-full md:w-[45%] p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-pink-500/30 transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] text-left ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                    <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest ${i % 2 === 0 ? 'flex-row md:flex-row-reverse' : 'flex-row'}`}>
                                        <span className="text-pink-500">{item.phase}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">{item.title}</h3>
                                    <p className="text-white/50 leading-relaxed text-sm md:text-base">{item.desc}</p>
                                </div>

                                {/* Center Node (Desktop) */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 hidden md:flex items-center justify-center z-10">
                                    <div className="w-4 h-4 rounded-full bg-black border-2 border-white/20 group-hover:border-pink-500 group-hover:bg-pink-500 group-hover:shadow-[0_0_20px_#ec4899] transition-all duration-500" />
                                </div>

                                {/* Left Node (Mobile) */}
                                <div className="absolute left-[-26px] top-8 w-4 h-4 rounded-full bg-black border-2 border-white/20 group-hover:border-pink-500 group-hover:bg-pink-500 group-hover:shadow-[0_0_20px_#ec4899] transition-all duration-500 md:hidden z-10" />

                                {/* Icon Display (Desktop Only) */}
                                <div className={`w-full md:w-[45%] hidden md:flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-pink-400 group-hover:scale-110 transition-all duration-500">
                                        {item.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FAQ SECTION ========== */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
                            <IconHelp size={16} className="text-pink-400" />
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Got Questions?</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">FAQ</h2>
                    </div>

                    <div className="space-y-4">
                        {faqData.map((faq, i) => (
                            <div
                                key={i}
                                className="scroll-reveal opacity-0 translate-y-10 faq-item rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-pink-500/30 transition-all"
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 flex items-center justify-between text-left"
                                >
                                    <span className="text-lg font-bold">{faq.q}</span>
                                    <IconChevronDown size={20} className={`text-pink-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`faq-answer px-6 text-white/60 ${openFaq === i ? 'open pb-6' : ''}`}>
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== CTA SECTION ========== */}
            <section className="relative z-10 py-32 text-center px-6">
                <div className="scroll-reveal opacity-0 translate-y-10">
                    <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 glitch-text" data-text="Disrupt?">Disrupt?</span></h2>
                    <button onClick={onSignupClick} className="bg-white text-black text-xl font-bold px-12 py-6 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.4)] animate-strobe">
                        Get Started Now
                    </button>
                    <p className="mt-8 text-white/40 text-sm">No credit card required. Cancel anytime.</p>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="relative z-10 border-t border-white/5 bg-black py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                                <span className="text-xl font-display font-bold tracking-tight">AdStudio.ai</span>
                            </div>
                            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                                The AI-powered creative studio that transforms ideas into broadcast-ready commercials in minutes.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-bold text-white/80 mb-4 uppercase text-xs tracking-wider">Product</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white/80 mb-4 uppercase text-xs tracking-wider">Company</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-white/20 text-xs">
                            &copy; 2026 AdStudio Inc. All Rights Reserved.
                        </div>
                        <div className="flex gap-6 text-sm text-white/40">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
