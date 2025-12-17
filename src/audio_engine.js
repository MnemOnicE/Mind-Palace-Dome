/**
 * audio_engine.js
 * The voice of dome-icile.
 * * Capabilities:
 * 1. Text-to-Speech (TTS):
 * - Priority 1: OpenAI (High quality, paid)
 * - Priority 2: eSpeak (Retro/Robot, free, via library)
 * - Priority 3: Web Speech API (Browser native, free, offline)
 * * 2. Speech-to-Text (STT):
 * - Priority 1: OpenAI Whisper (High accuracy, paid)
 * - Priority 2: Web Speech Recognition (Browser native, free)
 */

class AudioEngine {
    constructor(config = {}) {
        this.openAIKey = config.openAIKey || null;
        this.useESpeak = config.useESpeak || false; // Toggle for retro robot voice
        this.synth = window.speechSynthesis;
        
        // Initialize Web Speech Recognition (Chrome/Edge/Safari support varies)
        this.Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognizer = this.Recognition ? new this.Recognition() : null;
    }

    // --- TEXT TO SPEECH (The Palace Speaks to You) ---

    async speak(text) {
        console.log(`🔊 Speaking: "${text}"`);

        // 1. OpenAI TTS (If Key exists)
        if (this.openAIKey) {
            try {
                await this.speakWithOpenAI(text);
                return;
            } catch (err) {
                console.warn("⚠️ OpenAI TTS failed, falling back...", err);
            }
        }

        // 2. eSpeak (If enabled and library present)
        if (this.useESpeak && window.meSpeak) {
            this.speakWithESpeak(text);
            return;
        }

        // 3. Browser Native (The reliable fallback)
        this.speakWithBrowser(text);
    }

    speakWithBrowser(text) {
        if (this.synth.speaking) {
            console.warn("Already speaking...");
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Optional: Select a specific voice preference here
        // const voices = this.synth.getVoices();
        // utterance.voice = voices.find(v => v.name.includes("Google US English"));

        utterance.rate = 0.9; // Slightly slower for meditation/focus
        utterance.pitch = 1.0;
        this.synth.speak(utterance);
    }

    speakWithESpeak(text) {
        // Requires meSpeak.js library loaded in index.html
        if (!window.meSpeak) return;
        window.meSpeak.speak(text, { amplitude: 100, pitch: 50, speed: 150 });
    }

    async speakWithOpenAI(text) {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.openAIKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                input: text,
                voice: "onyx" // Deep, resonant voice good for meditation
            })
        });

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    }

    // --- SPEECH TO TEXT (You Speak to the Palace) ---

    async listen(callback) {
        console.log("👂 Listening...");

        // 1. Browser Native (Real-time, Free)
        // We use this for immediate feedback or if no API key
        if (this.recognizer && !this.openAIKey) {
            this.recognizer.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                callback(transcript);
            };
            this.recognizer.start();
            return;
        }

        // 2. OpenAI Whisper (High Fidelity, requires recording file)
        // Note: Implementation requires a MediaRecorder logic to capture a Blob first.
        // This is a placeholder for where you'd pipe the Blob.
        console.log("For Whisper, we need to implement MediaRecorder capture first.");
    }
}

export default AudioEngine;
