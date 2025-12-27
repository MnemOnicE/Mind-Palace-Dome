/**
 * state_manager.js
 * Manages the persistence of the memory palace.
 * Handles room data, item stats (streaks, last reviewed), and localStorage sync.
 */

import { calculateNextReview, DEFAULT_SRS_STATS } from './srs_engine.js';

const DEFAULT_ROOMS = {
    'foyer': {
        id: 'foyer',
        name: 'The Foyer',
        items: [
            { id: 1, concept: 'Mitochondria', visualURL: 'https://placehold.co/200x200/222/bb86fc?text=Powerhouse', visual: 'Powerhouse', streak: 0, lastReviewed: 0, ...DEFAULT_SRS_STATS, dueDate: 0 },
            { id: 2, concept: 'Nucleus', visualURL: 'https://placehold.co/200x200/222/03dac6?text=Brain', visual: 'Brain', streak: 0, lastReviewed: 0, ...DEFAULT_SRS_STATS, dueDate: 0 },
            { id: 3, concept: 'Ribosome', visualURL: 'https://placehold.co/200x200/222/cf6679?text=Chef', visual: 'Chef', streak: 0, lastReviewed: 0, ...DEFAULT_SRS_STATS, dueDate: 0 }
        ]
    }
};

class StateManager {
    constructor() {
        this.storageKey = 'dome_state';
        this.state = this.loadState();
    }

    loadState() {
        if (typeof localStorage === 'undefined') return { rooms: DEFAULT_ROOMS };

        const saved = localStorage.getItem(this.storageKey);
        if (!saved) {
            // Seed defaults
            return { rooms: DEFAULT_ROOMS };
        }
        return JSON.parse(saved);
    }

    saveState() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        }
    }

    getRoom(roomId) {
        return this.state.rooms[roomId];
    }

    /**
     * Updates an item's stats after a review/quiz.
     * @param {string} roomId
     * @param {number|string} itemId
     * @param {number} grade - 0-5 grade or simple boolean (legacy)
     */
    updateItemStats(roomId, itemId, grade) {
        const room = this.state.rooms[roomId];
        if (!room) return;

        const itemIndex = room.items.findIndex(i => i.id == itemId);
        if (itemIndex === -1) return;

        let item = room.items[itemIndex];

        // Handle Legacy Boolean Calls (from old Quiz mode)
        // If success (true) -> Grade 4. If failure (false) -> Grade 1.
        if (typeof grade === 'boolean') {
            grade = grade ? 4 : 1;
        }

        // Apply SRS logic
        const currentStats = {
            interval: item.interval || 0,
            repetition: item.repetition || 0,
            easeFactor: item.easeFactor || 2.5
        };

        const newStats = calculateNextReview(currentStats, grade);

        // Merge updates
        item = { ...item, ...newStats, lastReviewed: Date.now() };

        // Legacy support: Keep 'streak' roughly aligned with 'repetition'
        item.streak = item.repetition;

        // Commit change
        this.state.rooms[roomId].items[itemIndex] = item;
        this.saveState();

        return item;
    }

    /**
     * Updates item details (Editing).
     */
    updateItemDetails(roomId, itemId, newConcept, newVisualURL) {
        const room = this.state.rooms[roomId];
        if (!room) return;
        const itemIndex = room.items.findIndex(i => i.id == itemId);
        if (itemIndex === -1) return;

        const item = room.items[itemIndex];
        if (newConcept) item.concept = newConcept;
        if (newVisualURL) item.visualURL = newVisualURL;

        this.state.rooms[roomId].items[itemIndex] = item;
        this.saveState();
        return item;
    }

    /**
     * Reset everything (Debug/Ritual)
     */
    reset() {
        this.state = { rooms: DEFAULT_ROOMS };
        this.saveState();
    }
}

export const stateManager = new StateManager();
