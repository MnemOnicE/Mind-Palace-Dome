
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

// 2. Test Update Stats (Legacy Success)
console.log('Test 2: Updating Item Stats (Legacy Success)');
const itemId = 1;
const initialItem = room.items.find(i => i.id === itemId);
const initialStreak = initialItem.streak || 0;

stateManager.updateItemStats('foyer', itemId, true);

const updatedRoom = stateManager.getRoom('foyer');
const updatedItem = updatedRoom.items.find(i => i.id === itemId);

assert.strictEqual(updatedItem.streak, initialStreak + 1, 'Streak should increment (Legacy Mode)');
assert.ok(updatedItem.lastReviewed > 0, 'lastReviewed should be updated');
console.log('✅ Update Success verified.');

// 2b. Test SRS Update (Grade 5)
console.log('Test 2b: Updating Item Stats (SRS Grade 5)');
const itemId2 = 2;
stateManager.updateItemStats('foyer', itemId2, 5); // Grade 5 = Easy
const srsItem = stateManager.getRoom('foyer').items.find(i => i.id === itemId2);

assert.strictEqual(srsItem.streak, 1, 'Streak should be 1');
assert.strictEqual(srsItem.repetition, 1, 'Repetition should be 1');
assert.strictEqual(srsItem.interval, 1, 'Interval should be 1 day');
assert.ok(srsItem.dueDate > Date.now(), 'Due Date should be in future');
console.log('✅ SRS Update verified.');

// 2c. Test Item Editing
console.log('Test 2c: Editing Item Details');
stateManager.updateItemDetails('foyer', itemId2, 'Super Brain', 'http://new.img');
const editedItem = stateManager.getRoom('foyer').items.find(i => i.id === itemId2);
assert.strictEqual(editedItem.concept, 'Super Brain', 'Concept updated');
assert.strictEqual(editedItem.visualURL, 'http://new.img', 'URL updated');
console.log('✅ Item Editing verified.');

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

// 4. Test Create Room
console.log('Test 4: Create Room');
const newRoom = stateManager.createRoom('The Library');
assert.ok(newRoom, 'Room should be created');
assert.strictEqual(newRoom.id, 'the-library', 'Room ID should be slugified');
assert.strictEqual(newRoom.name, 'The Library', 'Room name should match');
assert.strictEqual(stateManager.getRoom('the-library').name, 'The Library', 'Room should be retrievable');

const duplicateRoom = stateManager.createRoom('The Library');
assert.strictEqual(duplicateRoom, null, 'Should not create duplicate room');
console.log('✅ Create Room verified.');

// 5. Test Add Item
console.log('Test 5: Add Item');
const newItem = stateManager.addItem('the-library', 'Book of Secrets', 'http://book.img');
assert.ok(newItem, 'Item should be added');
assert.strictEqual(newItem.concept, 'Book of Secrets', 'Concept should match');
assert.strictEqual(newItem.streak, 0, 'Default streak should be 0');
assert.strictEqual(newItem.interval, 0, 'Default interval should be 0');
assert.ok(newItem.id > 0, 'ID should be generated');

const roomItems = stateManager.getRoom('the-library').items;
assert.strictEqual(roomItems.length, 1, 'Room should have 1 item');
assert.strictEqual(roomItems[0].id, newItem.id, 'Item should be in the room');
console.log('✅ Add Item verified.');

console.log('🎉 All Tests Passed!');
