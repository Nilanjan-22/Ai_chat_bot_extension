# Disha – AI-Powered Web Accessibility Guide

### The Problem
The modern web is incredibly complex. For users with low digital literacy, language barriers, or cognitive difficulties, navigating jargon-heavy websites, confusing navigation menus, and overwhelming forms (like government portals or booking sites) is frustrating and often impossible without human assistance. Traditional screen readers only blindly dictate text—they don't *explain* what things mean or tell you what to do next.

### The Solution
**Disha** acts as a patient, multilingual AI companion right inside your browser. It doesn't just read the screen; it **understands** it. 

By securely analyzing the active webpage's context, Disha allows users to ask questions using their voice (or text) in **English, Hindi, or Bengali**. Whether it's asking *"What does this form field mean?"* or *"How do I proceed to checkout?"*, Disha provides clear, context-aware guidance and reads the answer aloud. It empowers users to independently navigate the web, all while operating in a strict, privacy-first "read-only" mode that ensures it never clicks or submits data on the user's behalf.

## 🌟 Features

- **Context-Aware AI Guidance:** Reads the active tab's content securely and answers questions specifically about what the user is currently looking at.
- **Multi-Lingual Support:** Fully supports interactions in **English, Hindi, and Bengali**.
- **Voice Input (Speech-to-Text):** Users can speak their questions using their microphone. (Uses a robust popup-window implementation to comply with strict Chrome Manifest V3 security policies).
- **Voice Output (Text-to-Speech):** Reads the AI's responses aloud in the selected language.
- **Read-Only Guarantee:** Disha only reads the screen; it cannot click buttons or submit forms on your behalf, ensuring complete safety and privacy.
- **Modern UI:** Built with React and TailwindCSS for a beautiful, responsive, and accessible Side Panel experience.

## 🛠️ Tech Stack

### Frontend (Chrome Extension)
- **Framework:** React 18
- **Styling:** TailwindCSS
- **Build Tool:** esbuild & PostCSS
- **APIs:** Chrome Extension API (Manifest V3), Chrome Side Panel API, Web Speech API (SpeechRecognition & SpeechSynthesis)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Integration:** OpenRouter API (Using advanced LLMs)

---

## 📁 Project Structure

```
disha/
├── backend/                  # Node.js Express server
│   └── src/server.js         # API endpoints and OpenRouter integration
├── extension/                # Chrome Extension Source Code
│   ├── src/
│   │   ├── background/       # Service worker (tab context, permissions, message routing)
│   │   ├── content/          # Content script (reads page text)
│   │   ├── sidepanel/        # React application (main UI)
│   │   └── voice/            # Voice recognition popup logic
│   └── manifest.json         # Chrome Extension Manifest (V3)
├── scripts/                  # Build scripts
│   └── build-extension.mjs   # esbuild & tailwind compilation script
├── dist/                     # Generated build output (Load this in Chrome!)
├── .env                      # Environment variables (API Keys, Ports)
└── package.json              # Project dependencies & npm scripts
```

---

## 🚀 Getting Started

Follow these steps to run Disha locally on your machine.

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- Google Chrome browser
- An [OpenRouter](https://openrouter.ai/) account and API Key.

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd disha
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your configuration:

```env
PORT=8787
OPENAI_API_KEY=your_openrouter_api_key_here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-oss-120b
OPENROUTER_SITE_URL=http://localhost
OPENROUTER_APP_TITLE=Disha
```

### 4. Running the Project

You need to run two processes simultaneously: the backend server and the extension build watcher.

**Start the Backend Server:**
```bash
npm run dev:backend
```
*(Runs on http://localhost:8787)*

**Build the Extension:**
```bash
npm run build
```

### 5. Loading the Extension in Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in your URL bar.
3. Toggle **Developer mode** ON (top right corner).
4. Click **Load unpacked** (top left corner).
5. Select the `dist/extension/` folder located inside your project directory.
6. Pin the Disha extension to your toolbar for easy access!

---

## 🎤 How Voice Input Works (Developer Note)
Because of Chrome's strict Manifest V3 policies, `getUserMedia` (microphone access) is blocked inside Side Panels and Background Service Workers. 

To solve this, Disha uses a **Popup Window Strategy**:
When a user clicks the "Voice Input" button, the background script temporarily opens a small, visible popup window (`voice.html`). Because it is a visible page, it is allowed to request microphone permissions and run the `SpeechRecognition` API. Once the user stops speaking, the text is routed back to the Side Panel, and the popup silently auto-closes.

---

## 📄 License
MIT License
