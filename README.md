# AdStudio.ai 🎬✨

**The Autonomous AI Creative Director & Production Studio**

> *Transforming creative concepts into broadcast-quality video ads in real-time.*

**AdStudio.ai** is a world-class, autonomous creative agency running entirely in the browser. It acts as a central orchestrator, leveraging Google's most advanced Generative AI models to conceptualize, script, direct, score, and produce video advertisements.

---

## ✨ Key Features

### 🧠 Autonomous Creative Direction
Powered by **Gemini 3 Pro**, the AI Director doesn't just write a script—it engineers a full production plan.
*   **Granular Breakdown**: Deconstructs every 4-6s scene into specific instructions for Camera (Framing/Movement), Lighting, Wardrobe, and Action Blocking.
*   **Visual Summary**: Generates cohesive narrative prompts for video generation.

### ⚓️ Visual Anchors
Maintain strict character and product consistency across your narrative.
*   **Visual Locking**: Upload a reference image (e.g., a specific product or character) as a "Visual Anchor".
*   **Consistency Engine**: The system injects this visual reference into every storyboard and video generation pipeline (Veo & Imagen), ensuring your subject looks identical in every shot.

### 🎥 Veo 3.1 Video Production
Direct access to Google's state-of-the-art video generation model.
*   **High Fidelity**: Generates 720p video clips at 24fps.
*   **Aspect Ratio Control**: Native support for **16:9** (Cinematic) and **9:16** (Social/Vertical) formats.
*   **Image-to-Video**: Seamlessly transforms generated storyboards into motion.

### 🎙️ Human-Parity Audio
*   **Multi-Speaker TTS**: Uses **Gemini 2.5 Flash** to generate distinct voices for dialogue-heavy scripts.
*   **Adaptive Scoring**: Analyzes the mood (e.g., "Upbeat", "Cinematic") and generates or retrieves a perfectly matched background track using **Lyria** or high-quality fallbacks.

### 👁️ Director's View vs. Final Output
*   **The Sequencer**: A robust React-based video sequencer that stitches 5+ video clips, audio tracks, and text overlays in real-time using the Canvas API.
*   **Director's Breakdown**: Switch views to see the "ingredients" of your ad—inspecting exactly what the AI prompted for lighting, camera moves, and character details for each scene.

---

## 🤖 The Intelligence Stack

We orchestrate a symphony of Google's state-of-the-art models via the `@google/genai` SDK:

| Role | Model | Responsibility |
| :--- | :--- | :--- |
| **Director** | `gemini-3-pro-preview` | The brain. Handles creative briefing, complex JSON schema generation, and prompt engineering. |
| **Storyboard** | `gemini-3-pro-image-preview` | The concept artist. Generates photorealistic reference frames for Veo. |
| **Camera** | `veo-3.1-fast-generate-preview` | The cinematographer. Generates video clips from text/image prompts. |
| **Voice** | `gemini-2.5-flash-preview-tts` | The talent. Delivers expressive speech synthesis. |
| **Music** | `lyria-realtime-exp` | The composer. Generates mood-based background scores. |

---

## ⚙️ The Production Pipeline

AdStudio automates a professional production workflow:

1.  **Planning 📝**: User provides a prompt + assets. Gemini 3 Pro generates a rigorous `AdProject` JSON plan.
2.  **Storyboarding 🎨**: The system generates a reference image for every scene to lock in the visual style.
3.  **Video Generation 🎬**: Veo 3.1 animates the storyboards into video clips.
4.  **Audio Engineering 🎚️**: Parallel generation of Voiceover (PCM->WAV) and Music.
5.  **Real-time Mixing 🖥️**: The browser mixes video, audio, and dynamic text overlays on an HTML5 Canvas.
6.  **Export 💾**: Real-time recording of the canvas stream to a downloadable `.mp4` or `.webm` file.

---

## 🛠️ Technical Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **UI/UX**: Tailwind CSS, Lucide Icons, Custom "Memphis" Glassmorphism
*   **AI Integration**: Official Google GenAI SDK (`@google/genai`)
*   **Media**: Canvas API, Web Audio API, MediaRecorder API

---

## 🚦 Getting Started

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **API Key**: The application requires a valid Google Cloud API key with access to Gemini, Veo, and Lyria. You will be prompted to enter/select this via the Google AI Studio integration upon launch.

---

*Built for the Gemini API Developer Competition.*