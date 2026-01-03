
import { settingsManager } from './src/settings_manager.js';

console.log("🧪 Starting Theme Tests...");

// Mock document and documentElement
const styleMap = new Map();
global.document = {
    documentElement: {
        style: {
            setProperty: (key, value) => {
                styleMap.set(key, value);
            }
        }
    },
    body: {
        dataset: {}
    }
};

// Test 1: Apply Dark Theme (Default)
console.log("\nTest 1: Apply Dark Theme (Default)");
settingsManager.update('visuals', 'theme', 'dark');
settingsManager.applySettings();

const bgMain = styleMap.get('--bg-main');
if (bgMain === '#121212') {
    console.log("✅ Dark theme applied correctly.");
} else {
    console.error(`❌ Failed to apply dark theme. --bg-main: ${bgMain}`);
    process.exit(1);
}

// Test 2: Apply Light Theme
console.log("\nTest 2: Apply Light Theme");
settingsManager.update('visuals', 'theme', 'light');
settingsManager.applySettings();

const bgMainLight = styleMap.get('--bg-main');
if (bgMainLight === '#f5f5f5') {
    console.log("✅ Light theme applied correctly.");
} else {
    console.error(`❌ Failed to apply light theme. --bg-main: ${bgMainLight}`);
    process.exit(1);
}

// Test 3: Apply Matrix Theme
console.log("\nTest 3: Apply Matrix Theme");
settingsManager.update('visuals', 'theme', 'matrix');
settingsManager.applySettings();

const textMainMatrix = styleMap.get('--text-main');
if (textMainMatrix === '#00ff00') {
    console.log("✅ Matrix theme applied correctly.");
} else {
    console.error(`❌ Failed to apply matrix theme. --text-main: ${textMainMatrix}`);
    process.exit(1);
}

console.log("\n🎉 All Theme Tests Passed!");
