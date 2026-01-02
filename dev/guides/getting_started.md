# Getting Started Guide

Welcome to **dome-icile**! 🧠🏰

This guide will help you set up the project, understand the file structure, and walk you through adding a new feature.

## 🛠️ Prerequisites

*   **Node.js** (Optional, for running tests).
*   **Python 3** (or any simple HTTP server) for running the app locally.
*   **Git** for version control.

## 🚀 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/dome-icile.git
    cd dome-icile
    ```

2.  **Environment Setup**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   (Optional) Add your Google Gemini API Key to `.env` if you want AI image generation.

3.  **Run the Application**
    Because this project uses ES6 Modules (`import`/`export`), you cannot simply open `index.html` in your browser. You must serve it via HTTP.

    *   **Using Python (Recommended):**
        ```bash
        ./startup.sh
        # Or manually: python3 -m http.server 8000
        ```
    *   Open your browser to `http://localhost:8000`.

## 📂 Project Structure

```
dome-icile/
├── src/                  # Source code
│   ├── app.js            # Main controller (UI, Events)
│   ├── state_manager.js  # Data persistence (Rooms, Items)
│   ├── settings_manager.js # User preferences
│   ├── srs_engine.js     # Spaced Repetition Logic (Math)
│   ├── audio_engine.js   # TTS and STT Logic
│   ├── prompt_engine.js  # AI Prompt Logic (Foundry)
│   ├── gatekeeper.js     # Quiz Logic
│   └── styles.css        # Global Styles
├── dev/                  # Developer Documentation (You are here)
├── verification/         # Playwright E2E tests
├── test_*.mjs            # Unit tests (Node.js)
├── index.html            # Main entry point
└── AGENTS.md             # The "Persona" workflow protocol
```

## 👩‍💻 How to Add a Feature

Let's walk through adding a hypothetical feature: **"Item Colors"** (allowing users to tag items with a color).

### Step 1: Update the Data Model (`src/state_manager.js`)
You need to store the color.
1.  Go to `addItem` function.
2.  Add a `color` property to the new item object.
3.  Update `updateItemDetails` to allow changing the color.

### Step 2: Update the UI (`src/app.js` or HTML)
1.  In `renderRoom()`, update the HTML string for the card to include a color picker or display the color.
2.  In `setupEventListeners()`, listen for color changes and call `stateManager.updateItemDetails(...)`.

### Step 3: Style it (`src/styles.css`)
1.  Add CSS classes for the new colors.
2.  Use CSS variables if the colors are dynamic.

### Step 4: Verify
1.  Reload the page.
2.  Create an item.
3.  Change the color.
4.  **Refresh the page.** (Crucial! This tests `localStorage` persistence).
5.  If the color remains, you succeeded!

## 🧪 Running Tests

We use lightweight Node.js scripts for logic testing.

```bash
# Test the SRS Math
node test_srs.mjs

# Test Persistence
node test_persistence.mjs
```

## 🤖 The "Agents" Workflow

If you are stuck or need architectural advice, consult `AGENTS.md`. It describes a "Standup Protocol" where you simulate a debate between different personas (e.g., **Bolt** for speed, **Sentinel** for security) to reach a decision.
