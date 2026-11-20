const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const context = vm.createContext({
  module: { exports: {} },
  require(name) {
    if (name === "obsidian") return { Plugin: class {}, ItemView: class {}, PluginSettingTab: class {}, Notice: class {}, Setting: class {} };
    throw new Error(`Unexpected dependency: ${name}`);
  },
  console, setTimeout, clearTimeout,
});
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8"), context);

function fakeHub() {
  const status = { enabled: true, configured: true, signedIn: true, userId: "player-1", username: "player" };
  const sent = [];
  let linked = false;
  let links = 0;
  const api = {
    protocol: 1, platformName: "OBSIGAMA",
    getStatus: () => ({ ...status }),
    onStatusChange: () => () => {},
    isLinked: () => linked,
    async requestLink() { links++; linked = true; return { ok: true, userId: status.userId }; },
    async submit(request) {
      sent.push(JSON.parse(JSON.stringify(request)));
      return { ok: true, results: request.events.map((event) => ({ idem: event.idem, status: "accepted" })), unlocked: [], badges: [], stats: {} };
    },
    openHub() {},
  };
  return { api, sent, status, get links() { return links; } };
}

function fakePlugin(hub) {
  const files = new Map();
  const adapter = {
    async exists(name) { return files.has(name); },
    async read(name) { return files.get(name); },
    async write(name, text) { files.set(name, text); },
  };
  return {
    files,
    plugin: {
      app: { vault: { adapter, configDir: ".obsidian" }, plugins: { getPlugin: () => hub && { api: hub.api } } },
      manifest: { id: "vault-shards" },
      register() {},
    },
  };
}

async function waitUntil(predicate) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Timed out waiting for the async SDK operation");
}

test("legacy totals stay local by default, backfill once after consent, and sync completed runs", async () => {
  const hub = fakeHub();
  const { plugin, files } = fakePlugin(hub);
  const data = context.mergeData({
    progress: { stats: { kills: 40, wins: 1, best_time: 320 }, achievements: { first_blood: 123 }, lore: ["d1", "d2"] },
    records: [{ wave: 5, kills: 38, time: 210 }],
  });
  data.privateNoteName = "PERSONAL_NOTE_SHOULD_NEVER_LEAVE";
  const bridge = await context.HELLVAULT_OBSIGAMA.HellvaultObsigama.init(plugin, data);
  try {
    assert.equal(bridge.client.isConnectEnabled(), false);
    assert.equal(bridge.client.getStats().kills, 40);
    assert.equal(bridge.client.getBest("arena_wave"), 5);
    assert.equal(hub.sent.length, 0);
    bridge.client.importTotals(context.HELLVAULT_OBSIGAMA.HellvaultObsigama.totals(data));
    assert.equal(bridge.client.getStats().kills, 40, "re-import must not double totals");
    await bridge.client.setConnect(true);
    assert.equal(hub.links, 1);
    assert.equal(hub.sent.length, 1);
    const snapshot = hub.sent[0].events.find((event) => event.type === "snapshot");
    assert.equal(snapshot.payload.stats.kills, 40);
    assert.equal(snapshot.payload.best.arena_wave, 5);
    assert.equal(snapshot.payload.achievements.first_blood, 123);
    assert.equal(JSON.stringify(hub.sent).includes(data.privateNoteName), false);
    data.progress.stats.kills = 43;
    bridge.endRun(data, "story", { kills: 3, time: 300 });
    await waitUntil(() => hub.sent.length === 2);
    const run = hub.sent[1].events;
    assert.equal(run.filter((event) => event.type === "session").length, 1);
    assert.equal(run.find((event) => event.type === "stat" && event.payload.id === "kills").payload.value, 3);
    assert.equal(run.find((event) => event.type === "score" && event.payload.lb === "fastest_win_s").payload.value, 300);
    assert.equal(run.some((event) => event.type === "achievement"), false);
    assert.ok([...files.keys()].every((name) => name.endsWith("/obsigama-sync.json")), "the SDK must not write data.json");
  } finally { bridge.client.destroy(); }
});

test("partial progress and offline runs survive until the hub is available", async () => {
  const hub = fakeHub();
  const { plugin } = fakePlugin(hub);
  const data = context.mergeData(null);
  const bridge = await context.HELLVAULT_OBSIGAMA.HellvaultObsigama.init(plugin, data);
  try {
    await bridge.client.setConnect(true);
    hub.status.enabled = false;
    data.progress.stats.kills = 4;
    bridge.flushPartial(data);
    assert.equal(bridge.client.getStats().kills, 4);
    assert.equal(bridge.client.getStats().runs, undefined, "closing a view is not a completed run");
    data.progress.stats.kills = 6;
    data.records.push({ wave: 3, kills: 6, time: 100 });
    bridge.endRun(data, "arena", { kills: 6, time: 100, completedWave: 3 });
    await waitUntil(() => bridge.client.getStatus().pending > 0);
    assert.equal(bridge.client.getStats().kills, 6);
    assert.equal(bridge.client.getStatus().state, "platform-disabled");
    hub.status.enabled = true;
    await bridge.client.syncNow();
    assert.equal(bridge.client.getStatus().pending, 0);
    const events = hub.sent.flatMap((batch) => batch.events);
    assert.equal(events.filter((e) => e.type === "session").length, 1);
    assert.equal(events.find((e) => e.type === "score" && e.payload.lb === "arena_wave").payload.value, 3);
  } finally { bridge.client.destroy(); }
});

test("game reports each finished mode once after updating the corresponding progress", () => {
  const calls = [];
  const data = context.mergeData(null);
  const makeGame = (run) => ({
    data, run,
    opts: { onRunEnd(kind, info) { calls.push({ kind, info, wins: data.progress.stats.wins, linearWins: data.progress.stats.linear_wins, records: data.records.length }); }, onSave() {} },
    stat(id) { data.progress.stats[id] = (data.progress.stats[id] || 0) + 1; },
    unlockLore() {}, checkAch() {}, persist() {}, openMenu() {}, sfx: { play() {} },
  });
  const story = makeGame({ won: false, time: 420, kills: 7, deaths: 0 });
  context.Game.prototype.win.call(story);
  context.Game.prototype.win.call(story);
  const linear = makeGame({ won: false, time: 120, kills: 4 });
  context.Game.prototype.finishLinear.call(linear);
  context.Game.prototype.finishLinear.call(linear);
  const arena = makeGame({ ended: false, completedWave: 5, wave: 6, kills: 12, time: 200, difficulty: "normal" });
  context.Game.prototype.finishArena.call(arena);
  context.Game.prototype.finishArena.call(arena);
  assert.deepEqual(calls.map((call) => call.kind), ["story", "linear", "arena"]);
  assert.equal(calls[0].wins, 1);
  assert.equal(calls[1].linearWins, 1);
  assert.equal(calls[2].records, 1);
  assert.equal(calls[2].info.completedWave, 5);
});

test("game remains playable with no OBSIGAMA hub", async () => {
  const { plugin } = fakePlugin(null);
  const data = context.mergeData(null);
  const bridge = await context.HELLVAULT_OBSIGAMA.HellvaultObsigama.init(plugin, data);
  try {
    await bridge.client.setConnect(true);
    assert.equal(bridge.client.getStatus().state, "no-platform");
    data.progress.stats.kills = 2;
    bridge.endRun(data, "linear", { kills: 2, time: 80 });
    await waitUntil(() => bridge.client.getStats().runs === 1);
    assert.equal(bridge.client.getStats().kills, 2);
  } finally { bridge.client.destroy(); }
});
