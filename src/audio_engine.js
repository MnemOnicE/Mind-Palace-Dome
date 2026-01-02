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

        // Initialize Speech Synthesis (Check if supported)
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
        } else {
            console.warn("AudioEngine: Speech Synthesis not supported in this environment.");
            this.synth = null;
        }
        
        // Initialize Web Speech Recognition (Chrome/Edge/Safari support varies)
        if (typeof window !== 'undefined') {
            this.Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognizer = this.Recognition ? new this.Recognition() : null;
        } else {
            this.recognizer = null;
        }

        // MediaRecorder State
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    setConfig(config) {
        if (config.openAIKey !== undefined) this.openAIKey = config.openAIKey;
        // Update other config if needed
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
        if (!this.synth) {
            console.warn("AudioEngine: Cannot speak. Browser synthesis not supported.");
            return;
        }

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
        if (this.recognizer && !this.openAIKey) {
            this.recognizer.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                callback(transcript);
            };
            this.recognizer.start();
            return;
        }

        console.log("Wait for explicit startRecording/stopRecording for Whisper.");
    }

    // --- WHISPER INTEGRATION ---

    async startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Media Devices API not supported.");
            return { success: false, error: "Media Devices API not supported in this browser." };
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            console.log("🎙️ Recording started...");
            return { success: true };
        } catch (err) {
            console.error("Could not start recording:", err);
            return { success: false, error: err.message };
        }
    }

    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject("No active recorder.");
                return;
            }

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' }); // OpenAI accepts webm
                this.audioChunks = [];
                console.log("⏹️ Recording stopped. Blob created.");

                if (this.openAIKey) {
                    try {
                        const text = await this.transcribeWithWhisper(audioBlob);
                        resolve(text);
                    } catch (err) {
                        console.error("Whisper transcription failed:", err);
                        reject(err);
                    }
                } else {
                    resolve("[Audio Captured but no OpenAI Key provided]");
                }
            };

            this.mediaRecorder.stop();
            // Stop stream tracks to release microphone
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }

    async transcribeWithWhisper(audioBlob) {
        console.log("✨ Sending audio to Whisper...");
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("model", "whisper-1");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.openAIKey}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`OpenAI Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📝 Transcript:", data.text);
        return data.text;
    }
}

export default AudioEngine;
