# AdStudio.ai 🎬✨

**The Autonomous AI Creative Director & Production Studio**

> *Transforming creative concepts into broadcast-quality video ads in real-time.*

**AdStudio.ai** is a world-class, autonomous creative agency running entirely in the browser. It acts as a central orchestrator, leveraging Google's most advanced Generative AI models to conceptualize, script, direct, score, and produce video advertisements.

Unlike standard video generation tools that output random clips, AdStudio simulates a **professional production workflow**. It understands brand identity, enforces timing constraints, directs visual composition, and even "watches" its own output to provide creative critiques.

---

## ✨ New & Core Capabilities

### 👁️ Multimodal Video Understanding (New)
The Creative Director agent possesses true vision. It doesn't just generate commands; it **sees** the results.
*   **Context Loop**: When you chat with the agent after generation, it analyzes the pixel data of the generated video clips.
*   **Visual QA**: Ask specific questions like *"Is the lighting in scene 3 too dark?"* or *"Does the character look consistent?"*, and the agent will provide feedback based on the actual visual output.

### ⚓️ Visual Anchors (New)
Maintain strict visual consistency across your narrative.
*   **Character/Product Locking**: Upload a reference image (a "Visual Anchor") to the Asset Manager.
*   **Consistency**: The Veo video model uses this anchor for every scene generation, ensuring your product or protagonist looks identical in every shot, whether they are running, sitting, or flying.

### 🧠 Intelligent Composition
The AI Director understands the geometry of the frame.
*   **Negative Space Analysis**: Before generating overlays, the model analyzes the visual description to find "negative space" (empty areas).
*   **Dynamic Overlay Placement**: It automatically positions text (e.g., `bottom-right`, `top-left`) to ensure it never obscures the main subject.

---

## 🤖 The Intelligence Stack

We orchestrate a symphony of Google's state-of-the-art models:

| Role | Model | Responsibility |
| :--- | :--- | :--- |
| **Director** | `gemini-3-pro-preview` | The brain. Handles creative briefing, scriptwriting (60-70 words/30s), prompt engineering, and visual critique. |
| **Camera** | `veo-3.1-fast-generate-preview` | The eyes. Generates high-fidelity 720p video clips in strictly defined aspect ratios (16:9 or 9:16). |
| **Voice** | `gemini-2.5-flash-preview-tts` | The voice. Delivers human-parity speech synthesis from the generated script. |
| **Score** | `lyria-realtime-exp` | The soul. Composes original, mood-adaptive background music streams (with robust stock fallback). |

---

## ⚙️ The Production Pipeline

AdStudio automates a rigid professional workflow:

### Phase 1: The Creative Brief 📝
*   **Input**: User concept + Reference Assets (PDF/Images).
*   **Reasoning**: Gemini 3 Pro analyzes the inputs to generate a structured `AdProject` plan.
*   **Output**: A cohesive 30-second script, scene breakdown, music mood, and visual prompts.

### Phase 2: Video Production 🎥
*   **Execution**: The system iterates through the scene list.
*   **Injection**: Visual Anchors are injected into the Veo prompt payload.
*   **Parallelism**: Scenes are queued and processed to optimize generation time.

### Phase 3: Audio Engineering 🎙️
*   **Voiceover**: The script is converted to raw PCM audio, processed into a WAV blob.
*   **Scoring**: The music mood triggers a Lyria generation session or selects a high-quality fallback track.

### Phase 4: The Final Mix 🎚️
*   **Sequencer**: A custom React engine stitches audio and video.
*   **Synchronization**: It manages timeline logic to toggle video visibility (opacity) precisely when the previous scene ends.
*   **Rendering**: The app records the canvas stream and audio context in real-time to export a final `.mp4` file.

---

## 🗺️ Roadmap: The Evolution

We are actively building the next generation of creative tools. Here is our detailed plan for the upcoming phases:

### Phase 2: Project Modes & Dynamic Prompting 🎨
*   **Goal**: Move beyond standard commercials to support stylistic diversity like "Trippy" visualizers or "Music Videos".
*   **Implementation Strategy**:
    *   **UI Update**: Add a "Mode" selector in Studio Settings.
    *   **Logic Branching**:
        *   **`Mode === 'Music Video'`**: The Agent breaks the "30-second commercial" rule. It prioritizes "Visual Loops", "Beat Sync", and "Abstract Imagery" over narrative structure.
        *   **`Mode === 'Trippy'`**: The prompt engine automatically injects high-weight style modifiers (e.g., *Fractal, Surrealism, Neon, Kaleidoscope*) into every visual prompt sent to Veo.

### Phase 3: The Narrative Upgrade (True Dialogue) 🗣️
*   **Goal**: Pixar-style storytelling with distinct characters talking to each other.
*   **Implementation Strategy**:
    *   **Script Parsing**: Upgrade `adPlanSchema` to support an array of dialogue objects rather than a text block.
        *   *Structure*: `script: [{ speaker: 'Narrator', text: '...' }, { speaker: 'Hero', text: '...' }]`
    *   **Multi-Speaker TTS**: Leverage **Gemini 2.5 Multi-Speaker** capabilities. Instead of generating one voice file, we will generate a conversation where the model switches voices (e.g., 'Kore' for Narrator, 'Puck' for Hero) seamlessly within the same audio blob.

---

## 🛠️ Technical Stack

*   **Framework**: React 19 + TypeScript + Vite
*   **Styling**: Tailwind CSS + Custom "Memphis" Glassmorphism
*   **State**: React Hooks (Complex sync logic for the sequencer)
*   **AI SDK**: `@google/genai` (v1.34.0)
*   **Icons**: `lucide-react`

---

## 🚦 Getting Started

### Prerequisites
1.  **Google Cloud Project**: You need a GCP project with the Gemini API enabled.
2.  **API Key**: A valid API key with access to Gemini 3, Veo, and Lyria.

### Installation

1.  **Clone & Install**
    ```bash
    git clone https://github.com/your-repo/adstudio-ai.git
    cd adstudio-ai
    npm install
    ```

2.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```bash
    API_KEY=your_google_ai_studio_key
    ```
    *Note: If no key is provided, the app acts as a Kiosk and asks the user to connect via Google AI Studio.*

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

*Built with ❤️ by the AdStudio.ai Team*