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
    checkAnswer(userAnswer) {
        // Normalize strings (ignore case, whitespace) for fair grading
        const isCorrect = this.normalize(userAnswer) === this.normalize(this.targetAnswer);

        if (isCorrect) {
            this.consecutiveSuccesses++;
            return { success: true, message: "The gate opens...", newStreak: this.consecutiveSuccesses };
        } else {
            // Failure in Dynamic mode resets progress to ensure mastery
            if (this.type === 'DYNAMIC') this.consecutiveSuccesses = 0;
            return { success: false, message: "The gate remains shut.", newStreak: 0 };
        }
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
