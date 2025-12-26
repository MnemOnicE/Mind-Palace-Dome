import { settingsManager } from './settings_manager.js';
import { stateManager } from './state_manager.js';
import Gatekeeper from './gatekeeper.js';
import { enhancePrompt } from './prompt_engine.js';

// Configuration
const DECAY_INTERVAL_MS = 30000; // 30 seconds for demo (Real app: 24h)

// State
let activeGatekeeper = null;
let currentTargetItem = null;
let currentRoomId = 'foyer';

function init() {
    renderRoom(currentRoomId);
    setupEventListeners();
    syncSettingsUI();

    // Auto-refresh room every 5 seconds to show dust accumulating (for demo)
    setInterval(() => renderRoom(currentRoomId), 5000);
}

function renderRoom(roomId) {
    const roomContainer = document.getElementById('room-view');
    if (!roomContainer) return;

    const room = stateManager.getRoom(roomId);
    if (!room) {
        roomContainer.innerHTML = '<p>Room not found.</p>';
        return;
    }

    roomContainer.innerHTML = '';

    room.items.forEach(item => {
        const itemCard = document.createElement('div');

        // Calculate Dust
        const timeSince = Date.now() - (item.lastReviewed || 0);
        const isDusty = timeSince > DECAY_INTERVAL_MS;

        itemCard.className = `loci-item room-card ${isDusty ? 'dusty' : ''}`;
        itemCard.dataset.id = item.id;

        const image = document.createElement('img');
        image.src = item.visualURL;
        image.alt = item.visual;

        const label = document.createElement('div');
        label.className = 'loci-label';
        label.innerText = item.concept;

        // Add streak indicator
        if (item.streak > 0) {
            const streakBadge = document.createElement('span');
            streakBadge.innerText = `🔥${item.streak}`;
            streakBadge.style.cssText = 'position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.7); padding:2px 5px; border-radius:10px; font-size:0.8em;';
            itemCard.appendChild(streakBadge);
        }

        // EVENT: Mouseover triggers "Reveal" if in Recall Mode (Dual Coding)
        itemCard.addEventListener('mouseenter', () => {
            if (document.body.dataset.dualCoding === 'hover') {
                label.classList.add('revealed');
            }
        });

        itemCard.addEventListener('mouseleave', () => {
             label.classList.remove('revealed');
        });

        // Click triggers cleaning or quiz
        itemCard.addEventListener('click', () => handleCardClick(item, itemCard));

        itemCard.appendChild(image);
        itemCard.appendChild(label);
        roomContainer.appendChild(itemCard);
    });
}

function handleCardClick(item, cardElement) {
    // If not dusty, do nothing (already clean)
    if (!cardElement.classList.contains('dusty')) return;

    const gkMode = settingsManager.get('gatekeeper', 'mode');

    // Initialize Gatekeeper for this specific battle
    activeGatekeeper = new Gatekeeper({
        type: gkMode,
        answer: item.concept,
        history: { successes: item.streak || 0 }
    });

    currentTargetItem = { item, element: cardElement };

    // Generate Quiz
    const room = stateManager.getRoom(currentRoomId);
    const quiz = activeGatekeeper.generateQuiz(room.items);
    launchQuizModal(quiz);
}

// --- QUIZ LOGIC ---

function launchQuizModal(quiz) {
    const modal = document.getElementById('quiz-modal');
    const questionEl = document.getElementById('quiz-question');
    const area = document.getElementById('quiz-interaction-area');
    const submitBtn = document.getElementById('btn-quiz-submit');
    const feedback = document.getElementById('quiz-feedback');

    questionEl.innerText = quiz.question;
    area.innerHTML = ''; // Clear previous
    feedback.innerText = '';
    feedback.className = '';

    if (quiz.mode === 'CHOICE') {
        submitBtn.classList.add('hidden');
        quiz.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerText = choice;
            btn.onclick = () => handleQuizAttempt(choice);
            area.appendChild(btn);
        });
    } else {
        // INPUT Mode
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'quiz-input';
        input.placeholder = 'Type the concept...';
        input.autocomplete = 'off';

        // Allow Enter key to submit
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleQuizAttempt(input.value);
        });

        area.appendChild(input);
        submitBtn.classList.remove('hidden');
        submitBtn.onclick = () => handleQuizAttempt(input.value);

        // Focus input after a short delay for modal transition
        setTimeout(() => input.focus(), 100);
    }

    modal.classList.remove('hidden');
}

function handleQuizAttempt(answer) {
    if (!activeGatekeeper || !currentTargetItem) return;

    const result = activeGatekeeper.checkAnswer(answer);
    const feedback = document.getElementById('quiz-feedback');

    if (result.success) {
        feedback.innerText = result.message;
        feedback.className = 'feedback-success';

        // Success Action: Clean the dust!
        currentTargetItem.element.classList.remove('dusty');

        // Persist Success
        stateManager.updateItemStats(currentRoomId, currentTargetItem.item.id, true);

        // Re-render to update badges/state immediately
        renderRoom(currentRoomId);

        // Close modal after delay
        setTimeout(() => {
            document.getElementById('quiz-modal').classList.add('hidden');
        }, 1500);
    } else {
        feedback.innerText = result.message;
        feedback.className = 'feedback-failure';

        // Persist Failure (Streak reset)
        stateManager.updateItemStats(currentRoomId, currentTargetItem.item.id, false);
        renderRoom(currentRoomId);
    }
}

// --- SETTINGS & UI WIRING ---

function setupEventListeners() {
    // Top Menu
    document.getElementById('btn-settings').addEventListener('click', toggleSettings);
    document.getElementById('close-settings').addEventListener('click', toggleSettings);

    document.getElementById('btn-ritual').addEventListener('click', () => {
        alert("🕯️ Ritual Mode is coming soon. Prepare your mind.");
    });

    document.getElementById('close-quiz').addEventListener('click', () => {
        document.getElementById('quiz-modal').classList.add('hidden');
    });

    // Generate Button
    document.getElementById('btn-generate').addEventListener('click', () => {
        const input = document.getElementById('userInput').value;
        const engineOutput = enhancePrompt(input);
        document.getElementById('prompt-output').innerText = "Engineered Prompt sent to Gemini: " + engineOutput;
    });

    // Tab Navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.target.dataset.tab;
            showTab(target);
        });
    });

    // Select Changes
    document.querySelectorAll('select[data-category]').forEach(select => {
        select.addEventListener('change', (e) => {
            const cat = e.target.dataset.category;
            const key = e.target.dataset.key;
            settingsManager.update(cat, key, e.target.value);
        });
    });

    // Toggle Buttons (Dual Coding)
    document.querySelectorAll('.setting-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cat = e.target.dataset.category;
            const key = e.target.dataset.key;
            const val = e.target.dataset.value;
            settingsManager.update(cat, key, val);
        });
    });
}

function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}

function showTab(tabName) {
    // Tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');

    // Content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function syncSettingsUI() {
    // Set initial values in inputs based on SettingsManager
    const v = settingsManager.settings.visuals;
    const g = settingsManager.settings.gatekeeper;
    const a = settingsManager.settings.audio;

    setVal('set-decay-style', v.decayStyle);
    setVal('set-gk-mode', g.mode);
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
