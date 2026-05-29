/**
 * audio_drone.js
 * Procedural SRS Soundscapes using Web Audio API.
 * Generates an ambient drone that becomes more dissonant based on the room's memory decay.
 */

class AudioDrone {
    constructor() {
        this.ctx = null;
        this.oscillators = [];
        this.gainNode = null;
        this.filterNode = null;
        this.isPlaying = false;

        // Base frequencies for a consonant chord (e.g., C minor for focus)
        this.baseFreqs = [130.81, 155.56, 196.00];
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = 0;

            this.filterNode = this.ctx.createBiquadFilter();
            this.filterNode.type = 'lowpass';
            this.filterNode.frequency.value = 400;

            this.gainNode.connect(this.filterNode);
            this.filterNode.connect(this.ctx.destination);
        }
    }

    start() {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.isPlaying) return;

        this.oscillators = this.baseFreqs.map(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine'; // Smooth ambient tone
            osc.frequency.value = freq;
            osc.connect(this.gainNode);
            osc.start();
            return osc;
        });

        // Fade in
        this.gainNode.gain.setTargetAtTime(0.1, this.ctx.currentTime, 2);
        this.isPlaying = true;
    }

    stop() {
        if (!this.isPlaying) return;

        // Fade out
        this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 1);

        setTimeout(() => {
            this.oscillators.forEach(osc => {
                osc.stop();
                osc.disconnect();
            });
            this.oscillators = [];
            this.isPlaying = false;
        }, 2000);
    }

    /**
     * Modulates the soundscape based on the decay ratio (0.0 to 1.0)
     * High decay = dissonance (detuning), darker filter, slightly louder.
     */
    updateDecay(decayRatio) {
        if (!this.isPlaying || !this.ctx) return;

        // Max detune in cents (100 = 1 semitone)
        // High decay creates an eerie out-of-tune chorus effect
        const maxDetune = 50;

        this.oscillators.forEach((osc, index) => {
            // Apply different detune amounts to different oscillators for complexity
            const detuneAmount = (index % 2 === 0 ? 1 : -1) * maxDetune * decayRatio;
            osc.detune.setTargetAtTime(detuneAmount, this.ctx.currentTime, 2);
        });

        // Darken filter as decay increases (muffled memory)
        const minFreq = 150;
        const maxFreq = 600;
        const targetFreq = maxFreq - (decayRatio * (maxFreq - minFreq));
        this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 2);

        // Increase volume slightly for tension
        const baseVolume = 0.05;
        const targetVolume = baseVolume + (decayRatio * 0.05);
        this.gainNode.gain.setTargetAtTime(targetVolume, this.ctx.currentTime, 2);
    }
}

export const droneEngine = new AudioDrone();
