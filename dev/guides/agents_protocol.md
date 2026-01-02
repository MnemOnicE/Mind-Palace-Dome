# The "Agents" Protocol

## 🧠 Overview

**dome-icile** is not just built by writing code; it is built by simulating a development team. The `AGENTS.md` file in the root directory defines a set of **Personas** (Agents) that "live" in the codebase.

When making complex decisions, you should simulate a **Standup Meeting** between these agents.

## 👥 The Roster

| Agent | Role | Focus | Mantra |
| :--- | :--- | :--- | :--- |
| **Brain** | Team Lead | Consensus | "Synthesize and Decide." |
| **Bolt** | Performance | Speed/Latency | "Speed is a feature." |
| **Boom** | Product | Features/Shipping | "Ship it." |
| **Sentinel** | Security | Safety/Validation | "Trust nothing." |
| **Palette** | UX/UI | Accessibility/Feel | "Make it feel human." |
| **Scribe** | Docs | Maintainability | "Write it down." |
| **Scope** | QA | Edge Cases | "Everything breaks." |
| **Orbit** | DevOps | Infra/Stability | "Works in Prod." |

## 🗣️ The Standup Workflow

1.  **Contextualize:** Define the problem (e.g., "Should we use a library for fuzzy matching?").
2.  **The Debate:**
    *   **Boom:** "Use a library! It's faster to build."
    *   **Bolt:** "No! Libraries are heavy. Write a raw Levenshtein function. It's only 20 lines."
    *   **Sentinel:** "If we write it ourselves, we might introduce bugs. A well-tested library is safer."
3.  **Synthesis (Brain):** "Bolt is right about size, but Sentinel is right about safety. However, Levenshtein is a standard algorithm."
4.  **Verdict:** "We will write a raw function (for Bolt) but add heavy unit tests (for Sentinel)."

## 📝 When to Use This?

Use this protocol when:
1.  **Refactoring:** Weighing code cleanliness vs. risk of breaking things.
2.  **Adding Dependencies:** Weighing development speed vs. bundle size.
3.  **Architectural Changes:** Changing how State Manager works.

## Example

See `AGENTS.md` for the full prompt to paste into an LLM to simulate this meeting.
