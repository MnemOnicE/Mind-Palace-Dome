/**
 * srs_engine.js
 * Implements the SuperMemo-2 (SM-2) Spaced Repetition Algorithm.
 * Adapted for the "Dome" (Mind Palace) context.
 */

// Default starting values
export const DEFAULT_SRS_STATS = {
    interval: 0,    // Days (0 means new/learning)
    repetition: 0,  // Successive successful reviews
    easeFactor: 2.5 // Difficulty multiplier
};

/**
 * Calculates the next review schedule.
 * @param {Object} currentStats - { interval, repetition, easeFactor }
 * @param {number} grade - Performance rating (0-5)
 *      5 - perfect response
 *      4 - correct response after hesitation
 *      3 - correct response recalled with serious difficulty
 *      2 - incorrect response; where the correct one seemed easy to recall
 *      1 - incorrect response; the correct one remembered
 *      0 - complete blackout.
 * @returns {Object} { interval, repetition, easeFactor, dueDate }
 */
export function calculateNextReview(currentStats, grade) {
    let { interval, repetition, easeFactor } = currentStats;

    // Constrain grade
    if (grade < 0) grade = 0;
    if (grade > 5) grade = 5;

    if (grade >= 3) {
        // Correct response
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetition += 1;
    } else {
        // Incorrect response
        repetition = 0;
        interval = 1;
    }

    // Update Ease Factor
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

    // Constraint: EF cannot drop below 1.3
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Calculate Due Date (Now + Interval in Days)
    // For demo purposes, we might want "Days" to be shorter, but let's stick to real time first.
    // However, if we want to demo it, we might need a multiplier.
    // Let's stick to standard days for now, but maybe expose a "timeUnit" config if needed.
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const dueDate = Date.now() + (interval * ONE_DAY_MS);

    return {
        interval,
        repetition,
        easeFactor,
        dueDate
    };
}
