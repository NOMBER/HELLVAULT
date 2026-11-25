const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class Param {
  constructor() { this.value = 0; }
  setValueAtTime(v) { this.value = v; }
  exponentialRampToValueAtTime(v) { this.value = v; }
  setTargetAtTime(v) { this.value = v; }
  cancelScheduledValues() {}
}
class Node {
  constructor() {
    this.gain = new Param(); this.frequency = new Param(); this.Q = new Param();
    this.threshold = new Param(); this.knee = new Param(); this.ratio = new Param();
    this.attack = new Param(); this.release = new Param();
  }
  connect() {} start() {} stop() {}
}
class AudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 100; this.state = "running"; this.destination = new Node(); this.notes = 0; }
  createGain() { return new Node(); }
  createDynamicsCompressor() { return new Node(); }
  createBuffer(channels, size) { return { getChannelData: () => new Float32Array(size) }; }
  createOscillator() { this.notes++; return new Node(); }
  createBiquadFilter() { return new Node(); }
  createBufferSource() { this.notes++; return new Node(); }
  close() { this.state = "closed"; return Promise.resolve(); }
}
let nextTimer = 1;
const timers = new Set();
const context = vm.createContext({
  console,
  window: {
    AudioContext,
    setInterval() { const id = nextTimer++; timers.add(id); return id; },
    clearInterval(id) { timers.delete(id); },
  },
});
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", "music.js"), "utf8"), context);

test("soundtracks start, change with mode, stop on pause, and respect independent volume", () => {
  const player = new context.MusicPlayer();
  player.start("story");
  assert.equal(player.mode, "story");
  assert.ok(player.step > 0 && player.ctx.notes > 0 && timers.has(player.timer));
  player.configure(true, 0.2);
  assert.equal(player.volume, 0.2);
  player.start("linear");
  assert.equal(player.mode, "linear");
  assert.equal(timers.size, 1, "mode changes must not leak a scheduler");
  player.configure(false, 0.2);
  assert.equal(player.timer, null);
  assert.equal(timers.size, 0);
  player.configure(true, 0.4);
  assert.ok(player.timer !== null, "turning music back on resumes the active mode");
  player.pause();
  assert.equal(timers.size, 0);
  assert.equal(player.wanted, false);
  const ctx = player.ctx;
  player.close();
  assert.equal(ctx.state, "closed");
});
