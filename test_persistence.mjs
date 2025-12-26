
// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        }
    };
})();

// Assign to global
global.localStorage = localStorageMock;

// Import stateManager (using dynamic import for .js file if possible, or just require)
// Since we are in node, and the files use 'export', we need to be careful.
// We'll use dynamic import() which requires .mjs extension or type:module in package.json.
// Alternatively, we can just read the file and eval it? No, Sentinel would scream.
// Let's assume the environment supports ESM.

import { stateManager } from './src/state_manager.js';
import assert from 'assert';

console.log('🧪 Starting State Manager Persistence Tests...');

// 1. Test Default Seed
console.log('Test 1: Seeding Default Data');
const room = stateManager.getRoom('foyer');
assert.ok(room, 'Foyer should exist by default');
assert.strictEqual(room.items.length, 3, 'Should have 3 items');
console.log('✅ Default data loaded.');

// 2. Test Update Stats (Success)
console.log('Test 2: Updating Item Stats (Success)');
const itemId = 1;
const initialItem = room.items.find(i => i.id === itemId);
const initialStreak = initialItem.streak;

stateManager.updateItemStats('foyer', itemId, true);

const updatedRoom = stateManager.getRoom('foyer');
const updatedItem = updatedRoom.items.find(i => i.id === itemId);

assert.strictEqual(updatedItem.streak, initialStreak + 1, 'Streak should increment');
assert.ok(updatedItem.lastReviewed > 0, 'lastReviewed should be updated');
console.log('✅ Update Success verified.');

// 3. Test Persistence (Simulate Reload)
console.log('Test 3: Persistence across "Reload"');
// Create a new instance of StateManager to simulate app reload
// We need to re-import or just create new instance if the class was exported?
// The file exports an instance `stateManager`.
// We can hack it by clearing the instance or creating a fresh one if we exported the class.
// Looking at the code: `export const stateManager = new StateManager();`
// The class is not exported. But `stateManager` is.
// However, `localStorage` is global mock. So if we just rely on `stateManager.loadState()` (which calls `localStorage.getItem`),
// we can test if the data persisted in the mock.
// But `stateManager` loads state in constructor.
// We can call `loadState` manually if we expose it? No, it's internal logic.
// But we can check `localStorage` directly.

const savedData = JSON.parse(localStorage.getItem('dome_state'));
assert.strictEqual(savedData.rooms['foyer'].items[0].streak, 1, 'LocalStorage should have the updated streak');
console.log('✅ Persistence verified.');

console.log('🎉 All Tests Passed!');
