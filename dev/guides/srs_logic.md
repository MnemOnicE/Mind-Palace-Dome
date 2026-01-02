# Spaced Repetition System (SRS) Logic

## Overview

The core of **dome-icile**'s memory retention is the **SRS Engine** (`src/srs_engine.js`). It determines *when* you should review a memory to ensure it moves from short-term to long-term memory.

The system uses a modified version of the **SuperMemo-2 (SM-2)** algorithm.

## 🧮 The Algorithm (Math)

The algorithm calculates three values for the next review:
1.  **Interval ($I$)**: Days until the next review.
2.  **Repetition ($n$)**: The number of consecutive successful reviews.
3.  **Ease Factor ($EF$)**: A multiplier representing the "easiness" of the memory.

### Inputs
*   **Current Stats**: ($I_{prev}$, $n_{prev}$, $EF_{prev}$)
*   **Grade ($q$)**: User rating from 0-5.
    *   **5**: Perfect recall.
    *   **4**: Correct after hesitation.
    *   **3**: Correct with serious difficulty.
    *   **2**: Incorrect, but easy to recall correct answer.
    *   **1**: Incorrect, correct answer remembered.
    *   **0**: Complete blackout.

### Formulas

#### 1. Update Repetition ($n$) & Interval ($I$)

If $q \ge 3$ (Correct response):
$$
n = n_{prev} + 1
$$

$$
I = \begin{cases}
1 & \text{if } n = 1 \\
6 & \text{if } n = 2 \\
\text{round}(I_{prev} \times EF_{prev}) & \text{if } n > 2
\end{cases}
$$

If $q < 3$ (Incorrect response):
$$
n = 0
$$
$$
I = 1
$$

#### 2. Update Ease Factor ($EF$)

The Ease Factor adjusts based on how hard the user found the item. It starts at **2.5**.

$$
EF' = EF_{prev} + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))
$$

*   **Constraint:** $EF$ cannot drop below **1.3**.
*   *Note:* If the user rates it "Hard" ($q=3$), the $EF$ drops significantly. If "Easy" ($q=5$), it rises slightly.

#### 3. Calculate Due Date

$$
\text{DueDate} = \text{Date.now()} + (I \times 24 \times 60 \times 60 \times 1000)
$$

## 📉 Example Walkthrough

**Scenario:** You create a new item "Mitochondria".
*   *Start:* $I=0, n=0, EF=2.5$.

**Review 1:** You rate it **"Good" (4)**.
*   $q = 4 \ge 3$, so correct.
*   $n = 0 + 1 = 1$.
*   $I = 1$ day.
*   $EF$ update: $2.5 + (0.1 - (1) \times (0.08 + 1 \times 0.02)) = 2.5$. (No change for grade 4).
*   **Result:** See it again tomorrow.

**Review 2 (Next Day):** You rate it **"Easy" (5)**.
*   $q = 5$.
*   $n = 1 + 1 = 2$.
*   $I = 6$ days.
*   $EF$ update: $EF$ increases to ~2.6.
*   **Result:** See it in 6 days.

**Review 3 (6 Days later):** You rate it **"Hard" (3)**.
*   $q = 3$.
*   $n = 2 + 1 = 3$.
*   $I = \text{round}(6 \times 2.6) = 16$ days.
*   $EF$ update: $EF$ decreases (penalty for struggle).
*   **Result:** See it in 16 days.

**Review 4 (16 Days later):** You **Fail (1)**.
*   $q = 1$.
*   $n = 0$ (Streak reset!).
*   $I = 1$ day.
*   $EF$ decreases further.
*   **Result:** Back to square one (sort of). You see it tomorrow.

## 💻 Code Implementation

See `src/srs_engine.js`:

```javascript
export function calculateNextReview(currentStats, grade) {
    // ... implementation ...
}
```
