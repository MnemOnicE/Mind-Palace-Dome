import { settingsManager } from './settings_manager.js';
import { stateManager } from './state_manager.js';
import Gatekeeper from './gatekeeper.js';
import AudioEngine from './audio_engine.js';
import { enhancePrompt } from './prompt_engine.js';
import { calculateNextReview } from './srs_engine.js';
import { RitualMode } from './ritual_mode.js';

// State
let activeGatekeeper = null;
let currentTargetItem = null;
let currentRoomId = 'foyer';
let audioEngine = new AudioEngine();
let currentLociIndex = 0;
let tourInterval = null;

function init() {
    refreshRoomList(); // Populate dropdown
    renderCarousel(currentRoomId);
    setupEventListeners();
    syncSettingsUI();

    // Sync Audio Config
    const au = settingsManager.settings.audio;
    audioEngine.setConfig({ openAIKey: au.openAIKey });

    // Auto-refresh room every 5 seconds to show dust accumulating (for demo)
    setInterval(() => renderCarousel(currentRoomId), 5000);
}

function refreshRoomList() {
    const select = document.getElementById('room-select');
    if (!select) return;

    select.innerHTML = '';
    const rooms = stateManager.state.rooms;

    Object.values(rooms).forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.innerText = room.name;
        if (room.id === currentRoomId) option.selected = true;
        select.appendChild(option);
    });
}

function renderCarousel(roomId) {
    const roomContainer = document.getElementById('room-view');
    const title = document.getElementById('current-room-name');

    if (!roomContainer) return;

    const room = stateManager.getRoom(roomId);
    if (!room) {
        roomContainer.innerHTML = '<p>Room not found.</p>';
        return;
    }

    if (title) title.innerText = `Current Room: ${room.name}`;

    // Ensure index range
    if (!room.items || room.items.length === 0) {
        currentLociIndex = 0;
    } else if (currentLociIndex >= room.items.length) {
        currentLociIndex = 0;
    }

    // Optimization: Re-use container if it exists and matches current room
    const existingContainer = roomContainer.querySelector('.carousel-container');
    if (existingContainer && roomContainer.dataset.renderedRoom === roomId) {
        updateCarouselUI(room, existingContainer);
        return;
    }

    // Full Render
    roomContainer.innerHTML = '';
    roomContainer.dataset.renderedRoom = roomId;
    roomContainer.classList.add('carousel-view');

    const container = document.createElement('div');
    container.className = 'carousel-container';

    if (room.items.length === 0) {
        container.innerHTML = '<p class="empty-msg">This room is empty. Add a memory.</p>';
        roomContainer.appendChild(container);
        return;
    }

    room.items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        // Initial state set by updateCarouselUI mostly, but we set basics here
        itemEl.className = 'carousel-item';
        itemEl.dataset.id = item.id;
        itemEl.dataset.index = index;

        // Image
        const image = document.createElement('img');
        image.src = item.visualURL;
        image.alt = item.visual;
        itemEl.appendChild(image);

        // Label
        const label = document.createElement('div');
        label.className = 'loci-label';
        label.innerText = item.concept;
        itemEl.appendChild(label);

        // Streak
        if (item.streak > 0) {
            const streakBadge = document.createElement('span');
            streakBadge.className = 'streak-badge';
            streakBadge.innerText = `🔥${item.streak}`;
            itemEl.appendChild(streakBadge);
        }

        // Dual Coding Hover
        itemEl.addEventListener('mouseenter', () => {
            if (document.body.dataset.dualCoding === 'hover' && itemEl.classList.contains('active')) {
                label.classList.add('revealed');
            }
        });
        itemEl.addEventListener('mouseleave', () => label.classList.remove('revealed'));

        // Interaction
        itemEl.addEventListener('click', () => {
            if (itemEl.classList.contains('active')) {
                handleCardClick(item, itemEl);
            } else {
                // Click on prev/next to navigate
                currentLociIndex = index;
                renderCarousel(currentRoomId);
            }
        });

        // Edit Button (Only visible on active?)
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerText = '✏️';
        editBtn.title = 'Edit Item';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openEditModal(item);
        };
        itemEl.appendChild(editBtn);

        container.appendChild(itemEl);
    });

    roomContainer.appendChild(container);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn prev';
    prevBtn.innerText = '◀';
    prevBtn.onclick = prevLoci;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn next';
    nextBtn.innerText = '▶';
    nextBtn.onclick = nextLoci;

    const tourBtn = document.createElement('button');
    tourBtn.id = 'btn-tour';
    tourBtn.className = 'nav-btn tour';
    tourBtn.innerText = tourInterval ? '⏸️' : '▶️ Tour';
    tourBtn.onclick = toggleTour;

    controls.appendChild(prevBtn);
    controls.appendChild(tourBtn);
    controls.appendChild(nextBtn);
    roomContainer.appendChild(controls);

    // Initial update to set classes
    updateCarouselUI(room, container);
}

function updateCarouselUI(room, container) {
    const items = container.querySelectorAll('.carousel-item');
    if (items.length !== room.items.length) {
        // Mismatch (added/removed item), force re-render
        container.parentNode.innerHTML = ''; // Clear to trigger rebuild next time
        renderCarousel(room.id);
        return;
    }

    const now = Date.now();

    items.forEach((el, index) => {
        let stateClass = 'carousel-item';
        if (index === currentLociIndex) stateClass += ' active';
        else if (index === (currentLociIndex - 1 + room.items.length) % room.items.length) stateClass += ' prev';
        else if (index === (currentLociIndex + 1) % room.items.length) stateClass += ' next';
        else stateClass += ' hidden-item';

        const item = room.items[index];
        const dueDate = item.dueDate || 0;
        const isDusty = now >= dueDate;

        el.className = `${stateClass} ${isDusty ? 'dusty' : ''}`;
    });

    // Update Tour Button Text
    const tourBtn = document.getElementById('btn-tour');
    if (tourBtn) tourBtn.innerText = tourInterval ? '⏸️' : '▶️ Tour';
}

function startTour() {
    if (tourInterval) return;
    const room = stateManager.getRoom(currentRoomId);
    if (!room || room.items.length < 2) return;

    tourInterval = setInterval(() => {
        nextLoci();
    }, 3000);

    renderCarousel(currentRoomId);
}

function stopTour() {
    if (tourInterval) {
        clearInterval(tourInterval);
        tourInterval = null;
    }
    renderCarousel(currentRoomId);
}

function toggleTour() {
    if (tourInterval) stopTour();
    else startTour();
}

function nextLoci() {
    const room = stateManager.getRoom(currentRoomId);
    if (!room || room.items.length === 0) return;
    currentLociIndex = (currentLociIndex + 1) % room.items.length;
    renderCarousel(currentRoomId);
}

function prevLoci() {
    const room = stateManager.getRoom(currentRoomId);
    if (!room || room.items.length === 0) return;
    currentLociIndex = (currentLociIndex - 1 + room.items.length) % room.items.length;
    renderCarousel(currentRoomId);
}

function openEditModal(item = null) {
    const isEditing = !!item;
    const titleText = isEditing ? '✏️ Edit Memory' : '✨ New Memory';

    // Reuse/Create a simple modal for editing
    let modal = document.getElementById('edit-modal');
    if (!modal) {
        // Create it dynamically if missing
        modal = document.createElement('div');
        modal.id = 'edit-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title"></h2>
                    <button class="close-btn" onclick="document.getElementById('edit-modal').classList.add('hidden')">×</button>
                </div>
                <div class="modal-body">
                    <div class="setting-group">
                        <label>Concept Name</label>
                        <input type="text" id="edit-concept" style="width:100%; padding:8px;" placeholder="e.g. Mitochondria">
                    </div>
                    <div class="setting-group">
                        <label>Image URL (or Paste Base64)</label>
                        <input type="text" id="edit-url" style="width:100%; padding:8px;" placeholder="https://...">
                    </div>
                     <div class="setting-group upload-section">
                        <label>Or Upload Image</label>
                        <input type="file" id="edit-file-upload" accept="image/*">
                    </div>
                    </div>

                    <div class="setting-group" style="margin-top:10px; border-top:1px solid #444; padding-top:10px;">
                        <label>🎙️ Voice Input (Concept)</label>
                        <button id="btn-mic-concept" class="btn small-btn" style="width:100%;">Record</button>
                    </div>

                    <button id="btn-save-edit" class="btn" style="width:100%; margin-top:10px;">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('modal-title').innerText = titleText;

    // Populate Data
    const conceptInput = document.getElementById('edit-concept');
    conceptInput.value = isEditing ? item.concept : '';

    // Wire up Mic
    const micBtn = document.getElementById('btn-mic-concept');
    setupMicButton(micBtn, (text) => {
        conceptInput.value = text; // Overwrite or append? Overwrite for now.
    });
    document.getElementById('edit-url').value = isEditing ? item.visualURL : '';

    // File Upload Handler
    const fileInput = document.getElementById('edit-file-upload');
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                document.getElementById('edit-url').value = readerEvent.target.result; // Base64
            };
            reader.readAsDataURL(file);
        }
    };

    // Save Handler
    document.getElementById('btn-save-edit').onclick = () => {
        const newConcept = document.getElementById('edit-concept').value;
        const newURL = document.getElementById('edit-url').value;

        if (!newConcept) {
            alert("Concept name is required!");
            return;
        }

        if (isEditing) {
            stateManager.updateItemDetails(currentRoomId, item.id, newConcept, newURL);
        } else {
            stateManager.addItem(currentRoomId, newConcept, newURL);
        }

        modal.classList.add('hidden');
        renderCarousel(currentRoomId);
    };

    modal.classList.remove('hidden');
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

    // TTS: Speak the question if engine is enabled
    // Only if not already speaking to avoid chaos
    const ttsEngine = settingsManager.get('audio', 'engine');
    // Simple check: if we are using browser/hybrid, we can try to speak
    // Note: Chrome requires user interaction first, so this might fail if it's the very first action
    audioEngine.speak(quiz.question);

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

        // Add Mic Button for Quiz
        const micContainer = document.createElement('div');
        micContainer.style.marginTop = '10px';
        const micBtn = document.createElement('button');
        micBtn.className = 'btn small-btn';
        micBtn.innerText = '🎙️ Answer';
        micContainer.appendChild(micBtn);
        area.appendChild(micContainer);

        setupMicButton(micBtn, (text) => {
            input.value = text;
            // Optional: Auto-submit? Let's wait for user confirmation
        });

        submitBtn.classList.remove('hidden');
        submitBtn.onclick = () => handleQuizAttempt(input.value);

        // Focus input after a short delay for modal transition
        setTimeout(() => input.focus(), 100);
    }

    modal.classList.remove('hidden');
}

function handleQuizAttempt(answer) {
    if (!activeGatekeeper || !currentTargetItem) return;

    // Normalize answer (trim/lowercase done in Gatekeeper, but good practice here too)
    const result = activeGatekeeper.checkAnswer(answer);
    const feedback = document.getElementById('quiz-feedback');

    if (result.success) {
        feedback.innerText = result.message;
        feedback.className = 'feedback-success';

        // Success Action: Clean the dust!
        currentTargetItem.element.classList.remove('dusty');

        // Add Pop Animation
        const feedbackEl = document.getElementById('quiz-feedback');
        feedbackEl.classList.remove('pop-animation');
        void feedbackEl.offsetWidth; // Trigger reflow
        feedbackEl.classList.add('pop-animation');

        // Persist Success
        stateManager.updateItemStats(currentRoomId, currentTargetItem.item.id, true);

        // Re-render to update badges/state immediately
        renderCarousel(currentRoomId);

        // Close modal after delay
        setTimeout(() => {
            document.getElementById('quiz-modal').classList.add('hidden');
        }, 1500);
    } else {
        feedback.innerText = result.message;
        feedback.className = 'feedback-failure';

        // Persist Failure (Streak reset)
        stateManager.updateItemStats(currentRoomId, currentTargetItem.item.id, false);
        renderCarousel(currentRoomId);
    }
}

// --- SETTINGS & UI WIRING ---

function setupEventListeners() {
    // Top Menu
    document.getElementById('btn-settings').addEventListener('click', toggleSettings);
    document.getElementById('close-settings').addEventListener('click', toggleSettings);

    // Room Controls
    const roomSelect = document.getElementById('room-select');
    if (roomSelect) {
        roomSelect.addEventListener('change', (e) => {
            currentRoomId = e.target.value;
            currentLociIndex = 0;
            renderCarousel(currentRoomId);
        });
    }

    const btnNewRoom = document.getElementById('btn-new-room');
    if (btnNewRoom) {
        btnNewRoom.addEventListener('click', () => {
            const name = prompt("Name your new Room (e.g., 'The Library')");
            if (name) {
                const newRoom = stateManager.createRoom(name);
                if (newRoom) {
                    refreshRoomList();
                    currentRoomId = newRoom.id;
                    currentLociIndex = 0;
                    renderCarousel(currentRoomId);
                } else {
                    alert("Room already exists or invalid name.");
                }
            }
        });
    }

    const btnAddItem = document.getElementById('btn-add-item');
    if (btnAddItem) {
        btnAddItem.addEventListener('click', () => {
            openEditModal(null); // Create Mode
        });
    }

    // Ritual Mode Button
    document.getElementById('btn-ritual').addEventListener('click', () => {
        const ritual = new RitualMode();
        ritual.start();
    });

    // Custom Event Listener for Ritual Completion (Refresh UI)
    document.addEventListener('dome:refresh', () => {
        renderCarousel(currentRoomId);
    });

    document.getElementById('close-quiz').addEventListener('click', () => {
        document.getElementById('quiz-modal').classList.add('hidden');
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        // Only navigate if no modal is open (simple check)
        if (!document.querySelector('.modal:not(.hidden)')) {
            if (e.key === 'ArrowRight') {
                stopTour();
                nextLoci();
            }
            if (e.key === 'ArrowLeft') {
                stopTour();
                prevLoci();
            }
        }
    });

    // Generate Button
    document.getElementById('btn-generate').addEventListener('click', async () => {
        const input = document.getElementById('userInput').value;
        if (!input) return;

        const apiKey = settingsManager.get('ai', 'geminiKey');
        const outputArea = document.getElementById('prompt-output');

        outputArea.innerText = "✨ Consulting the Oracle...";

        const engineOutput = await enhancePrompt(input, apiKey);

        if (apiKey && !engineOutput.includes('[Local Engine]')) {
             outputArea.innerText = "🤖 Gemini says: " + engineOutput;
        } else {
             outputArea.innerText = engineOutput;
        }
    });

    // API Key Input Listener
    const apiKeyInput = document.getElementById('set-gemini-key');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('change', (e) => {
            settingsManager.update('ai', 'geminiKey', e.target.value.trim());
        });
    }

    const openAIKeyInput = document.getElementById('set-openai-key');
    if (openAIKeyInput) {
        openAIKeyInput.addEventListener('change', (e) => {
            const key = e.target.value.trim();
            settingsManager.update('audio', 'openAIKey', key);
            audioEngine.setConfig({ openAIKey: key });
        });
    }

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

            // Update UI Active State
            document.querySelectorAll(`.setting-toggle[data-category="${cat}"][data-key="${key}"]`).forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
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
    const updateToggleClasses = (cat, key, val) => {
        document.querySelectorAll(`.setting-toggle[data-category="${cat}"][data-key="${key}"]`).forEach(btn => {
            if (btn.dataset.value === val) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };
    const v = settingsManager.settings.visuals;
    const g = settingsManager.settings.gatekeeper;
    const ai = settingsManager.settings.ai;
    const au = settingsManager.settings.audio;

    setVal('set-theme', v.theme);
    setVal('set-decay-style', v.decayStyle);
    setVal('set-gk-mode', g.mode);
    setVal('set-gemini-key', ai.geminiKey || '');
    setVal('set-openai-key', au.openAIKey || '');
    setVal('set-recording-mode', au.recordingMode);
    setVal('set-tts-engine', au.engine);
    updateToggleClasses('visuals', 'dualCoding', v.dualCoding);
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// Initialize
document.addEventListener('DOMContentLoaded', init);

// --- AUDIO HELPER ---

function setupMicButton(buttonElement, onTranscript) {
    if (!buttonElement) return;

    // Remove old listeners (cloning is a quick hack to clear listeners)
    const newBtn = buttonElement.cloneNode(true);
    buttonElement.parentNode.replaceChild(newBtn, buttonElement);
    buttonElement = newBtn;

    let isRecording = false;
    let holdTimeout = null;

    buttonElement.addEventListener('mousedown', async () => {
        const mode = settingsManager.get('audio', 'recordingMode');

        if (mode === 'hold') {
            console.log("🎤 Hold Mode: Start");
            const result = await audioEngine.startRecording();
            if (result.success) {
                buttonElement.classList.add('recording');
                buttonElement.innerText = '🔴 Listening...';
            } else {
                alert(`Cannot record: ${result.error}`);
            }
        }
    });

    buttonElement.addEventListener('mouseup', async () => {
        const mode = settingsManager.get('audio', 'recordingMode');

        if (mode === 'hold') {
             console.log("🎤 Hold Mode: Stop");
             buttonElement.classList.remove('recording');
             buttonElement.innerText = '⏳ Processing...';
             try {
                const text = await audioEngine.stopRecording();
                buttonElement.innerText = '🎙️';
                onTranscript(text);
             } catch (err) {
                 console.error(err);
                 buttonElement.innerText = '⚠️ Error';
             }
        }
    });

    buttonElement.addEventListener('click', async () => {
        const mode = settingsManager.get('audio', 'recordingMode');

        if (mode === 'toggle') {
            if (!isRecording) {
                console.log("🎤 Toggle Mode: Start");
                const result = await audioEngine.startRecording();
                if (result.success) {
                    isRecording = true;
                    buttonElement.classList.add('recording');
                    buttonElement.innerText = '🔴 Stop';
                } else {
                    alert(`Cannot record: ${result.error}`);
                }
            } else {
                console.log("🎤 Toggle Mode: Stop");
                isRecording = false;
                buttonElement.classList.remove('recording');
                buttonElement.innerText = '⏳ Processing...';
                try {
                    const text = await audioEngine.stopRecording();
                    buttonElement.innerText = '🎙️';
                    onTranscript(text);
                } catch (err) {
                    console.error(err);
                    buttonElement.innerText = '⚠️ Error';
                }
            }
        }
    });
}
