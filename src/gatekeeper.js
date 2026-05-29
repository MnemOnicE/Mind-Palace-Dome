/**
 * gatekeeper.js
 * Logic for the "Boss Battles" / Memory Quizzes.
 * Supports: 'INPUT' (Text), 'CHOICE' (Multiple Choice), 'DYNAMIC' (Scaling)
 */

class Gatekeeper {
    constructor(config = {}) {
        this.type = config.type || 'DYNAMIC'; // Default to scaling
        this.targetAnswer = config.answer; // The correct concept (e.g. "Mitochondria")
        this.question = config.question || "What resides here?";

        // DYNAMIC SCALING SETTINGS
        this.scalingThreshold = config.scalingThreshold || 3; // Successes needed to level up
        this.consecutiveSuccesses = config.history?.successes || 0; // Load from save state
    }

    /**
     * Generates the quiz object for the UI to render.
     * @param {Array} roomItems - List of other items in the room (to generate wrong answers)
     */
    generateQuiz(roomItems) {
        let currentMode = this.type;

        // If Dynamic, determine the actual mode based on history
        if (this.type === 'DYNAMIC') {
            currentMode = (this.consecutiveSuccesses >= this.scalingThreshold)
                ? 'INPUT'
                : 'CHOICE';
        }

        const quizPayload = {
            mode: currentMode,
            question: this.question,
            choices: [] // Only populated if mode is CHOICE
        };

        if (currentMode === 'CHOICE') {
            quizPayload.choices = this.generateDistractors(roomItems);
        }

        return quizPayload;
    }

    /**
     * Validates the user's answer and updates scaling history.
     * @param {String} userAnswer
     */
    checkAnswer(userAnswer, isVoice = false) {
        // Normalize strings (ignore case, whitespace) for fair grading
        const normUser = this.normalize(userAnswer);
        const normTarget = this.normalize(this.targetAnswer);

        // 1. Exact Match
        if (normUser === normTarget) {
            this.consecutiveSuccesses++;
            return { success: true, message: "The gate opens...", newStreak: this.consecutiveSuccesses };
        }

        // 2. Fuzzy Match
        const dist = this.calculateLevenshtein(normUser, normTarget);
        const threshold = isVoice ? this.getVoiceFuzzyThreshold(normTarget.length) : this.getFuzzyThreshold(normTarget.length);

        if (dist <= threshold) {
            this.consecutiveSuccesses++;
            return { success: true, message: `Close enough! The answer was ${this.targetAnswer}.`, newStreak: this.consecutiveSuccesses };
        }

        // 3. Failure
        // Failure in Dynamic mode resets progress to ensure mastery
        if (this.type === 'DYNAMIC') this.consecutiveSuccesses = 0;
        return { success: false, message: "The gate remains shut.", newStreak: 0 };
    }

    getVoiceFuzzyThreshold(length) {
        if (length <= 3) return 1;
        if (length <= 6) return 2;
        if (length <= 10) return 4;
        return 6;
    }

    getFuzzyThreshold(length) {
        if (length <= 3) return 0; // "ATP" must be exact
        if (length <= 8) return 1; // "Nucleus" allows 1 typo
        return 2;                  // "Mitochondria" allows 2 typos
    }

    calculateLevenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    /**
     * Pick 3 random wrong answers from the room + the correct answer
     */
    generateDistractors(roomItems) {
        // Filter out the correct answer to avoid duplicates
        const otherItems = roomItems.filter(item => item.concept !== this.targetAnswer);

        // Shuffle and pick 3
        const distractors = otherItems.sort(() => 0.5 - Math.random()).slice(0, 3);

        // Add correct answer and shuffle again
        const options = [...distractors.map(i => i.concept), this.targetAnswer];
        return options.sort(() => 0.5 - Math.random());
    }

    normalize(str) {
        if (!str) return "";
        return str.trim().toLowerCase();
    }
}

export default Gatekeeper;
