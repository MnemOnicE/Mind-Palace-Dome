# Contributing to dome-icile

First off, thank you for considering contributing to dome-icile! 🧠🏰

This project has a specific architecture and development philosophy. Please read these guidelines before submitting a Pull Request.

## 🏗️ Technology Stack & Philosophy

*   **Vanilla JavaScript Only:** This project intentionally avoids heavy frontend frameworks (React, Vue, Angular). We rely on ES6 Modules (`import`/`export`) and native DOM APIs.
*   **No Inline CSS/JS:** Keep the separation of concerns strict. CSS goes in `src/styles.css`. Event listeners should be attached dynamically in JS, not inline in HTML (`onclick="..."`).
*   **CSS Variables:** We rely heavily on CSS variables for dynamic theming (Dark, Light, Matrix, Cyberpunk).

## 🤖 The "Agents" Workflow (Important)

This codebase uses a persona-based development workflow. Before making complex architectural decisions, refactoring, or adding dependencies, you are expected to simulate a "Standup Meeting" with our defined agents (Brain, Bolt, Boom, Sentinel, Palette, Scribe, Scope, Orbit).

Please read [AGENTS.md](AGENTS.md) to understand how this protocol works. Decisions from this "debate" should be documented in your PR description or commit messages.

## 🧪 Testing

We use lightweight Node.js scripts for logic testing (no Jest/Mocha required). Tests are located in the root directory.

To run tests:
```bash
node test_srs.mjs
node test_persistence.mjs
node test_settings.mjs
node test_themes.mjs
```
Please ensure all tests pass before submitting a PR. If you are adding a new feature, consider adding a test for it if it involves standalone logic.

## 🚀 Pull Request Process

1.  **Iterative Commits:** The standard workflow is to append commits to your existing branch during PR iteration.
2.  **Clean up:** Remove any temporary scratchpad scripts (e.g., Python scripts used for visual verification) before requesting a review.
3.  **Merge Conflicts:** If merge conflicts persist or the remote branch is corrupted, the strategy is to submit the verified state to a new branch to open a fresh PR.

## 📚 Further Reading

For more details on how the system works, check the `dev/` directory:
*   [Getting Started Guide](dev/guides/getting_started.md)
*   [System Architecture](dev/architecture/system_overview.md)
