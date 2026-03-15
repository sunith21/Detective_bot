class AudioController {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.humOscillator = null;
        this.humGain = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
            this.init();
            this.startHum();
        } else {
            this.stopHum();
        }
        return this.isMuted;
    }

    startHum() {
        if (this.isMuted || !this.ctx) return;
        if (this.humOscillator) this.stopHum();

        this.humOscillator = this.ctx.createOscillator();
        this.humGain = this.ctx.createGain();

        this.humOscillator.type = 'sawtooth';
        this.humOscillator.frequency.value = 55; // Low frequency for computer hum

        // Filter to make it sound muffled and far away
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        this.humGain.gain.value = 0.05; // Very subtle

        this.humOscillator.connect(filter);
        filter.connect(this.humGain);
        this.humGain.connect(this.ctx.destination);

        this.humOscillator.start();
    }

    stopHum() {
        if (this.humOscillator) {
            this.humOscillator.stop();
            this.humOscillator.disconnect();
            this.humOscillator = null;
        }
        if (this.humGain) {
            this.humGain.disconnect();
            this.humGain = null;
        }
    }

    playBlip() {
        if (this.isMuted || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // High pitch short blips for text
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playError() {
        if (this.isMuted || !this.ctx) return;

        // Create a noisy buffer for 'glitch/error' sound
        const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // White noise
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        noiseNode.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.ctx.destination);

        noiseNode.start();
    }

    playStinger() {
        if (this.isMuted || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Dramatic downward sweeping synth for dossier drop
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }
}

const audioCore = new AudioController();
