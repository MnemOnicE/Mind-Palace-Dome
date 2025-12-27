
import { stateManager } from './state_manager.js';
import { settingsManager } from './settings_manager.js';

export class RitualMode {
    constructor() {
        this.overlay = null;
        this.currentItems = [];
        this.currentIndex = 0;
    }

    start() {
        const roomId = 'foyer'; // Currently only one room
        const room = stateManager.getRoom(roomId);
        if (!room) return;

        // Filter for Due Items
        // "Dusty" = Due Date <= Now
        const now = Date.now();
        this.currentItems = room.items.filter(item => {
            const dueDate = item.dueDate || 0;
            return now >= dueDate;
        });

        if (this.currentItems.length === 0) {
            alert("✨ The Palace is pristine. No rituals required at this time.");
            return;
        }

        this.currentIndex = 0;
        this.renderOverlay();
        this.showItem(this.currentIndex);
    }

    renderOverlay() {
        // Create full screen overlay if not exists
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'ritual-overlay';
            this.overlay.className = 'ritual-overlay';
            document.body.appendChild(this.overlay);
        }

        this.overlay.innerHTML = `
            <div class="ritual-container">
                <div class="ritual-header">
                    <h2>🕯️ Ritual Walk</h2>
                    <button id="ritual-close" class="close-btn">×</button>
                </div>
                <div id="ritual-card" class="ritual-card">
                    <!-- Dynamic Content -->
                </div>
                <div class="ritual-progress">
                    <span id="ritual-step">1</span> / <span id="ritual-total">${this.currentItems.length}</span>
                </div>
            </div>
        `;

        document.getElementById('ritual-close').addEventListener('click', () => this.end());
        this.overlay.classList.remove('hidden');
    }

    showItem(index) {
        if (index >= this.currentItems.length) {
            this.finish();
            return;
        }

        const item = this.currentItems[index];
        const container = document.getElementById('ritual-card');
        document.getElementById('ritual-step').innerText = index + 1;

        // Front of Card (Prompt)
        container.innerHTML = `
            <div class="ritual-front">
                <img src="${item.visualURL}" alt="Memory Trigger" class="ritual-img">
                <p class="ritual-prompt">Recall the Concept...</p>
                <button id="ritual-reveal" class="btn btn-primary">Reveal</button>
            </div>
        `;

        document.getElementById('ritual-reveal').onclick = () => this.revealItem(item);
    }

    revealItem(item) {
        const container = document.getElementById('ritual-card');

        // Back of Card (Answer + Grading)
        container.innerHTML = `
            <div class="ritual-back">
                <img src="${item.visualURL}" alt="Memory Trigger" class="ritual-img-sm">
                <h1 class="ritual-concept">${item.concept}</h1>
                <div class="ritual-grading">
                    <button class="grade-btn g-again" data-grade="1">Again (1)</button>
                    <button class="grade-btn g-hard" data-grade="3">Hard (3)</button>
                    <button class="grade-btn g-good" data-grade="4">Good (4)</button>
                    <button class="grade-btn g-easy" data-grade="5">Easy (5)</button>
                </div>
            </div>
        `;

        container.querySelectorAll('.grade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grade = parseInt(e.target.dataset.grade);
                this.gradeItem(item, grade);
            });
        });
    }

    gradeItem(item, grade) {
        // Update Stats
        stateManager.updateItemStats('foyer', item.id, grade);

        // Next
        this.currentIndex++;
        this.showItem(this.currentIndex);
    }

    finish() {
        this.overlay.innerHTML = `
            <div class="ritual-container">
                <h2>✨ Ritual Complete</h2>
                <p>Your mind palace is fortified.</p>
                <button id="ritual-finish" class="btn">Return</button>
            </div>
        `;
        document.getElementById('ritual-finish').onclick = () => this.end();
    }

    end() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            this.overlay.remove(); // Clean up DOM
            this.overlay = null;
        }
        // Refresh the main view to show items are clean
        // We need to trigger a re-render in app.js.
        // Ideally we'd emit an event, but for now let's just reload the page or assume the interval picks it up.
        // Actually, let's dispatch a custom event on document.
        document.dispatchEvent(new Event('dome:refresh'));
    }
}
