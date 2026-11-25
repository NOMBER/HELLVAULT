// Original, offline sequenced soundtracks for HELLVAULT. MIDI pitches are transposed
// across 16-bar arrangements; the instruments and drums are synthesized in Web Audio.
var HELLVAULT_TRACKS = {
  story: {
    title: "Ashes of the Vault", bpm: 138,
    roots: [38,38,34,36,38,38,34,33, 38,38,34,36,41,36,34,33],
    bass: [0,null,0,0,null,7,null,0,10,null,0,null,5,null,7,null],
    lead: [12,null,15,null,17,null,19,null,17,null,15,14,12,null,10,null],
    kick: [0,6,8,11], snare: [4,12], hat: [0,2,4,6,8,10,12,14],
    bassType: "sawtooth", leadType: "triangle", filter: 720,
  },
  linear: {
    title: "The Long Way Down", bpm: 164,
    roots: [40,40,36,38,40,40,43,38, 40,40,36,38,43,41,38,40],
    bass: [0,0,null,7,0,0,10,null,0,0,null,7,0,3,5,7],
    lead: [19,null,17,15,12,null,15,null,17,19,null,22,19,null,15,14],
    kick: [0,4,8,12,14], snare: [4,12], hat: [0,2,3,4,6,8,10,11,12,14],
    bassType: "square", leadType: "sawtooth", filter: 1050,
  },
  arena: {
    title: "Fifth Wave", bpm: 178,
    roots: [43,43,39,41,43,43,46,41, 43,43,39,41,46,44,41,38],
    bass: [0,null,0,7,0,null,10,7,0,null,0,12,10,7,5,3],
    lead: [12,15,19,null,17,15,12,null,22,null,19,17,15,17,19,null],
    kick: [0,3,6,8,10,14], snare: [4,12,15], hat: [0,2,4,6,8,10,12,14,15],
    bassType: "sawtooth", leadType: "square", filter: 1250,
  },
};

var MusicPlayer = class {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.timer = null;
    this.mode = null;
    this.step = 0;
    this.nextAt = 0;
    this.enabled = true;
    this.volume = 0.35;
    this.wanted = false;
  }
  ensure() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0;
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -12;
        compressor.knee.value = 16;
        compressor.ratio.value = 5;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.16;
        this.master.connect(compressor);
        compressor.connect(this.ctx.destination);
        this.noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
        const samples = this.noiseBuffer.getChannelData(0);
        let seed = 728371;
        for (let i = 0; i < samples.length; i++) {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          samples[i] = seed / 2147483648 - 1;
        }
      }
      if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
      return this.ctx;
    } catch (e) {
      console.warn("[HELLVAULT] Music unavailable", e);
      return null;
    }
  }
  configure(enabled, volume) {
    this.enabled = enabled !== false;
    this.volume = Math.max(0, Math.min(1, Number.isFinite(Number(volume)) ? Number(volume) : 0.35));
    if (!this.enabled) this.halt();
    else if (this.wanted && this.timer === null) this.start(this.mode);
    else if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume * 0.8, this.ctx.currentTime, 0.04);
  }
  start(mode) {
    if (!HELLVAULT_TRACKS[mode]) return;
    if (this.mode !== mode) { this.halt(); this.mode = mode; this.step = 0; }
    this.wanted = true;
    if (!this.enabled || this.timer !== null) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(this.volume * 0.8, ctx.currentTime, 0.04);
    this.nextAt = ctx.currentTime + 0.05;
    this.pump();
    this.timer = window.setInterval(() => this.pump(), 80);
  }
  halt() {
    if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.025);
    }
  }
  pause() { this.wanted = false; this.halt(); }
  close() {
    this.pause();
    try { void this.ctx?.close(); } catch {}
    this.ctx = null;
    this.master = null;
  }
  pump() {
    if (!this.ctx || !this.mode || !this.enabled) return;
    const track = HELLVAULT_TRACKS[this.mode];
    if (this.nextAt < this.ctx.currentTime - 0.5) this.nextAt = this.ctx.currentTime + 0.03;
    try {
      while (this.nextAt < this.ctx.currentTime + 0.2) {
        this.scheduleStep(track, this.step, this.nextAt);
        this.nextAt += 60 / track.bpm / 4;
        this.step = (this.step + 1) % (track.roots.length * 16);
      }
    } catch (e) {
      console.warn("[HELLVAULT] Music playback", e);
      this.pause();
    }
  }
  tone(midi, at, duration, level, type, cutoff) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), at);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, at);
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.009);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(this.master);
    osc.start(at); osc.stop(at + duration + 0.01);
  }
  kick(at) {
    const ctx = this.ctx, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(145, at);
    osc.frequency.exponentialRampToValueAtTime(44, at + 0.12);
    gain.gain.setValueAtTime(0.68, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    osc.connect(gain); gain.connect(this.master); osc.start(at); osc.stop(at + 0.23);
  }
  noise(at, duration, level, cutoff) {
    const ctx = this.ctx, noise = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    noise.buffer = this.noiseBuffer;
    filter.type = "highpass"; filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    noise.connect(filter); filter.connect(gain); gain.connect(this.master);
    noise.start(at); noise.stop(at + duration + 0.01);
  }
  scheduleStep(track, index, at) {
    const step = index % 16, bar = Math.floor(index / 16), root = track.roots[bar % track.roots.length];
    const sixteenth = 60 / track.bpm / 4;
    if (track.kick.includes(step)) this.kick(at);
    if (track.snare.includes(step)) {
      this.noise(at, 0.13, 0.29, 1200);
      this.tone(50, at, 0.12, 0.13, "triangle", 900);
    }
    if (track.hat.includes(step)) this.noise(at, step % 4 === 2 ? 0.06 : 0.04, step % 4 === 2 ? 0.07 : 0.045, 6500);
    const bass = track.bass[step];
    if (bass !== null) this.tone(root + bass, at, sixteenth * 0.87, 0.22, track.bassType, track.filter);
    const lead = track.lead[step];
    if (lead !== null && (bar % 8 >= 2 || step % 4 === 0)) {
      const variation = bar % 8 === 7 && step >= 8 ? 12 : 0;
      this.tone(root + 12 + lead + variation, at, sixteenth * 1.25, 0.07, track.leadType, 2800);
    }
    if (step === 0 && bar % 4 === 0) {
      for (const interval of [12, 15, 19]) this.tone(root + interval, at, sixteenth * 14, 0.035, "triangle", 900);
    }
  }
};
