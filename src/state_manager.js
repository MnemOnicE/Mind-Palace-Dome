/**
 * state_manager.js
 * Manages the persistence of the memory palace.
 * Handles room data, item stats (streaks, last reviewed), and localStorage sync.
 */

const DEFAULT_ROOMS = {
    'foyer': {
        id: 'foyer',
        name: 'The Foyer',
        items: [
            { id: 1, concept: 'Mitochondria', visualURL: 'https://placehold.co/200x200/222/bb86fc?text=Powerhouse', visual: 'Powerhouse', streak: 0, lastReviewed: 0 },
            { id: 2, concept: 'Nucleus', visualURL: 'https://placehold.co/200x200/222/03dac6?text=Brain', visual: 'Brain', streak: 0, lastReviewed: 0 },
            { id: 3, concept: 'Ribosome', visualURL: 'https://placehold.co/200x200/222/cf6679?text=Chef', visual: 'Chef', streak: 0, lastReviewed: 0 }
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
     * Updates an item's stats after a quiz attempt.
     * @param {string} roomId
     * @param {number|string} itemId
     * @param {boolean} success
     */
    updateItemStats(roomId, itemId, success) {
        const room = this.state.rooms[roomId];
        if (!room) return;

        const itemIndex = room.items.findIndex(i => i.id == itemId);
        if (itemIndex === -1) return;

        const item = room.items[itemIndex];

        if (success) {
            item.streak = (item.streak || 0) + 1;
            item.lastReviewed = Date.now();
        } else {
            item.streak = 0; // Reset streak on failure? Or decrement?
            // For now, reset to ensure mastery.
        }

        // Commit change
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
