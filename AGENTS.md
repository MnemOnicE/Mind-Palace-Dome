# 🤖 Agent Protocol: The Coding Squad x Jules

This document defines the collaboration protocol between **The Coding Squad** (Architects) and **Jules** (Asynchronous Fabricator).

---

## 1. Hierarchy & Roles

### 🧠 The Architects (The Coding Squad)
* **Brain (Manager):** Defines the JSON schema, directory structure, and high-level logic flow. *All tasks for Jules must be approved by Brain first.*
* **Boom (Features):** Writes the "Prompt Engineering" logic for features. Defines *what* the feature does.
* **Bolt (Performance):** sets the constraints (e.g., "Must load under 200ms"). Reviews Jules' code for efficiency.
* **Sentinel (Security):** The Gatekeeper. Validates that Jules has not exposed API keys or introduced XSS vulnerabilities.
* **Palette (UX):** Provides the HTML structure and CSS variables. Jules implements the logic behind them.

### 🛠️ The Fabricator (Jules)
* **Role:** Implementation, debugging, and refactoring.
* **Operation:** Asynchronous execution of specific tasks defined by the Squad.
* **Clearance:** Level 2 (Code Access). *No access to production secrets or `.env` files.*

---

## 2. Workflow Protocol: "The Spec-Check-Merge Loop"

Since Jules works asynchronously, tasks must be handed off with zero ambiguity.

### Phase 1: Specification (Brain)
Before invoking Jules, ensure the request contains:
1.  **Context:** "We are building the `foundry_controller.js`."
2.  **Constraint:** "Use ES6 modules. No external dependencies."
3.  **Output:** "Return only the JavaScript code block."

### Phase 2: Fabrication (Jules)
Jules implements the code. *Note: If Jules gets stuck, provide the specific error log from the browser console, not just "it didn't work."*

### Phase 3: The Sentinel Audit (Critical)
**Before committing any code from Jules:**
1.  **Sanitize:** Check for hardcoded API keys. (Jules often tries to be helpful by adding placeholder keys—delete them).
2.  **Verify:** Run `startup.sh` locally.
3.  **Scan:** Check for infinite loops in `while` or `canvas` rendering loops.

---

## 3. Hard Rules (The Guardrails)

### 🛡️ Security (Sentinel)
1.  **NEVER** commit `.env` files. Jules instructions must explicitly state: *"Use process.env or settingsManager.get() for variables."*
2.  **No External CDNs:** Unless explicitly authorized by Brain, do not import scripts via URL (security risk). All libraries must be local or standard.
3.  **Input Sanitization:** Any user input (especially for the 'Gatekeeper') must be sanitized before rendering to HTML to prevent XSS.

### ⚡ Performance (Bolt)
1.  **Lazy Loading:** All assets (images/audio) in the "Palace" must use lazy loading or pre-fetching logic.
2.  **Canvas Optimization:** In `blueprint_view.js`, ensure the render loop uses `requestAnimationFrame`.
3.  **State Management:** Do not bloat `localStorage`. Save only the JSON map, not base64 images.

### 🎨 UX/UI (Palette)
1.  **Dark Mode First:** All CSS must prioritize the `#121212` background palette.
2.  **Touch Targets:** Buttons must be at least 44px height for mobile usage.
3.  **Smooth Degredation:** If WebGL/Canvas fails, the app must fallback to a list view.

---

## 4. Areas of Concern (Watchlist)

* **Hallucination Risk:** Jules may invent API endpoints for Gemini or OpenAI that do not exist. *Always verify the endpoint URL in `api_client.js` against official documentation.*
* **Dependency Creep:** Jules prefers using libraries (like `lodash` or `axios`). We are a **Vanilla JS** shop to keep the app lightweight. Reject unnecessary imports.
* **Audio Autoplay:** Browsers block audio that isn't triggered by user interaction. Ensure Jules binds all `audioEngine.speak()` calls to a click or keypress event first.

---

## 5. Emergency Override

If the codebase becomes unstable:
1.  Revert to the last commit tagged `stable`.
2.  Run `git clean -fdx` to remove generated artifacts.
3.  Consult **Brain** for a re-architecture.
