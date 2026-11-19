const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

// The release is a single bundled plugin; Obsidian classes are not needed to
// exercise save migration, translated content, and the localized Codex.
const context = vm.createContext({
  module: { exports: {} },
  require(name) {
    if (name === "obsidian") return { Plugin: class {}, ItemView: class {}, PluginSettingTab: class {} };
    throw new Error(`Unexpected dependency: ${name}`);
  },
  console
});
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8"), context);

test("new saves use English and older saves retain Russian progress", () => {
  assert.equal(context.mergeData(null).settings.language, "en");
  const old = context.mergeData({
    settings: { difficulty: "easy" },
    progress: { stats: { wins: 1 }, achievements: { first_blood: 1 }, lore: ["d1"] },
    run: { shards: [0, 1], won: true }
  });
  assert.equal(old.settings.language, "ru");
  assert.equal(old.settings.difficulty, "easy");
  assert.equal(old.progress.arenaUnlocked, true);
  assert.equal(old.progress.achievements.first_blood, 1);
  assert.equal(old.progress.lore[0], "d1");
  assert.equal(old.runs.story.shards.length, 2);
});

test("all narrative and achievement content switches between languages", () => {
  const original = context.LORE.map(({ id, title, hint, text }) => JSON.stringify({ id, title, hint, text }));
  context.setGameLanguage("en");
  assert.equal(context.LORE.length, 26);
  assert.equal(context.ACHIEVEMENTS.length, 21);
  for (const item of context.LORE) {
    for (const field of ["title", "hint", "text"]) assert.doesNotMatch(item[field], /[А-Яа-яЁё]/u, `${item.id}: ${field}`);
  }
  for (const item of context.ACHIEVEMENTS) {
    assert.doesNotMatch(item.title + item.desc, /[А-Яа-яЁё]/u, item.id);
  }
  assert.equal(context.EDEF.orphan.name, "Orphan");
  assert.equal(context.WEAPONS[0].name, "Quill");
  context.setGameLanguage("ru");
  assert.deepEqual(Array.from(context.LORE, ({ id, title, hint, text }) => JSON.stringify({ id, title, hint, text })), Array.from(original));
  assert.equal(context.EDEF.orphan.name, "Сирота");
  assert.equal(context.WEAPONS[0].name, "Перо");
});

test("translations preserve template values and localize the Codex export", () => {
  for (const [ru, en] of Object.entries(context.EN_RUNTIME)) {
    const fields = (value) => (value.match(/\{\d+\}/g) || []).sort().join(",");
    assert.equal(fields(ru), fields(en), ru);
  }
  context.setGameLanguage("en");
  assert.equal(context.tr(["Найден тайник! (", "/3)"], 2), "Secret found! (2/3)");
  const en = context.buildLoreMarkdown(["st_prologue", "d1"], {});
  assert.match(en, /Prologue: Quiet Corruption/);
  assert.match(en, /## Achievements/);
  context.setGameLanguage("ru");
  const ru = context.buildLoreMarkdown(["st_prologue", "d1"], {});
  assert.match(ru, /Пролог: Тихая порча/);
  assert.match(ru, /## Достижения/);
});
