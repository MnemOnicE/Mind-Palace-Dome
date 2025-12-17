/**
 * events.js
 * Handles triggers when a user navigates to a specific Loci in the Palace.
 */

const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance("Welcome to the Foyer. Mind the gap.");
synth.speak(utterance);

class PalaceEvent {
    constructor(triggerId, type, payload) {
        this.triggerId = triggerId; // ID of the Room or Item
        this.type = type; // 'AUDIO', 'TEXT', 'RITUAL'
        this.payload = payload; // Audio file URL, Text string, or Script
    }

    execute() {
        console.log(`Triggering event for ${this.triggerId}`);
        if (this.type === 'AUDIO') {
            this.playAudio();
        } else if (this.type === 'RITUAL') {
            this.startRitual();
        }
    }

    playAudio() {
        // Logic to play the Whisper-generated description or guided meditation
        const audio = new Audio(this.payload);
        audio.play();
    }

    startRitual() {
        // Logic to dim lights, focus camera, and guide user breathing
        document.body.classList.add('ritual-mode');
        alert("Breathe in... visualize the object...");
    }
}

export default PalaceEvent;
