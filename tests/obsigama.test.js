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

test("playtime counts only active updates and excludes menu, pause, and death", () => {
  let activeSeconds = 0;
  const game = {
    state: "playing", mode: "story", time: 0, run: { time: 0 },
    opts: { onActiveTime(dt) { activeSeconds += dt; } },
    data: { settings: { sensitivity: 1 } }, keys: new Set(), pa: 0, mdx: 0,
    px: 0, py: 0, zone: 0, zoneAt: () => 0,
    msgs: [], explored: new Uint8Array(4096),
    updateDoors() {}, updateItems() { this.state = "menu"; },
  };
  context.Game.prototype.update.call(game, 2.25);
  assert.equal(game.run.time, 2.25);
  assert.equal(activeSeconds, 2.25);
  context.Game.prototype.update.call(game, 3_600);
  assert.equal(game.run.time, 2.25, "menu time must not enter the run clock");
  assert.equal(activeSeconds, 2.25, "menu time must not enter OBSIGAMA playtime");
  game.state = "dead";
  game.deadT = 10;
  game.hurtT = 0;
  context.Game.prototype.update.call(game, 3);
  assert.equal(game.run.time, 2.25, "death animation is not active gameplay");
  assert.equal(activeSeconds, 2.25);
  game.state = "playing";
  context.Game.prototype.update.call(game, 1.75);
  assert.equal(game.run.time, 4);
  assert.equal(activeSeconds, 4);
});

test("partial active time survives a reload and the completed run does not count it twice", async () => {
  const hub = fakeHub();
  const { plugin, files } = fakePlugin(hub);
  const data = context.mergeData(null);
  let bridge = await context.HELLVAULT_OBSIGAMA.HellvaultObsigama.init(plugin, data);
  try {
    await bridge.client.setConnect(true);
    bridge.recordActiveTime(12.5);
    bridge.flushActiveTime(); // Pause: no run completed.
    bridge.flushPartial(data); // Close the view after a long pause.
    assert.equal(bridge.client.getStats().playtime_ms, 12_500);
    assert.equal(bridge.client.getStats().runs, undefined);
    bridge.client.destroy();
    await waitUntil(() => [...files.values()].some((raw) => JSON.parse(raw).stats.playtime_ms === 12_500));
    bridge = await context.HELLVAULT_OBSIGAMA.HellvaultObsigama.init(plugin, data);
    assert.equal(bridge.client.getStats().playtime_ms, 12_500);
    bridge.recordActiveTime(7.5);
    bridge.endRun(data, "linear", { kills: 0, time: 20 });
    await waitUntil(() => hub.sent.some((batch) => batch.events.some((event) => event.type === "session")));
    assert.equal(bridge.client.getStats().playtime_ms, 20_000);
    const events = hub.sent.flatMap((batch) => batch.events);
    assert.equal(events.filter((event) => event.type === "session").length, 1);
    assert.equal(events.find((event) => event.type === "session").payload.durationMs, 20_000);
    assert.equal(events.filter((event) => event.type === "stat" && event.payload.id === "playtime_ms").reduce((sum, event) => sum + event.payload.value, 0), 20_000);
  } finally { bridge.client.destroy(); }
});

test("note indexing covers the vault and applies include and exclude folders without reading content", () => {
  const files = [
    { path: "Visible/Hello.md", basename: "Hello" },
    { path: "Visible/Deep/World.md", basename: "World" },
    { path: "Visible/Private/Secret.md", basename: "Secret" },
    { path: "Other/Hello.md", basename: "Hello" },
    ...Array.from({ length: 450 }, (_, i) => ({ path: `Bulk/${i}.md`, basename: `${i}` })),
  ];
  let scans = 0;
  const plugin = Object.create(context.VaultShardsPlugin.prototype);
  plugin.data = { settings: { useNoteNames: true, includedFolders: [], excludedFolders: ["Visible/Private"] } };
  plugin.app = { vault: { getMarkdownFiles() { scans++; return files; }, read() { throw new Error("Note contents must not be read"); } } };
  assert.equal(plugin.noteEntries().length, 453, "the entire allowed vault is indexed, without the old 400-note limit");
  assert.equal(plugin.noteEntries().filter((note) => note.name === "Hello").length, 2, "duplicate titles keep their separate paths");
  assert.equal(scans, 1, "the index is cached");
  plugin.data.settings.includedFolders = ["Visible"];
  assert.deepEqual(Array.from(plugin.noteEntries(), (note) => note.path), ["Visible/Hello.md", "Visible/Deep/World.md"]);
  assert.equal(scans, 1, "changing filters does not rescan the vault");
  plugin.invalidateNoteIndex(false);
  plugin.noteEntries();
  assert.equal(scans, 2, "manual refresh rescans");
  plugin.data.settings.useNoteNames = false;
  assert.deepEqual(Array.from(plugin.noteEntries()), []);
});

test("resetting game progress keeps active playtime already earned", async () => {
  const { plugin } = fakePlugin(null);
  const data = context.mergeData(null);
  const bridge = await context.HELLVAULT_OBSIGAMA.HellvaultObsigama.init(plugin, data);
  try {
    bridge.recordActiveTime(3.25);
    bridge.rebase(context.mergeData(null));
    assert.equal(bridge.client.getStats().playtime_ms, 3250);
    assert.equal(bridge.client.getStats().runs, undefined);
  } finally { bridge.client.destroy(); }
});

test("a real note is used without mixing in fictional names, and kills retain their note path locally", () => {
  const data = context.mergeData(null);
  const game = {
    data, mode: "story", run: { time: 10 }, enemies: [], decor: [], art: null,
    opts: { getNoteEntries: () => [{ name: "A real note", path: "Research/A real note.md" }], getPlayerName: () => "@keeper", onSave() {} },
    assignEnemyNote: context.Game.prototype.assignEnemyNote,
  };
  context.Game.prototype.refreshNames.call(game);
  assert.deepEqual(Array.from(game.names), ["A real note"]);
  const enemy = { type: "glitch" };
  game.assignEnemyNote(enemy, game.noteEntries[0]);
  assert.equal(enemy.notePath, "Research/A real note.md");
  context.Game.prototype.recordKill.call(game, enemy);
  assert.equal(data.progress.killLog[0].player, "@keeper");
  assert.equal(data.progress.killLog[0].noteName, "A real note");
  assert.equal(data.progress.killLog[0].notePath, "Research/A real note.md");
  const exported = context.HELLVAULT_OBSIGAMA.HellvaultObsigama.totals(data);
  assert.equal(JSON.stringify(exported).includes("A real note"), false, "note titles and paths must not enter OBSIGAMA totals");
});

test("muted legacy saves stay muted and new settings preserve the old progress", () => {
  const data = context.mergeData({ settings: { sound: false, volume: 0.4, excludedFolders: ["Private"] }, progress: { stats: { kills: 8 } } });
  assert.equal(data.settings.music, false);
  assert.equal(data.settings.volume, 0.4);
  assert.equal(data.settings.musicVolume, 0.35);
  assert.equal(data.progress.stats.kills, 8);
  assert.deepEqual(Array.from(data.settings.excludedFolders), ["Private"]);
  assert.deepEqual(Array.from(data.settings.includedFolders), []);
  assert.deepEqual(Array.from(data.progress.killLog), []);
});

test("each mode has its own multi-bar soundtrack with a distinct tempo and melody", () => {
  const tracks = context.HELLVAULT_TRACKS;
  assert.deepEqual(Object.keys(tracks).sort(), ["arena", "linear", "story"]);
  assert.equal(new Set(Object.values(tracks).map((track) => track.bpm)).size, 3);
  assert.equal(new Set(Object.values(tracks).map((track) => JSON.stringify(track.lead))).size, 3);
  for (const track of Object.values(tracks)) {
    assert.ok(track.roots.length >= 16);
    assert.equal(track.bass.length, 16);
    assert.equal(track.lead.length, 16);
  }
});
