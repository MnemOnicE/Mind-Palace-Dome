import { settingsManager } from './settings_manager.js';
import Gatekeeper from './gatekeeper.js';

// Mock Data
const currentRoom = {
    id: 'foyer',
    name: 'The Foyer',
    items: [
        { id: 1, concept: 'Mitochondria', visualURL: 'https://placehold.co/200x200/222/bb86fc?text=Powerhouse', visual: 'Powerhouse' },
        { id: 2, concept: 'Nucleus', visualURL: 'https://placehold.co/200x200/222/03dac6?text=Brain', visual: 'Brain' },
        { id: 3, concept: 'Ribosome', visualURL: 'https://placehold.co/200x200/222/cf6679?text=Chef', visual: 'Chef' }
    ]
};

// Initialize Gatekeeper
const gatekeeper = new Gatekeeper({
    type: settingsManager.get('gatekeeper', 'mode'),
    answer: 'Mitochondria', // Just for demo purposes
    scalingThreshold: settingsManager.get('gatekeeper', 'scalingThreshold')
});

function renderRoom(room) {
    const roomContainer = document.getElementById('room-view');
    if (!roomContainer) return;

    roomContainer.innerHTML = ''; // Clear previous

    room.items.forEach(item => {
        const itemCard = document.createElement('div');
        // We add 'room-card' and 'dusty' to demonstrate the visual effect
        // In a real app, 'dusty' would depend on last visit time
        itemCard.className = `loci-item room-card dusty`;

        // The Visual Hook
        const image = document.createElement('img');
        image.src = item.visualURL;
        image.alt = item.visual;

        // The Verbal Hook
        const label = document.createElement('div');
        label.className = 'loci-label';
        label.innerText = item.concept;

        // EVENT: Mouseover triggers "Reveal" if in Recall Mode (Dual Coding)
        itemCard.addEventListener('mouseenter', () => {
            if (document.body.dataset.dualCoding === 'hover') {
                label.classList.add('revealed');
                // Audio hint could go here
            }
        });

        // Remove 'dusty' on interaction (Cleaning Ritual)
        itemCard.addEventListener('click', () => {
            itemCard.classList.remove('dusty');
        });

        itemCard.appendChild(image);
        itemCard.appendChild(label);
        roomContainer.appendChild(itemCard);
    });
}

// Global UI Functions (attached to window for HTML onclicks)

window.toggleSettings = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
};

window.showTab = function(tabName) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Deactivate all tabs
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

    // Show target
    document.getElementById(`tab-${tabName}`).classList.add('active');
    // Activate button (trickier since we don't have reference to button, but we can query by text or logic)
    // For simplicity, we assume the button calling this updates its own class or we re-render?
    // Let's just find the button that calls this function? No, easier to just rely on user clicking.
    // Actually, we should update the tab button styles.
    const buttons = document.querySelectorAll('.tab');
    buttons.forEach(btn => {
        if (btn.innerText.toLowerCase().includes(tabName) || btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });
};

window.updateSetting = function(category, key, value) {
    const currentSettings = {};
    if (!currentSettings[category]) currentSettings[category] = {};
    currentSettings[category][key] = value;

    settingsManager.saveSettings(currentSettings);

    // Re-render logic if needed (e.g. if Gatekeeper mode changed)
    // renderRoom(currentRoom);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderRoom(currentRoom);

    // Setup Settings UI state from saved settings
    const visualSettings = settingsManager.get('visuals', 'decayStyle');
    const dualCoding = settingsManager.get('visuals', 'dualCoding');
    const gkMode = settingsManager.get('gatekeeper', 'mode');

    // Set initial values in inputs
    const decaySelect = document.getElementById('set-decay-style');
    if (decaySelect) decaySelect.value = visualSettings;

    const gkSelect = document.getElementById('set-gk-mode');
    if (gkSelect) gkSelect.value = gkMode;

    // For dual coding buttons, we don't have IDs, so we skip setting active class for now
    // But the functionality works.
});
