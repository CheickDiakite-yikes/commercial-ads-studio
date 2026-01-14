import React from 'react';

// Shared gradient definition for all icons
export const CinematicGradient = () => (
    <defs>
        <linearGradient id="cinematic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" /> {/* Pink-500 */}
            <stop offset="50%" stopColor="#a855f7" /> {/* Purple-500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
        </linearGradient>
        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>
);

interface IconProps {
    className?: string;
    size?: number;
}

// Phase 1: Concept (Brain/Glitch Spark)
export const IconConcept: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
        <path d="M9 21h6" />
        <path d="M12 6v6" opacity="0.5" />
        <path d="M15.5 8.5L14 11" opacity="0.5" />
        <path d="M8.5 8.5L10 11" opacity="0.5" />
    </svg>
);

// Phase 2: Pre-Production (Layers/Boards in Perspective)
export const IconPreProd: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M2 17L12 22L22 17" />
        <path d="M2 12L12 17L22 12" />
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
    </svg>
);

// Phase 3: Production (Futuristic Camera Lens)
export const IconProduction: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(6, 182, 212, 0.5))' }}
    >
        <CinematicGradient />
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 8v-2" />
        <path d="M12 16v2" />
        <path d="M16 12h2" />
        <path d="M8 12H6" />
        <path d="M4.93 4.93L7.76 7.76" />
        <path d="M16.24 16.24L19.07 19.07" />
    </svg>
);

// Phase 4: Post-Production (Magic Wand/Rendering)
export const IconPostProd: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M15 4V2" />
        <path d="M15 16V14" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8L19 13" />
        <path d="M10.6 6.4L12 5" />
        <path d="M12.6 12.6L11 11" />
        <path d="M6.4 17.6L5 19" />
        <path d="M2 22l5.5-5.5" />
        <path d="M9 22l-5.5-5.5" opacity="0.5" />
    </svg>
);

// --- FEATURES SECTION ICONS ---

// Feature: Lightning Fast (Zap)
export const IconZap: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        <path d="M13 2L3 14" opacity="0.5" strokeDasharray="2 2" />
    </svg>
);

// Feature: Global Reach (Globe)
export const IconGlobe: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(6, 182, 212, 0.5))' }}
    >
        <CinematicGradient />
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M12 2v20" opacity="0.5" />
    </svg>
);

// Feature: Multi-Format (Layers)
export const IconLayers: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
        <path d="M12 22v-5" opacity="0.5" />
    </svg>
);

// Feature: AI Creative Director (Magic/Star)
export const IconMagic: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M15 4V2" />
        <path d="M15 16V14" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8L19 13" />
        <path d="M10.6 6.4L12 5" />
        <path d="M12.6 12.6L11 11" />
        <path d="M21 2l-6.5 6.5" />
        <path d="M3 21l6.5-6.5" />
    </svg>
);

// Feature: 4K Quality (Video/Film)
export const IconVideo: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.5))' }}
    >
        <CinematicGradient />
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M15 8l5-4v16l-5-4" />
        <path d="M2 12h5" opacity="0.5" />
    </svg>
);

// Feature: Chat-Based (Message)
export const IconChat: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(6, 182, 212, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        <path d="M8 11h.01" strokeWidth="2.5" />
        <path d="M12 11h.01" strokeWidth="2.5" />
        <path d="M16 11h.01" strokeWidth="2.5" />
    </svg>
);

// --- GENERAL UI ICONS ---

// Sparkle (Stars)
export const IconSparkle: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" style={{ display: 'none' }} /> {/* Default Lucide star is a bit boring, let's make a real sparkle */}
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        <path d="M20 3v4" opacity="0.5" />
        <path d="M22 5h-4" opacity="0.5" />
    </svg>
);

// Arrow Right
export const IconArrowRight: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
    </svg>
);

// Play Button
export const IconPlay: React.FC<IconProps & { fill?: string }> = ({ className = "", size = 24, fill }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={fill ? "none" : "url(#cinematic-gradient)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <polygon points="5 3 19 12 5 21 5 3" fill={fill ? "url(#cinematic-gradient)" : "none"} />
    </svg>
);

// Chevron Down
export const IconChevronDown: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.5))' }}
    >
        <CinematicGradient />
        <path d="M6 9l6 6 6-6" />
    </svg>
);

// Help Circle
export const IconHelp: React.FC<IconProps> = ({ className = "", size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#cinematic-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ filter: 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.5))' }}
    >
        <CinematicGradient />
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" strokeWidth="2.5" />
    </svg>
);
