# AdStudio.ai 🎬✨

**The World-Class AI Creative Director & Production Studio**

AdStudio.ai is a next-generation autonomous creative agency. Powered by Google's most advanced generative models, it acts as a fully integrated production house—conceptualizing, scripting, directing, and producing high-quality video advertisements in real-time.

From analyzing brand assets to generating broadcast-ready 30-second spots with synchronized voiceovers and original scores, AdStudio.ai redefines the creative workflow.

---

## ⚡️ Powered By

*   **Gemini 3 Pro**: The Creative Director. Handles advanced reasoning, scriptwriting (perfectly timed to 30s), and visual storyboarding.
*   **Veo 3.1**: The Cinematographer. Generates high-definition video clips (1080p/720p) adhering to the visual storyboard.
*   **Gemini 2.5 Flash TTS**: The Voice Talent. Provides human-parity voiceovers with multiple persona options.
*   **Lyria (Experimental)**: The Composer. Creates adaptive background scores tailored to the specific mood of the ad.

---

## 🚀 Features

### 🧠 Autonomous Campaign Generation
Simply upload your assets (logos, PDFs, text) and chat with the AI. It understands your brand identity and formulates a complete creative strategy.

### 🎥 Multi-Format Video Production
Native support for:
*   **16:9** (Landscape) for TV, YouTube, and Desktop.
*   **9:16** (Portrait) for TikTok, Reels, and Shorts.

### 🎛️ Real-Time Sequencer
A browser-based non-linear editing timeline that stitches video, audio, and overlays instantly.
*   **Smart Layering**: Automatic audio ducking and video transition logic.
*   **Dynamic Overlays**: Context-aware text placement on video layers.

### 📦 Export Ready
While the browser provides an instant preview, AdStudio generates precise **FFmpeg** build commands, allowing you to render the final master file locally in full quality.

---

## 🛠️ Usage Guide

1.  **Connect**: Launch the app and securely connect your Google AI Studio API Key.
2.  **Upload**: Add your reference materials to the Asset Manager (Left Panel).
3.  **Configure**: Set your target aspect ratio, preferred voice, and music vibe in Studio Settings (Right Panel).
4.  **Prompt**: Open the chat and direct the agent.
    > *"Create a 30s high-energy ad for our new sneaker launch using the uploaded product shots."*
5.  **Watch**: The agent executes the plan in phases—Writing, Filming, Recording, Composing, and Mixing.

---

## 💻 Tech Stack

*   **Framework**: React 19 + TypeScript
*   **Styling**: Tailwind CSS + Custom "Memphis" Design System
*   **AI Integration**: `@google/genai` SDK (v1.34.0)

---

*Note: This application leverages experimental models. Ensure your API key has billing enabled for access to Veo and Lyria.*