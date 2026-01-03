/**
 * settings_manager.js
 * The Central Nervous System for user preferences.
 * Handles persistence, UI rendering, and applying CSS variables.
 */

const DEFAULT_SETTINGS = {
    audio: {
        engine: 'browser', // 'browser', 'openai'
        openAIKey: '',
        recordingMode: 'toggle', // 'toggle', 'hold'
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

const THEMES = {
    dark: {
        '--bg-main': '#121212',
        '--bg-card': '#1e1e1e',
        '--bg-element': '#2a2a2a',
        '--bg-input': '#333',
        '--bg-modal-overlay': 'rgba(0,0,0,0.8)',
        '--border-main': '#333',
        '--border-highlight': '#444',
        '--border-input': '#555',
        '--text-main': '#e0e0e0',
        '--text-header': '#bb86fc',
        '--text-hint': '#888',
        '--accent-color': '#03dac6',
        '--error-color': '#cf6679',
        '--btn-text': '#000'
    },
    light: {
        '--bg-main': '#f5f5f5',
        '--bg-card': '#ffffff',
        '--bg-element': '#e0e0e0',
        '--bg-input': '#f0f0f0',
        '--bg-modal-overlay': 'rgba(0,0,0,0.5)',
        '--border-main': '#ddd',
        '--border-highlight': '#ccc',
        '--border-input': '#bbb',
        '--text-main': '#121212',
        '--text-header': '#6200ee',
        '--text-hint': '#666',
        '--accent-color': '#03dac6',
        '--error-color': '#b00020',
        '--btn-text': '#000'
    },
    matrix: {
        '--bg-main': '#000000',
        '--bg-card': '#0d0d0d',
        '--bg-element': '#001a00',
        '--bg-input': '#003300',
        '--bg-modal-overlay': 'rgba(0,50,0,0.9)',
        '--border-main': '#003300',
        '--border-highlight': '#004400',
        '--border-input': '#005500',
        '--text-main': '#00ff00',
        '--text-header': '#00cc00',
        '--text-hint': '#008800',
        '--accent-color': '#00ff00',
        '--error-color': '#ff0000',
        '--btn-text': '#000'
    },
    cyberpunk: {
        '--bg-main': '#0d0221',
        '--bg-card': '#261447',
        '--bg-element': '#2e003e',
        '--bg-input': '#5a189a',
        '--bg-modal-overlay': 'rgba(20,0,40,0.9)',
        '--border-main': '#ff006e',
        '--border-highlight': '#8338ec',
        '--border-input': '#3a0ca3',
        '--text-main': '#ffbe0b',
        '--text-header': '#fb5607',
        '--text-hint': '#ff006e',
        '--accent-color': '#3a86ff',
        '--error-color': '#ff0000',
        '--btn-text': '#fff'
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

        // 1. Apply Theme
        const theme = THEMES[v.theme] || THEMES['dark'];
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // 2. Apply Decay Styles via CSS Variables
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

        // 3. Dual Coding Mode
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
