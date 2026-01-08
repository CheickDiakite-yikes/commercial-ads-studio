# AdStudio.ai 🎬✨

**The World-Class AI Creative Director & Production Studio**

AdStudio.ai is a cutting-edge web application that acts as your autonomous creative agency. It leverages Google's latest Gemini models to conceptualize, script, direct, and produce high-quality video advertisements in minutes.

From analyzing brand assets to generating 30-second commercial spots with synchronized voiceovers, original music scores, and Veo-generated video clips, AdStudio.ai represents the future of automated creative workflows.

---

## 🚀 Key Features

### 🧠 AI Creative Director
Powered by **Gemini 3 Pro**, the agent acts as your creative partner. It ingests your uploaded reference files (images, PDFs, text) to understand your brand identity, then generates a cohesive 30-second ad concept, complete with a perfectly timed script and visual storyboards.

### 🎥 Generative Video Production
Harnessing **Veo 3.1 (Fast Preview)**, AdStudio.ai generates high-fidelity video clips for every scene in your storyboard. It supports both **16:9 (Landscape)** for TV/YouTube and **9:16 (Portrait)** for TikTok/Reels/Shorts.

### 🗣️ Pro-Grade Voiceovers
Utilizes **Gemini 2.5 Flash TTS** to generate human-like voiceovers. Choose from distinct personas:
- **Puck & Charon** (Masculine)
- **Kore, Fenrir, Zephyr, Aoede** (Feminine/Neutral)
- **Auto-Cast**: Let the AI decide the best voice for your script's mood.

### 🎵 Adaptive Music Scoring
Features experimental integration with **Lyria (Realtime)** to compose original background music tailored to the emotional arc of your ad (Upbeat, Cinematic, Emotional, Corporate, Jazz). 
*Includes a robust fallback system to high-quality stock tracks if generation times out.*

### 🎛️ Real-Time Sequencer
A browser-based non-linear editor that stitches video, voiceover, and music layers in real-time.
- **Gapless Playback**: Seamless transition between generated scenes.
- **Layering**: Automatically handles audio ducking and video z-indexing.
- **Text Overlays**: Dynamic titles overlaid on video segments.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI SDK**: `@google/genai` (v1.34.0+)
- **Models Used**:
  - `gemini-3-pro-preview` (Reasoning, Scripting, Chat)
  - `veo-3.1-fast-generate-preview` (Video Generation)
  - `gemini-2.5-flash-preview-tts` (Text-to-Speech)
  - `models/lyria-realtime-exp` (Music Generation via WebSocket)

---

## 📋 Usage Guide

### 1. Asset Ingestion (Left Panel)
Upload your raw materials. The Creative Director reads these to ensure brand consistency.
- **Images**: Product shots, logos.
- **PDFs**: Brand guidelines, brochures.
- **Text**: Slogans, key selling points.

### 2. Studio Configuration (Right Panel)
Customize the production parameters:
- **Aspect Ratio**: Choose 16:9 or 9:16.
- **Voice**: Select a specific narrator or leave it to the AI.
- **Text Overlays**: Enable/Disable text on screen.
- **Music Theme**: Define the vibe (e.g., "Cyberpunk high energy", "Soft acoustic morning").
- **Custom Script**: Optionally provide your own copy.

### 3. The Brief (Chat Agent)
Open the chat bubble (bottom right) and talk to the Director.
> "Create a high-energy 30s ad for our new energy drink based on the uploaded logo. Make it feel like a sports car commercial."

### 4. Production Phase
Watch the magic happen. The system executes phases in parallel:
1.  **Planning**: Script writing & Storyboarding.
2.  **Video**: Generating 5-6 unique clips via Veo.
3.  **Voiceover**: Synthesizing the narrator track.
4.  **Scoring**: Composing the soundtrack.
5.  **Mixing**: Final assembly.

### 5. Review & Export
Watch the result in the central player.
- **Ingredients Tab**: Review individual generated assets.
- **Export**: Get the FFmpeg command to render a physical MP4 file locally (browser-based rendering is preview-only).

---

## 🔑 Prerequisites

You need a valid **Google AI Studio API Key** with billing enabled to access the Veo and Gemini production models.
The app handles API key input securely via the browser environment variables or the AI Studio helper.

---

## 🎨 Design System

Built with a "Memphis" design aesthetic:
- **Fonts**: Outfit (UI) & Space Grotesk (Headers).
- **Palette**: Slate backgrounds with vibrant accents (Pink #ff0080, Teal #00b7c2).
- **Components**: Glassmorphism cards with neo-brutalist shadows.

---

*Note: This application uses experimental Google GenAI models. Performance and availability may vary.*
