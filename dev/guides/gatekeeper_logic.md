# Gatekeeper Logic (Quizzes)

## Overview

The **Gatekeeper** (`src/gatekeeper.js`) controls the "Active Recall" mechanism. It prevents the user from simply reading a card; they must "unlock" it by providing the correct concept associated with a location/visual.

## 🕹️ Modes

The system supports three modes, configurable in Settings:

### 1. INPUT (Hard Mode)
*   **Mechanism:** User types the answer into a text box.
*   **Validation:** Fuzzy string matching (Levenshtein Distance).
*   **Benefit:** Highest retention (Recall vs Recognition).

### 2. CHOICE (Easy Mode)
*   **Mechanism:** Multiple choice (1 Correct + 3 Distractors).
*   **Distractor Generation:** The system pulls 3 random *other* items from the same room to serve as wrong answers.
*   **Benefit:** Lower friction, good for tired days.

### 3. DYNAMIC (Adaptive Mode) - *Default*
*   **Mechanism:** Scales difficulty based on your streak.
*   **Logic:**
    *   If `streak < 3`: Show **CHOICE** (Build confidence).
    *   If `streak >= 3`: Show **INPUT** (Force mastery).
    *   *Penalty:* If you fail an INPUT question, streak resets to 0, forcing you back to CHOICE mode.

## 🔍 Fuzzy Matching Logic

To prevent frustration from typos, the system doesn't require 100% character matches. It uses the **Levenshtein Distance** algorithm to calculate how many edits (insertions, deletions, substitutions) are needed to turn the User's Answer into the Correct Answer.

### Thresholds (`src/gatekeeper.js`)

| Word Length | Allowed Typos | Example |
| :--- | :--- | :--- |
| $\le 3$ chars | 0 (Exact) | "ATP" must be "ATP" |
| $\le 8$ chars | 1 | "Nucleus" -> "Nuclues" (✅ Pass) |
| $> 8$ chars | 2 | "Mitochondria" -> "Mitochandria" (✅ Pass) |

### Code Snippet

```javascript
// src/gatekeeper.js

checkAnswer(userAnswer) {
    const dist = this.calculateLevenshtein(normUser, normTarget);
    const threshold = this.getFuzzyThreshold(normTarget.length);

    if (dist <= threshold) return { success: true, ... };
    return { success: false, ... };
}
```
