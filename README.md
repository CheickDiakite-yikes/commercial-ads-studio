# AdStudio.ai 🎬✨

**The World-Class AI Creative Director & Production Studio**

AdStudio.ai is a next-generation autonomous creative agency application. Acting as a central orchestrator, it leverages Google's most advanced generative models to conceptualize, script, direct, and produce broadcast-quality video advertisements in real-time.

Unlike simple video generators, AdStudio.ai simulates a full production team workflow—moving from creative briefing to storyboard, asset generation, and final non-linear editing—all within the browser.

---

## ⚡️ The GenAI Model Stack

This application orchestrates a specific suite of Google models, each assigned a specialized role in the production pipeline:

1.  **Gemini 3 Pro (`gemini-3-pro-preview`)**:
    *   **Role**: The Creative Director & Scriptwriter.
    *   **Task**: It analyzes uploaded assets (PDFs, Images), understands brand identity, and generates a precise JSON execution plan. It writes a timing-aware script (strictly 60-70 words for 30s spots) and visual prompts for every scene. It also intelligently decides *where* text overlays should appear on screen based on visual composition logic.
2.  **Veo 3.1 (`veo-3.1-fast-generate-preview`)**:
    *   **Role**: The Cinematographer.
    *   **Task**: Generates high-definition video clips (720p) based on the scene descriptions provided by the Creative Director. It supports both **16:9** (Landscape) and **9:16** (Portrait) aspect ratios natively.
3.  **Gemini 2.5 Flash TTS (`gemini-2.5-flash-preview-tts`)**:
    *   **Role**: The Voice Talent.
    *   **Task**: Converts the script into human-parity spoken audio. The app handles raw PCM audio streams, converting them to WAV blobs in the browser for immediate playback.
4.  **Lyria (`lyria-realtime-exp`)**:
    *   **Role**: The Composer (Experimental).
    *   **Task**: Generates original, mood-adaptive background scores.
    *   *Note*: Includes a robust fallback system to stock audio if the experimental real-time stream encounters latency or connection issues.

---

## 🏗️ Architecture & Workflow

The application follows a strictly typed, 5-phase production pipeline:

### Phase 1: Planning & Briefing
*   **Input**: User prompts + Uploaded Reference Files (Images/PDFs).
*   **Process**: Gemini 3 Pro generates an `AdProject` object containing the title, concept, music mood, full script, and a scene-by-scene breakdown.
*   **Intelligence**: The model calculates negative space for text overlays (e.g., placing text "Top-Left" if the subject is in the center).

### Phase 2: Video Production (Parallel)
*   **Process**: The app iterates through the scene list.
*   **Optimization**: Scenes are generated via Veo. 
*   **State Management**: Real-time status updates (`pending` -> `generating` -> `complete`) are reflected in the UI.

### Phase 3: Voiceover Recording
*   **Process**: The generated script is sent to the TTS model.
*   **Audio Processing**: The raw PCM byte stream is captured, headers are applied, and a Blob URL is created for the `<audio>` element.

### Phase 4: Scoring
*   **Process**: The "Music Mood" identified in Phase 1 is sent to Lyria.
*   **Duration Matching**: The system requests a stream length matching the ad duration (30s).

### Phase 5: Final Mix & Stitch
*   **The Sequencer**: A custom-built React player that synchronizes:
    1.  The HTML5 `<audio>` track for Voiceover.
    2.  The HTML5 `<audio>` track for Music (ducked volume).
    3.  A stack of HTML5 `<video>` elements that toggle opacity based on the playback timestamp.
    4.  A CSS-based Overlay system that renders text dynamically.

---

## 🚀 Key Features

### 🧠 Intelligent Overlay Placement
The AI doesn't just write text; it designs the frame. The Creative Director analyzes the visual prompt it created and determines the optimal position (`top-left`, `bottom-right`, `center`, etc.) and size (`small`, `xl`) for the text to ensure it doesn't obscure the product or subject.

### 🎛️ The Studio Interface
*   **Asset Manager**: Drag-and-drop reference images and documents that Ground the AI's creativity.
*   **Settings Panel**:
    *   **Aspect Ratio**: Toggle between TV/Youtube (16:9) and Social (9:16) formats.
    *   **Voice Casting**: Select specific voice personas (Puck, Kore, Fenrir, etc.).
    *   **Overlay Controls**: Toggle text on/off or set custom fonts.
*   **Floating Creative Director**: A non-intrusive chat interface to refine the concept or iterate on specific details.

### 📦 Production Export
While the browser provides a high-fidelity preview, the app generates a copy-pasteable **FFmpeg** command. This allows the user to render the final asset locally, stitching the actual video files and audio tracks into a single `.mp4` master file with exact timing.

---

## 💻 Technical Stack

*   **Frontend**: React 19, TypeScript, Vite.
*   **Styling**: Tailwind CSS with a custom "Memphis" glassmorphism design system.
*   **Icons**: `lucide-react`.
*   **AI SDK**: `@google/genai` (v1.34.0).

---

## 🛠️ Usage

### Prerequisites
1.  **Google Cloud Project**: You must have a GCP project with the Gemini API enabled.
2.  **Billing**: Veo and Lyria are paid/experimental models and require a billing-enabled project.

### Environment Setup
You can run this locally or deploy it.

**Option A: Environment Variable**
Create a `.env` file in the root:
```bash
API_KEY=your_google_ai_studio_key
```

**Option B: UI Selector**
If no environment variable is found, the app will launch in "Kiosk Mode" and prompt the user to securely select their Google Cloud Project API Key via the Google AI Studio integration window.

### Running the App
```bash
npm install
npm run dev
```

---

## 🔮 Future Roadmap

*   **Shot-by-Shot Refinement**: Allow users to regenerate specific scenes without re-rolling the entire ad.
*   **User Audio Upload**: Allow users to upload their own voiceover or music tracks.
*   **Style Transfer**: Use Gemini to rewrite the script in specific styles (e.g., "Gen Z", "Formal Luxury").
