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
    updateItemDetails(roomId, itemId, newConcept, newVisualURL, targetRoomId = null) {
        const room = this.state.rooms[roomId];
        if (!room) return;
        const itemIndex = room.items.findIndex(i => i.id == itemId);
        if (itemIndex === -1) return;

        const item = room.items[itemIndex];
        if (newConcept) item.concept = newConcept;
        if (newVisualURL) item.visualURL = newVisualURL;
        if (targetRoomId !== null) item.targetRoomId = targetRoomId === '' ? null : targetRoomId;

        this.state.rooms[roomId].items[itemIndex] = item;
        this.saveState();
        return item;
    }

    /**
     * Creates a new room.
     */
    createRoom(name) {
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        if (this.state.rooms[id]) return null; // Already exists

        const newRoom = {
            id: id,
            name: name,
            items: []
        };
        this.state.rooms[id] = newRoom;
        this.saveState();
        return newRoom;
    }

    /**
     * Adds a new item to a room.
     */
    addItem(roomId, concept, visualURL) {
        const room = this.state.rooms[roomId];
        if (!room) return null;

        const newItem = {
            id: Date.now(),
            concept: concept,
            visualURL: visualURL || 'https://placehold.co/200x200?text=?',
            visual: concept,
            streak: 0,
            lastReviewed: 0,
            ...DEFAULT_SRS_STATS,
            dueDate: 0
        };

        room.items.push(newItem);
        this.saveState();
        return newItem;
    }

    /**
     * Reset everything (Debug/Ritual)
     */

    /**
     * Generates a JSON export of the current state.
     */
    exportStateJSON() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Previews a merge operation to let the UI display what will change.
     * @param {Object} importedState
     * @returns {Object} diff - Information about new rooms, new items, and updated items.
     */
    previewMerge(importedState) {
        const diff = {
            newRooms: [],
            roomsWithNewItems: [],
            totalNewItems: 0,
            totalUpdatedItems: 0
        };

        if (!importedState || !importedState.rooms) return diff;

        for (const [roomId, incomingRoom] of Object.entries(importedState.rooms)) {
            const existingRoom = this.state.rooms[roomId];

            if (!existingRoom) {
                diff.newRooms.push(incomingRoom.name);
                diff.totalNewItems += incomingRoom.items.length;
            } else {
                let newItems = 0;
                let updatedItems = 0;

                incomingRoom.items.forEach(incomingItem => {
                    const existingItem = existingRoom.items.find(i => i.id === incomingItem.id);
                    if (!existingItem) {
                        newItems++;
                    } else if (incomingItem.lastReviewed > existingItem.lastReviewed) {
                        updatedItems++; // Only overwrite stats if incoming is newer
                    }
                });

                if (newItems > 0 || updatedItems > 0) {
                    diff.roomsWithNewItems.push(existingRoom.name);
                    diff.totalNewItems += newItems;
                    diff.totalUpdatedItems += updatedItems;
                }
            }
        }

        return diff;
    }

    /**
     * Performs a non-destructive merge of imported state.
     * Overwrites item stats only if incoming lastReviewed is more recent.
     */
    executeMerge(importedState) {
        if (!importedState || !importedState.rooms) return false;

        for (const [roomId, incomingRoom] of Object.entries(importedState.rooms)) {
            const existingRoom = this.state.rooms[roomId];

            if (!existingRoom) {
                // Entire room is new, just copy it over
                this.state.rooms[roomId] = incomingRoom;
            } else {
                // Merge items
                (incomingRoom.items || []).forEach(incomingItem => {
                    const existingItemIndex = existingRoom.items.findIndex(i => i.id === incomingItem.id);
                    if (existingItemIndex === -1) {
                        existingRoom.items.push(incomingItem);
                    } else {
                        // Conflict resolution: keep the most recently reviewed
                        const existingItem = existingRoom.items[existingItemIndex];
                        if ((incomingItem.lastReviewed || 0) > (existingItem.lastReviewed || 0)) {
                            existingRoom.items[existingItemIndex] = { ...existingItem, ...incomingItem };
                        }
                    }
                });
            }
        }

        this.saveState();
        return true;
    }

    reset() {
        this.state = { rooms: DEFAULT_ROOMS };
        this.saveState();
    }
}

export const stateManager = new StateManager();
