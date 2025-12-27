/**
 * settings_manager.js
 * The Central Nervous System for user preferences.
 * Handles persistence, UI rendering, and applying CSS variables.
 */

const DEFAULT_SETTINGS = {
    audio: {
        engine: 'hybrid', // 'hybrid', 'browser', 'espeak'
        voiceId: 'default',
        volume: 0.8
    },
    gatekeeper: {
        mode: 'dynamic', // 'input', 'choice', 'dynamic'
        scalingThreshold: 3
    },
    ai: {
        geminiKey: '',
        generationMode: 'text' // 'text' or 'image' (future)
    },
    visuals: {
        decayStyle: 'both', // 'filter', 'texture', 'both', 'none'
        dualCoding: 'hover', // 'always', 'hover'
        theme: 'dark'
    }
};

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        // In case we run in an environment without DOM (like tests), we skip applySettings
        if (typeof document !== 'undefined') {
            this.applySettings(); // Apply on load
        }
    }

    loadSettings() {
        if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
        const saved = localStorage.getItem('dome_settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dome_settings', JSON.stringify(this.settings));
        }
        if (typeof document !== 'undefined') {
            this.applySettings(); // Real-time update
        }
        console.log("⚙️ Settings saved & applied.");
    }

    // Apply logic to the DOM (CSS Variables, Classes, etc.)
    applySettings() {
        const root = document.documentElement;
        const v = this.settings.visuals;

        // 1. Apply Decay Styles via CSS Variables
        if (v.decayStyle === 'filter' || v.decayStyle === 'both') {
            root.style.setProperty('--decay-filter', '0.4');
            root.style.setProperty('--decay-blur', '1px');
        } else {
            root.style.setProperty('--decay-filter', '0');
            root.style.setProperty('--decay-blur', '0');
        }

        if (v.decayStyle === 'texture' || v.decayStyle === 'both') {
            root.style.setProperty('--decay-texture-opacity', '0.3');
        } else {
            root.style.setProperty('--decay-texture-opacity', '0');
        }

        // 2. Dual Coding Mode
        if (document.body) {
            document.body.dataset.dualCoding = v.dualCoding; // Used by CSS to toggle visibility
        }
    }

    // Helper to get a specific setting safely
    get(category, key) {
        return this.settings[category]?.[key];
    }

    // Update a specific setting and save
    update(category, key, value) {
        const currentCat = this.settings[category] || {};
        const newCat = { ...currentCat, [key]: value };
        this.saveSettings({ [category]: newCat });
    }
}

export const settingsManager = new SettingsManager();
