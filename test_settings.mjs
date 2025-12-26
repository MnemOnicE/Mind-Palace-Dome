
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

import { settingsManager } from './src/settings_manager.js';
import assert from 'assert';

console.log('🧪 Starting Settings Manager Tests...');

// 1. Test Default Settings
console.log('Test 1: Default Settings');
const defaultSettings = settingsManager.settings;
assert.strictEqual(defaultSettings.visuals.theme, 'dark', 'Default theme should be dark');
console.log('✅ Default settings verified.');

// 2. Test Update Setting
console.log('Test 2: Update Setting');
settingsManager.update('visuals', 'theme', 'light');
assert.strictEqual(settingsManager.get('visuals', 'theme'), 'light', 'Theme should be updated to light');
console.log('✅ Update Setting verified.');

// 3. Test Persistence
console.log('Test 3: Persistence');
const saved = JSON.parse(localStorage.getItem('dome_settings'));
assert.strictEqual(saved.visuals.theme, 'light', 'LocalStorage should have the updated theme');
console.log('✅ Persistence verified.');

console.log('🎉 All Settings Tests Passed!');
