"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  VIEW_TYPE_SHARDS: () => VIEW_TYPE_SHARDS,
  default: () => VaultShardsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/game/world.ts
var MW = 72;
var MH = 72;
var Z = { ARCHIVE: 0, GARDEN: 1, GRAPH: 2, BROKEN: 3, CORE: 4 };
var T = {
  EMPTY: 0,
  STONE: 1,
  SHELF: 2,
  HEDGE: 3,
  CRYSTAL: 4,
  GLITCH: 5,
  OBSIDIAN: 6,
  BORDER: 7,
  DOOR0: 10,
  DOOR1: 11,
  DOOR2: 12,
  DOOR3: 13,
  SECRET_STONE: 14,
  SECRET_HEDGE: 15,
  SECRET_CRYSTAL: 16
};
var ZONES = [
  { id: 0, name: "\u0410\u0440\u0445\u0438\u0432", sub: "\u0433\u0434\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u0436\u0434\u0443\u0442 \u0433\u043E\u0434\u0430\u043C\u0438", fog: [26, 16, 14], density: 0.11, sky: 0, map: "#8a6d55" },
  { id: 1, name: "\u0421\u0430\u0434 \u0417\u0430\u043C\u0435\u0442\u043E\u043A", sub: "\u043C\u044B\u0441\u043B\u0438, \u0435\u0449\u0451 \u043D\u0435 \u0441\u0442\u0430\u0432\u0448\u0438\u0435 \u0442\u0435\u043A\u0441\u0442\u043E\u043C", fog: [70, 44, 92], density: 0.06, sky: 1, map: "#4f8f5a" },
  { id: 2, name: "\u0413\u0440\u0430\u0444", sub: "\u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u043F\u043E\u0433\u0430\u0441\u0448\u0438\u0445 \u0441\u0432\u044F\u0437\u0435\u0439", fog: [14, 4, 32], density: 0.08, sky: 0, map: "#8b5cf6" },
  { id: 3, name: "\u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438", sub: "\u043E\u0448\u0438\u0431\u043A\u0430 404 \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u043C \u0441 \u043C\u0438\u0440", fog: [44, 10, 12], density: 0.09, sky: 2, map: "#c0504d" },
  { id: 4, name: "\u042F\u0434\u0440\u043E", sub: "\u0437\u0434\u0435\u0441\u044C \u0436\u0438\u0432\u0451\u0442 \u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430", fog: [6, 2, 12], density: 0.07, sky: 0, map: "#d8d0ff" }
];
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function zoneOf(x, y) {
  if (x >= 28 && x <= 43 && y >= 28 && y <= 43) return Z.CORE;
  if (x < 36) return y >= 36 ? Z.ARCHIVE : Z.BROKEN;
  return y >= 36 ? Z.GARDEN : Z.GRAPH;
}
function generateWorld(seed = 20261110) {
  const rng = mulberry32(seed);
  const ri = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const N = MW * MH;
  const grid = new Uint8Array(N);
  const zone = new Uint8Array(N);
  const prot = new Uint8Array(N);
  const I = (x, y) => y * MW + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) zone[I(x, y)] = zoneOf(x, y);
  const wall = (x, y, t, p = false) => {
    if (!inb(x, y)) return;
    if (prot[I(x, y)] && !p) return;
    grid[I(x, y)] = t;
    if (p) prot[I(x, y)] = 1;
  };
  const freeable = (x, y, z) => inb(x, y) && !prot[I(x, y)] && zone[I(x, y)] === z;
  const place = (x, y, z, t) => {
    if (freeable(x, y, z)) grid[I(x, y)] = t;
  };
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) wall(x, y, T.BORDER, true);
  }
  for (let y = 1; y < MH - 1; y++) if (y < 28 || y > 43) wall(36, y, T.BORDER, true);
  for (let x = 1; x < MW - 1; x++) if (x < 28 || x > 43) wall(x, 36, T.BORDER, true);
  for (let i = 28; i <= 43; i++) {
    wall(28, i, T.OBSIDIAN, true);
    wall(43, i, T.OBSIDIAN, true);
    wall(i, 28, T.OBSIDIAN, true);
    wall(i, 43, T.OBSIDIAN, true);
  }
  for (let y = 39; y <= 69; y += 3) {
    let x = ri(2, 4);
    while (x < 35) {
      const len = ri(2, 6);
      if (rng() < 0.78) for (let k = 0; k < len; k++) place(x + k, y, Z.ARCHIVE, T.SHELF);
      x += len + ri(2, 4);
    }
  }
  for (let k = 0; k < 22; k++) {
    const x = ri(2, 34), y = ri(38, 69);
    place(x, y, Z.ARCHIVE, T.STONE);
  }
  for (let y = 46; y <= 52; y++) for (let x = 14; x <= 22; x++) place(x, y, Z.ARCHIVE, 0);
  for (const [x, y] of [[14, 46], [22, 46], [14, 52], [22, 52]]) place(x, y, Z.ARCHIVE, T.STONE);
  for (let k = 0; k < 24; k++) {
    const w = ri(1, 4), h = ri(1, 3), x0 = ri(38, 68), y0 = ri(38, 68);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) place(x, y, Z.GARDEN, T.HEDGE);
  }
  for (let i = 0; i <= 10; i++) {
    place(56 + i, 56, Z.GARDEN, T.HEDGE);
    place(56 + i, 66, Z.GARDEN, T.HEDGE);
    if (i !== 5) {
      place(56, 56 + i, Z.GARDEN, T.HEDGE);
      place(66, 56 + i, Z.GARDEN, T.HEDGE);
    }
  }
  for (let y = 57; y <= 65; y++) for (let x = 57; x <= 65; x++) place(x, y, Z.GARDEN, 0);
  for (let y = 3; y <= 33; y += 4) for (let x = 39; x <= 69; x += 4) {
    place(x, y, Z.GRAPH, T.CRYSTAL);
    if (rng() < 0.33) for (let k = 1; k <= 3; k++) place(x + k, y, Z.GRAPH, T.CRYSTAL);
    if (rng() < 0.33) for (let k = 1; k <= 3; k++) place(x, y + k, Z.GRAPH, T.CRYSTAL);
  }
  for (let k = 0; k < 11; k++) {
    const w = ri(5, 9), h = ri(5, 9), x0 = ri(2, 30), y0 = ri(2, 30);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const edge = x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + h - 1;
      if (edge && rng() > 0.32) place(x, y, Z.BROKEN, rng() < 0.55 ? T.STONE : T.GLITCH);
    }
  }
  for (let k = 0; k < 30; k++) place(ri(2, 34), ri(2, 34), Z.BROKEN, T.GLITCH);
  for (const [cx, cy] of [[32, 32], [38, 32], [32, 38], [38, 38]])
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) place(cx + dx, cy + dy, Z.CORE, T.OBSIDIAN);
  const doors = [
    { x: 36, y: 56, need: 1, to: Z.GARDEN },
    { x: 56, y: 36, need: 3, to: Z.GRAPH },
    { x: 36, y: 12, need: 5, to: Z.BROKEN },
    { x: 32, y: 28, need: 6, to: Z.CORE }
  ];
  doors.forEach((d, i) => {
    grid[I(d.x, d.y)] = T.DOOR0 + i;
    prot[I(d.x, d.y)] = 1;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = d.x + dx, y = d.y + dy;
      if (inb(x, y) && !prot[I(x, y)]) grid[I(x, y)] = 0;
    }
  });
  const start = { x: 5.5, y: 67.5, a: -Math.PI / 2 };
  for (let y = 64; y <= 70; y++) for (let x = 1; x <= 9; x++) if (!prot[I(x, y)]) grid[I(x, y)] = 0;
  const secrets = [];
  const secretRoom = (x0, y0, x1, y1, wt, st2, dx, dy, ox, oy) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const edge = x === x0 || y === y0 || x === x1 || y === y1;
      if (grid[I(x, y)] === T.BORDER) continue;
      grid[I(x, y)] = edge ? wt : 0;
      prot[I(x, y)] = 1;
    }
    grid[I(dx, dy)] = st2;
    secrets.push({ x: dx, y: dy });
    for (let k = -1; k <= 1; k++) {
      const x = ox + (oy === dy ? 0 : k), y = oy + (ox === dx ? 0 : k);
      if (!prot[I(x, y)]) grid[I(x, y)] = 0;
    }
    if (!prot[I(ox, oy)]) grid[I(ox, oy)] = 0;
  };
  secretRoom(0, 49, 4, 53, T.STONE, T.SECRET_STONE, 4, 51, 5, 51);
  secretRoom(59, 67, 63, 71, T.HEDGE, T.SECRET_HEDGE, 61, 67, 61, 66);
  secretRoom(67, 3, 71, 7, T.CRYSTAL, T.SECRET_CRYSTAL, 67, 5, 66, 5);
  const anchors = [
    { x: 5, y: 67 },
    { x: 38, y: 56 },
    { x: 56, y: 34 },
    { x: 34, y: 12 },
    { x: 35, y: 35 }
  ];
  anchors.forEach((a) => {
    grid[I(a.x, a.y)] = 0;
  });
  const flood = (z, from) => {
    const dist = new Int32Array(N).fill(-1);
    const q = [I(from.x, from.y)];
    dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) {
      const c = q[h], cx = c % MW, cy = c / MW | 0;
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + ax, ny = cy + ay;
        if (!inb(nx, ny)) continue;
        const n = I(nx, ny);
        if (dist[n] >= 0 || grid[n] !== 0 || zone[n] !== z) continue;
        dist[n] = dist[c] + 1;
        q.push(n);
      }
    }
    return dist;
  };
  const dists = [];
  for (let z = 0; z < 5; z++) {
    for (let guard = 0; guard < 400; guard++) {
      const dist = flood(z, anchors[z]);
      let lost = -1;
      for (let c = 0; c < N; c++) if (zone[c] === z && grid[c] === 0 && !prot[c] && dist[c] < 0) {
        lost = c;
        break;
      }
      if (lost < 0) {
        dists[z] = dist;
        break;
      }
      const prev = new Int32Array(N).fill(-2);
      const q = [lost];
      prev[lost] = -1;
      let found = -1;
      for (let h = 0; h < q.length && found < 0; h++) {
        const c = q[h], cx = c % MW, cy = c / MW | 0;
        for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + ax, ny = cy + ay;
          if (!inb(nx, ny)) continue;
          const n = I(nx, ny);
          if (prev[n] !== -2 || prot[n] || zone[n] !== z) continue;
          prev[n] = c;
          if (grid[n] === 0 && dist[n] >= 0) {
            found = n;
            break;
          }
          q.push(n);
        }
      }
      if (found < 0) {
        grid[lost] = T.STONE;
        continue;
      }
      for (let c = found; c >= 0; c = prev[c]) grid[c] = 0;
      dists[z] = dist;
    }
  }
  const occ = new Uint8Array(N);
  for (const a of anchors) occ[I(a.x, a.y)] = 1;
  const cellsOf = (z) => {
    const out = [];
    const d = dists[z];
    for (let c = 0; c < N; c++) if (d && d[c] >= 0 && !occ[c]) out.push(c);
    return out;
  };
  const pick = (z, minD, far = false, sep = [], minSep = 0) => {
    const d = dists[z];
    let cells = cellsOf(z).filter((c2) => d[c2] >= minD && sep.every((s) => Math.hypot(s.x - c2 % MW, s.y - (c2 / MW | 0)) >= minSep));
    if (!cells.length) cells = cellsOf(z);
    let c;
    if (far) {
      cells.sort((a, b) => d[b] - d[a]);
      c = cells[Math.floor(rng() * Math.min(4, cells.length))];
    } else c = cells[Math.floor(rng() * cells.length)];
    occ[c] = 1;
    return { x: c % MW + 0.5, y: (c / MW | 0) + 0.5 };
  };
  const items = [];
  const addItem = (kind, p, extra = {}) => items.push({ id: items.length, kind, x: p.x, y: p.y, ...extra });
  let shard = 0;
  const shardPlan = [1, 2, 2, 1];
  for (let z = 0; z < 4; z++) {
    const placed = [];
    for (let k = 0; k < shardPlan[z]; k++) {
      const p = pick(z, 10, true, placed, 14);
      placed.push(p);
      addItem("shard", p, { shard: shard++ });
    }
  }
  addItem("shotgun", pick(Z.ARCHIVE, 14));
  addItem("laser", pick(Z.GARDEN, 10));
  const pagePlan = [[0, ["d1", "d2"]], [1, ["d4", "d5"]], [2, ["d7", "d8"]], [3, ["d10", "d11"]], [4, ["d12"]]];
  for (const [z, ids] of pagePlan) for (const id of ids) addItem("page", pick(z, z === 0 && id === "d1" ? 3 : 6), { page: id });
  const secretLoot = [[2, 51, "d3", "shells"], [61, 69, "d6", "health"], [69, 5, "d9", "energy"]];
  for (const [x, y, id, k] of secretLoot) {
    addItem("page", { x: x + 0.5, y: y - 0.3 }, { page: id });
    addItem(k, { x: x + 0.5, y: y + 0.7 });
    addItem(k, { x: x - 0.4, y: y + 0.6 });
  }
  const supply = [
    // зона, аптечки, скобки, энергия
    [0, 4, 4, 0],
    [1, 5, 4, 4],
    [2, 5, 4, 6],
    [3, 6, 5, 6],
    [4, 3, 2, 3]
  ];
  for (const [z, h, s, e] of supply) {
    for (let k = 0; k < h; k++) addItem("health", pick(z, 4));
    for (let k = 0; k < s; k++) addItem("shells", pick(z, 4));
    for (let k = 0; k < e; k++) addItem("energy", pick(z, 4));
  }
  const enemies = [];
  const plan = [
    [0, [["orphan", 10], ["glitch", 3], ["dup", 1]]],
    [1, [["orphan", 7], ["dup", 6], ["spam", 5], ["glitch", 2]]],
    [2, [["glitch", 9], ["spam", 7], ["dup", 5], ["orphan", 3]]],
    [3, [["glitch", 8], ["spam", 8], ["dup", 7], ["orphan", 5]]]
  ];
  for (const [z, list] of plan) for (const [type, n] of list) for (let k = 0; k < n; k++) {
    const p = pick(z, z === 0 ? 9 : 6);
    enemies.push({ id: enemies.length, type, x: p.x, y: p.y });
  }
  enemies.push({ id: enemies.length, type: "boss", x: 35.5, y: 36.5 });
  const decor = [];
  const decPlan = [
    [0, "lamp", 18],
    [0, "books", 12],
    [1, "tree", 34],
    [1, "tomb", 12],
    [2, "node", 28],
    [3, "rubble", 16],
    [3, "spire", 10],
    [4, "spire", 4]
  ];
  let tomb = 0;
  for (const [z, kind, n] of decPlan) for (let k = 0; k < n; k++) {
    const p = pick(z, 2);
    decor.push({ kind, x: p.x + (rng() - 0.5) * 0.3, y: p.y + (rng() - 0.5) * 0.3, text: kind === "tomb" ? tomb++ : void 0 });
  }
  return { grid, zone, start, anchors, doors, secrets, items, enemies, decor };
}

// src/game/art.ts
var pack = (r, g, b, a = 255) => ((a & 255) << 24 | (b & 255) << 16 | (g & 255) << 8 | r & 255) >>> 0;
var cl = (v) => v < 0 ? 0 : v > 255 ? 255 : v | 0;
function tex(w, h, f) {
  const d = new Uint32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, g, b] = f(x, y);
    d[y * w + x] = pack(cl(r), cl(g), cl(b));
  }
  return { w, h, d };
}
function hash(x, y, s) {
  let h = x * 374761393 + y * 668265263 + s * 2147483647 | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
var DIGITS = {
  "1": ["010", "110", "010", "010", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"]
};
function stone(seed, base) {
  return tex(64, 64, (x, y) => {
    const row = y / 16 | 0;
    const off = row % 2 ? 16 : 0;
    const bx = (x + off) / 32 | 0;
    const mortar = y % 16 < 1 || (x + off) % 32 < 1;
    const n = hash(x, y, seed) * 26 - 13 + (hash(bx, row, seed + 7) - 0.5) * 30;
    if (mortar) return [base[0] * 0.35, base[1] * 0.35, base[2] * 0.35];
    const edge = y % 16 === 1 || (x + off) % 32 === 1 ? 18 : 0;
    return [base[0] + n + edge, base[1] + n + edge, base[2] + n + edge * 1.2];
  });
}
function shelf() {
  const rng = mulberry32(11);
  const spines = [];
  const pal = [[120, 40, 60], [60, 40, 120], [40, 90, 100], [140, 100, 40], [90, 50, 140], [50, 100, 60], [150, 140, 120]];
  for (let s = 0; s < 3; s++) {
    const row = [];
    let x = 3;
    while (x < 61) {
      const w = 3 + Math.floor(rng() * 4);
      row.push({ x0: x, w, c: pal[Math.floor(rng() * pal.length)], h: 12 + Math.floor(rng() * 6) });
      x += w;
    }
    spines.push(row);
  }
  return tex(64, 64, (x, y) => {
    const wood = [70 + hash(x, 0, 3) * 20, 44 + hash(x, 1, 3) * 10, 28];
    if (x < 3 || x > 60 || y < 2 || y % 21 < 2) return wood;
    const s = Math.min(2, y / 21 | 0);
    const yy = 21 - y % 21;
    for (const b of spines[s]) if (x >= b.x0 && x < b.x0 + b.w) {
      if (yy > b.h) return [20, 12, 10];
      const sh = x === b.x0 ? 0.6 : 1;
      const band = yy === b.h - 3 || yy === 4 ? 1.6 : 1;
      return [b.c[0] * sh * band, b.c[1] * sh * band, b.c[2] * sh * band];
    }
    return [18, 10, 8];
  });
}
function hedge(seed = 5) {
  return tex(64, 64, (x, y) => {
    const n = hash(x >> 1, y >> 1, seed);
    const n2 = hash(x >> 2, y >> 2, seed + 1);
    const g = 70 + n * 60 + n2 * 30 - y / 64 * 30;
    if (hash(x >> 1, y >> 1, seed + 9) > 0.975) return [200, 120, 240];
    return [g * 0.35, g, g * 0.5 + 20];
  });
}
function crystal() {
  return tex(64, 64, (x, y) => {
    const v1 = Math.abs((x + y) % 32 - 16) < 1;
    const v2 = Math.abs((x - y + 64) % 24 - 12) < 1;
    const cx = x - 32, cy = y - 32, r = Math.hypot(cx, cy);
    const node = r < 7 ? (7 - r) / 7 : 0;
    const n = hash(x, y, 4) * 14;
    let rr = 26 + n, gg = 10 + n * 0.5, bb = 50 + n;
    if (v1 || v2) {
      rr = 150;
      gg = 90;
      bb = 255;
    }
    rr += node * 220;
    gg += node * 180;
    bb += node * 200;
    const facet = (x / 16 | 0) + (y / 16 | 0);
    rr += facet % 2 ? 8 : 0;
    bb += facet % 2 ? 14 : 0;
    return [rr, gg, bb];
  });
}
function glitch() {
  return tex(64, 64, (x, y) => {
    const band = y / 4 | 0;
    const shift = Math.floor(hash(band, 0, 9) * 20);
    const xx = (x + shift) % 64;
    const n = hash(xx >> 2, band, 8);
    if (n > 0.85) return [255, 40, 160];
    if (n > 0.72) return [40, 230, 255];
    if (n < 0.1) return [0, 0, 0];
    const s = hash(x, y, 2) * 60;
    return [50 + s, 30 + s * 0.4, 45 + s];
  });
}
function obsidian(seed = 3) {
  return tex(64, 64, (x, y) => {
    const fx = x / 21 | 0, fy = y / 21 | 0;
    const f = hash(fx, fy, seed);
    const shine = Math.max(0, 1 - Math.abs((x * 0.7 + y) % 40 - 20) / 3);
    const n = hash(x, y, seed + 1) * 8;
    return [12 + f * 18 + shine * 70 + n, 6 + f * 8 + shine * 30, 22 + f * 30 + shine * 120 + n];
  });
}
function border() {
  const base = stone(21, [34, 24, 46]);
  const d = base.d;
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const vein = Math.abs(Math.sin(x * 0.25 + Math.sin(y * 0.18) * 2) * 10 - y % 20) < 0.8;
    if (vein) d[y * 64 + x] = pack(170, 80, 255);
  }
  return base;
}
function door(need) {
  const dig = DIGITS[String(need)];
  return tex(64, 64, (x, y) => {
    if (x < 4 || x > 59 || y < 3) return [60, 30, 90];
    if (x < 6 || x > 57 || y < 5) return [180, 110, 255];
    const inBr = y > 12 && y < 52 && (x >= 12 && x < 15 || x >= 16 && x < 19 || x >= 45 && x < 48 || x >= 49 && x < 52);
    const tb = y >= 12 && y < 15 || y >= 49 && y < 52;
    const brCap = tb && (x >= 12 && x < 22 || x >= 42 && x < 52);
    if (inBr || brCap) return [200, 140, 255];
    const gx = Math.floor((x - 26) / 4), gy = Math.floor((y - 22) / 4);
    if (gx >= 0 && gx < 3 && gy >= 0 && gy < 5 && dig[gy][gx] === "1") return [255, 220, 120];
    if (Math.abs(x - 32) + Math.abs(y - 48) * 1.4 < 4) return [255, 220, 120];
    const n = hash(x, y, 12) * 18;
    return [44 + n, 20 + n * 0.5, 70 + n];
  });
}
function cracked(t, seed) {
  const d = new Uint32Array(t.d);
  const rng = mulberry32(seed);
  let x = 20 + rng() * 24;
  for (let y = 4; y < 60; y++) {
    x += (rng() - 0.5) * 3;
    const xi = Math.max(1, Math.min(62, x | 0));
    d[y * 64 + xi] = pack(10, 6, 8);
    if (rng() < 0.15) d[y * 64 + xi + 1] = pack(10, 6, 8);
    if (y === 30) {
      for (let k = 0; k < 10; k++) d[(y + (k >> 2)) * 64 + Math.min(63, xi + k)] = pack(10, 6, 8);
    }
  }
  return { w: 64, h: 64, d };
}
var floorArchive = () => tex(32, 32, (x, y) => {
  const plank = y / 8 | 0;
  const seam = y % 8 === 0 || (x + plank * 11) % 32 === 0;
  const n = hash(x >> 2, plank, 30) * 20 + hash(x, y, 31) * 10;
  return seam ? [30, 18, 12] : [80 + n, 52 + n * 0.6, 34];
});
var floorGarden = () => tex(32, 32, (x, y) => {
  const n = hash(x, y, 40);
  if (n > 0.97) return [210, 160, 240];
  const g = 50 + n * 40 + hash(x >> 2, y >> 2, 41) * 20;
  return [g * 0.45, g, g * 0.4];
});
var floorGraph = () => tex(32, 32, (x, y) => {
  if (x === 0 || y === 0) return [120, 60, 220];
  if (x === 16 && y === 16) return [220, 180, 255];
  const n = hash(x, y, 50) * 10;
  return [12 + n, 6, 26 + n];
});
var floorBroken = () => tex(32, 32, (x, y) => {
  const tile = x % 16 === 0 || y % 16 === 0;
  const crack = Math.abs(x - y - 4) < 1 && hash(x, 0, 60) > 0.3;
  const n = hash(x, y, 61) * 20;
  if (tile || crack) return [18, 8, 8];
  return [64 + n, 44 + n * 0.5, 48 + n * 0.5];
});
var floorCore = () => tex(32, 32, (x, y) => {
  const r = Math.hypot(x - 16, y - 16);
  const ring = Math.abs(r - 11) < 0.7;
  const n = hash(x, y, 70) * 8;
  return ring ? [130, 70, 230] : [10 + n, 6, 18 + n];
});
var ceilArchive = () => tex(32, 32, (x, y) => {
  const beam = x % 16 < 3;
  const n = hash(x, y, 80) * 10;
  return beam ? [50 + n, 32, 20] : [22 + n, 16, 14];
});
var ceilGraph = () => tex(32, 32, (x, y) => hash(x, y, 90) > 0.985 ? [200, 160, 255] : [6, 2, 14]);
var ceilCore = () => tex(32, 32, (x, y) => {
  const n = hash(x >> 3, y >> 3, 95) * 14;
  return [8 + n, 4, 16 + n * 1.5];
});
function sky(kind) {
  return tex(512, 128, (x, y) => {
    const t = y / 128;
    let r, g, b;
    if (kind === 1) {
      r = 30 + t * 140;
      g = 10 + t * 60;
      b = 60 + t * 90;
    } else {
      r = 40 + t * 150;
      g = 4 + t * 30;
      b = 10 + t * 30;
    }
    const s = hash(x, y, kind * 13);
    if (s > 0.996 - (1 - t) * 4e-3 && t < 0.7) {
      r = g = b = 220 + s * 30;
    }
    const mx = kind === 1 ? 140 : 380, my = 34;
    const dx = Math.abs(x - mx), dy = Math.abs(y - my);
    if (dx * 0.8 + dy * 0.5 < 14) {
      r = kind === 1 ? 190 : 255;
      g = kind === 1 ? 140 : 90;
      b = kind === 1 ? 255 : 90;
    }
    const hill = 104 + Math.sin(x * 0.05) * 6 + Math.sin(x * 0.17) * 3 + (hash(x >> 3, 0, kind) > 0.7 ? -8 : 0);
    if (y > hill) {
      r *= 0.25;
      g *= 0.25;
      b *= 0.35;
    }
    if (kind === 2 && hash(0, y >> 2, (x >> 6) + 5) > 0.93) {
      r = 255;
      g = 40;
      b = 160;
    }
    return [r, g, b];
  });
}
function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}
function toTex(c) {
  const ctx = c.getContext("2d");
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = new Uint32Array(img.data.buffer.slice(0));
  for (let i = 0; i < d.length; i++) if (d[i] >>> 24 < 128) d[i] = 0;
  return { w: c.width, h: c.height, d };
}
function sprite(w, h, draw) {
  const [c, ctx] = canvas(w, h);
  draw(ctx, (x, y, ww, hh, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, ww, hh);
  });
  return toTex(c);
}
function orphan(frame) {
  return sprite(32, 40, (ctx, p) => {
    const bob = frame === 1 ? 1 : 0;
    const atk = frame === 2;
    p(6, 4 + bob, 20, 26, "#e8e2f4");
    p(20, 4 + bob, 6, 6, "#b8b0d0");
    p(21, 4 + bob, 5, 1, "#e8e2f4");
    p(6, 4 + bob, 1, 26, "#a89ec8");
    p(25, 10 + bob, 1, 20, "#a89ec8");
    for (let i = 0; i < 5; i++) p(6 + i * 4, 30 + bob + (i % 2 ? 2 : 0) + frame % 2, 3, 4, "#d8d0ec");
    for (let i = 0; i < 4; i++) p(9, 18 + bob + i * 3, 8 + i * 5 % 7, 1, "#8a80a8");
    p(10, 10 + bob, 3, atk ? 2 : 3, "#3b1d6e");
    p(17, 10 + bob, 3, atk ? 2 : 3, "#3b1d6e");
    p(11, 11 + bob, 1, 1, "#c4a0ff");
    p(18, 11 + bob, 1, 1, "#c4a0ff");
    if (atk) p(12, 15 + bob, 7, 2, "#3b1d6e");
    p(2, 16 + bob + (atk ? -4 : 0), 4, 2, "#d8d0ec");
    p(26, 16 + bob + (atk ? -4 : 0), 4, 2, "#d8d0ec");
  });
}
function glitchSprite(frame) {
  return sprite(32, 32, (ctx, p) => {
    const rng = mulberry32(100 + frame);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff2fa0";
    ctx.beginPath();
    ctx.ellipse(11, 16, 8, 6, -0.6, 0.3, Math.PI * 1.8);
    ctx.stroke();
    ctx.strokeStyle = "#2fe6ff";
    ctx.beginPath();
    ctx.ellipse(21, 15, 8, 6, -0.6, Math.PI * 1.2, Math.PI * 2.7);
    ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const y = Math.floor(rng() * 32);
      p(Math.floor(rng() * 24), y, 2 + Math.floor(rng() * 8), 1, rng() < 0.5 ? "#ff2fa0" : "#2fe6ff");
    }
    p(14, 12 + frame, 2, 2, "#ffffff");
    p(18, 12 + frame, 2, 2, "#ffffff");
    p(15, 13 + frame, 1, 1, "#000");
    p(19, 13 + frame, 1, 1, "#000");
  });
}
function dup(frame, small) {
  return sprite(32, 36, (ctx, p) => {
    const o = frame === 1 ? 1 : 0;
    const c1 = small ? "#9aa4c8" : "#7c6fae", c2 = small ? "#c8d0ee" : "#b9adef";
    p(4 + o, 6, 18, 22, c1);
    p(10 - o, 10, 18, 22, c2);
    p(10 - o, 10, 18, 1, "#ffffff");
    p(10 - o, 10, 1, 22, "#ffffff");
    p(4 + o, 6, 18, 1, "#d9d2ff");
    p(14 - o, 17, 3, 3, "#221144");
    p(21 - o, 17, 3, 3, "#221144");
    p(15 - o, 24, 8, 2, "#221144");
    p(15 - o, 26, 2, 1, "#221144");
    p(21 - o, 26, 2, 1, "#221144");
    p(12, 32, 3, 4 - o, c1);
    p(22, 32, 3, 3 + o, c1);
  });
}
function spam(frame) {
  return sprite(32, 36, (ctx, p) => {
    const atk = frame === 2, b = frame === 1 ? 1 : 0;
    const col = atk ? "#ffd15c" : "#ff8a3c";
    p(9, 4 + b, 4, 28, col);
    p(19, 4 + b, 4, 28, col);
    p(4, 11 + b, 24, 4, col);
    p(4, 21 + b, 24, 4, col);
    p(9, 4 + b, 1, 28, "#ffc89a");
    p(19, 4 + b, 1, 28, "#ffc89a");
    p(13, 15 + b, 6, 6, "#fff3e0");
    p(15, 16 + b, 3, 3, atk ? "#ff2040" : "#5a1a00");
    p(12, 26 + b, 8, 2, "#5a1a00");
    p(13, 26 + b, 1, 1, "#fff");
    p(16, 26 + b, 1, 1, "#fff");
    p(19, 26 + b, 1, 1, "#fff");
  });
}
function boss(frame) {
  return sprite(64, 72, (ctx, p) => {
    const o = frame === 1 ? 2 : 0;
    p(6, 4 + o, 52, 60, "#f5f3ff");
    p(46, 4 + o, 12, 12, "#c9c2ea");
    p(6, 4 + o, 2, 60, "#d4ccf4");
    p(56, 16 + o, 2, 48, "#b5abd9");
    if (frame !== 1) p(31, 18 + o, 3, 14, "#7c3aed");
    p(16, 22 + o, 9, 9, "#0b0614");
    p(40, 22 + o, 9, 9, "#0b0614");
    p(19, 25 + o, 3, 3, frame === 2 ? "#ff2a6d" : "#a78bfa");
    p(43, 25 + o, 3, 3, frame === 2 ? "#ff2a6d" : "#a78bfa");
    p(18, 42 + o, 28, frame === 2 ? 12 : 6, "#0b0614");
    for (let i = 0; i < 8; i++) p(8 + i * 6, 62 + o + i % 2 * 3, 4, 6 - i % 2 * 2, "#e0dcf8");
    p(0, 30 + o, 6, 3, "#e0dcf8");
    p(58, 30 + o, 6, 3, "#e0dcf8");
  });
}
var simple = (w, h, draw) => sprite(w, h, draw);
function weaponCanvas(kind, fire) {
  const [c, ctx] = canvas(96, 72);
  const p = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  };
  if (kind === 0) {
    if (fire) {
      p(40, 2, 16, 10, "#c084fc");
      p(44, 0, 8, 4, "#fff");
      p(36, 6, 24, 3, "#a855f7");
    }
    for (let i = 0; i < 30; i++) p(44 + Math.round(i * 0.25), 12 + i, 8 - Math.min(6, i / 6 | 0), 1, i < 3 ? "#1f1235" : i % 3 ? "#7c3aed" : "#a78bfa");
    p(47, 10, 2, 4, "#e9d5ff");
    for (let i = 0; i < 6; i++) p(36 + i * 2, 20 + i * 3, 4, 2, "#c4b5fd");
    p(40, 46, 24, 26, "#e7b48f");
    p(38, 52, 6, 14, "#d49a72");
    p(60, 50, 6, 16, "#d49a72");
    p(40, 64, 26, 8, "#4c1d95");
  } else if (kind === 1) {
    if (fire) {
      p(26, 0, 44, 14, "#ffd36b");
      p(34, 2, 28, 8, "#fff7d6");
    }
    p(32, 12, 12, 34, "#3a3550");
    p(52, 12, 12, 34, "#3a3550");
    p(33, 12, 3, 34, "#6d6690");
    p(53, 12, 3, 34, "#6d6690");
    p(34, 10, 8, 4, "#111");
    p(54, 10, 8, 4, "#111");
    p(28, 40, 40, 14, "#5b3b8f");
    p(31, 43, 2, 8, "#e9d5ff");
    p(31, 43, 4, 2, "#e9d5ff");
    p(31, 49, 4, 2, "#e9d5ff");
    p(35, 43, 2, 8, "#e9d5ff");
    p(35, 43, 4, 2, "#e9d5ff");
    p(35, 49, 4, 2, "#e9d5ff");
    p(63, 43, 2, 8, "#e9d5ff");
    p(61, 43, 4, 2, "#e9d5ff");
    p(61, 49, 4, 2, "#e9d5ff");
    p(59, 43, 2, 8, "#e9d5ff");
    p(57, 43, 4, 2, "#e9d5ff");
    p(57, 49, 4, 2, "#e9d5ff");
    p(26, 54, 44, 18, "#3d2a1e");
    p(30, 56, 14, 16, "#e7b48f");
    p(54, 58, 14, 14, "#e7b48f");
  } else {
    if (fire) {
      p(38, 0, 20, 20, "#a5f3fc");
      p(43, 3, 10, 12, "#ffffff");
    }
    p(44, 16, 8, 44, "#2e1065");
    p(42, 8, 12, 12, "#8b5cf6");
    p(44, 10, 8, 8, "#e9d5ff");
    p(46, 12, 4, 4, "#ffffff");
    p(30, 24, 8, 8, "#6d28d9");
    p(58, 28, 8, 8, "#6d28d9");
    p(37, 27, 8, 2, "#a78bfa");
    p(51, 31, 8, 2, "#a78bfa");
    p(32, 26, 4, 4, "#22d3ee");
    p(60, 30, 4, 4, "#22d3ee");
    p(38, 50, 22, 22, "#e7b48f");
    p(36, 56, 6, 12, "#d49a72");
    p(38, 66, 24, 6, "#4c1d95");
  }
  return c;
}
function buildArt() {
  const stoneT = stone(1, [92, 80, 88]);
  const hedgeT = hedge();
  const crystalT = crystal();
  const walls = {
    1: stoneT,
    2: shelf(),
    3: hedgeT,
    4: crystalT,
    5: glitch(),
    6: obsidian(),
    7: border(),
    10: door(1),
    11: door(3),
    12: door(5),
    13: door(6),
    14: cracked(stoneT, 1),
    15: cracked(hedgeT, 2),
    16: cracked(crystalT, 3)
  };
  const floors = [floorArchive(), floorGarden(), floorGraph(), floorBroken(), floorCore()];
  const ceils = [ceilArchive(), null, ceilGraph(), null, ceilCore()];
  const skies = { 1: sky(1), 2: sky(2) };
  const spr = {
    orphan: [orphan(0), orphan(1), orphan(2)],
    glitch: [glitchSprite(0), glitchSprite(1), glitchSprite(2)],
    dup: [dup(0, false), dup(1, false), dup(0, false)],
    copy: [dup(0, true), dup(1, true), dup(0, true)],
    spam: [spam(0), spam(1), spam(2)],
    boss: [boss(0), boss(1), boss(2)],
    crate: [simple(24, 24, (c, p) => {
      p(1, 2, 22, 21, "#704126");
      p(3, 4, 18, 17, "#a26b3b");
      p(3, 7, 18, 2, "#51301d");
      p(3, 17, 18, 2, "#51301d");
      p(6, 4, 2, 17, "#d1a06c");
      p(16, 4, 2, 17, "#d1a06c");
      p(10, 9, 4, 7, "#f2ce72");
    })],
    health: [simple(16, 16, (c, p) => {
      p(2, 1, 12, 14, "#f8fafc");
      p(10, 1, 4, 4, "#cbd5e1");
      p(7, 4, 3, 9, "#22c55e");
      p(4, 7, 9, 3, "#22c55e");
    })],
    shells: [simple(16, 16, (c, p) => {
      p(1, 5, 14, 10, "#5b3b8f");
      p(1, 5, 14, 2, "#8b5cf6");
      p(3, 8, 1, 5, "#fff");
      p(3, 8, 2, 1, "#fff");
      p(3, 12, 2, 1, "#fff");
      p(5, 8, 1, 5, "#fff");
      p(5, 8, 2, 1, "#fff");
      p(5, 12, 2, 1, "#fff");
      p(12, 8, 1, 5, "#fff");
      p(11, 8, 2, 1, "#fff");
      p(11, 12, 2, 1, "#fff");
      p(10, 8, 1, 5, "#fff");
      p(9, 8, 2, 1, "#fff");
      p(9, 12, 2, 1, "#fff");
    })],
    energy: [simple(16, 16, (c, p) => {
      p(4, 2, 8, 13, "#0e7490");
      p(5, 3, 6, 11, "#22d3ee");
      p(6, 1, 4, 2, "#94a3b8");
      p(7, 5, 2, 7, "#ecfeff");
    })],
    shard: [0, 1].map((f) => simple(16, 24, (c, p) => {
      c.fillStyle = f ? "#c084fc" : "#a855f7";
      c.beginPath();
      c.moveTo(8, 0);
      c.lineTo(15, 10);
      c.lineTo(8, 23);
      c.lineTo(1, 10);
      c.closePath();
      c.fill();
      c.fillStyle = "#1e0b36";
      c.beginPath();
      c.moveTo(8, 3);
      c.lineTo(12, 10);
      c.lineTo(8, 19);
      c.closePath();
      c.fill();
      p(5, 7, 2, 4, "#f5e9ff");
      if (f) p(9, 2, 1, 1, "#fff");
    })),
    page: [simple(16, 18, (c, p) => {
      p(2, 1, 12, 16, "#f1e3c2");
      p(2, 1, 12, 1, "#c9a66b");
      for (let i = 0; i < 5; i++) p(4, 4 + i * 2, 8 - i % 2 * 3, 1, "#6b4f2a");
      p(10, 13, 3, 3, "#7c3aed");
    })],
    shotgun: [simple(32, 14, (c, p) => {
      p(2, 4, 22, 3, "#3a3550");
      p(2, 7, 22, 3, "#4a4466");
      p(20, 4, 10, 8, "#5b3b8f");
      p(24, 9, 6, 5, "#3d2a1e");
      p(22, 5, 2, 4, "#e9d5ff");
      p(26, 5, 2, 4, "#e9d5ff");
    })],
    laser: [simple(14, 32, (c, p) => {
      p(5, 8, 4, 24, "#2e1065");
      p(3, 1, 8, 8, "#8b5cf6");
      p(5, 3, 4, 4, "#fff");
      p(0, 12, 4, 4, "#22d3ee");
      p(10, 15, 4, 4, "#22d3ee");
    })],
    lamp: [0, 1].map((f) => simple(12, 32, (c, p) => {
      p(5, 12, 2, 20, "#3b2a1a");
      p(2, 30, 8, 2, "#3b2a1a");
      p(4, 6, 4, 6, "#f5e6c8");
      p(5, 2 + f, 2, 4, "#ffcf5a");
      p(5, 3 + f, 1, 2, "#fff");
    })),
    books: [simple(20, 14, (c, p) => {
      p(1, 9, 18, 5, "#7a2e3a");
      p(3, 5, 14, 4, "#3b4a8a");
      p(5, 1, 11, 4, "#5a7a3a");
      p(1, 9, 18, 1, "#e8d8b0");
      p(3, 5, 14, 1, "#e8d8b0");
      p(5, 1, 11, 1, "#e8d8b0");
    })],
    tree: [simple(32, 48, (c, p) => {
      p(14, 26, 5, 22, "#3a2418");
      p(12, 44, 9, 4, "#3a2418");
      const cols = ["#5b2a86", "#7c3aed", "#9d5cf0", "#c4a0ff"];
      const rng = mulberry32(77);
      for (let i = 0; i < 90; i++) {
        const a = rng() * Math.PI * 2, r = rng() * 13;
        p(16 + Math.cos(a) * r - 2, 14 + Math.sin(a) * r * 0.8 - 2, 4, 4, cols[Math.floor(rng() * 4)]);
      }
    })],
    node: [0, 1].map((f) => simple(16, 16, (c, p) => {
      const g = c.createRadialGradient(8, 8, 1, 8, 8, 8);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, f ? "#c4b5fd" : "#a78bfa");
      g.addColorStop(1, "rgba(124,58,237,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 16, 16);
    })),
    rubble: [simple(24, 12, (c, p) => {
      p(1, 6, 9, 6, "#4a3a3c");
      p(8, 3, 8, 9, "#5c4a4c");
      p(15, 7, 8, 5, "#3a2a2c");
      p(10, 4, 3, 1, "#ff2fa0");
      p(4, 7, 2, 1, "#2fe6ff");
    })],
    spire: [0, 1].map((f) => simple(12, 40, (c, p) => {
      c.fillStyle = "#140a24";
      c.beginPath();
      c.moveTo(6, 0);
      c.lineTo(11, 40);
      c.lineTo(1, 40);
      c.closePath();
      c.fill();
      p(5, 8, 2, 28, f ? "#a855f7" : "#7c3aed");
      p(5, 4, 2, 3, "#e9d5ff");
    })),
    spamShot: [simple(10, 10, (c, p) => {
      p(2, 0, 2, 10, "#ffb347");
      p(6, 0, 2, 10, "#ffb347");
      p(0, 2, 10, 2, "#ffb347");
      p(0, 6, 10, 2, "#ffb347");
    })],
    voidShot: [simple(12, 12, (c, p) => {
      const g = c.createRadialGradient(6, 6, 0, 6, 6, 6);
      g.addColorStop(0, "#000000");
      g.addColorStop(0.6, "#4c1d95");
      g.addColorStop(1, "rgba(196,181,253,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 12, 12);
    })],
    puff: [0, 1, 2].map((f) => simple(12, 12, (c, p) => {
      const r = 2 + f * 2;
      c.fillStyle = f === 2 ? "#6d28d9" : "#c084fc";
      c.beginPath();
      c.arc(6, 6, r, 0, Math.PI * 2);
      c.fill();
      if (f < 2) p(5, 5, 2, 2, "#fff");
    })),
    corpse: [simple(32, 10, (c, p) => {
      p(2, 4, 28, 6, "#3b2a5a");
      p(6, 2, 18, 3, "#5b4a7a");
      p(10, 5, 3, 1, "#c4a0ff");
    })]
  };
  const weapons = [0, 1, 2].map((k) => ({ idle: weaponCanvas(k, false), fire: weaponCanvas(k, true) }));
  const makeTomb = (text) => {
    const [c, ctx] = canvas(40, 36);
    ctx.fillStyle = "#6b6478";
    ctx.beginPath();
    ctx.moveTo(2, 36);
    ctx.lineTo(2, 10);
    ctx.arc(20, 10, 18, Math.PI, 0);
    ctx.lineTo(38, 36);
    ctx.fill();
    ctx.fillStyle = "#8a8398";
    ctx.fillRect(4, 10, 2, 24);
    ctx.fillStyle = "#2a2338";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("R.I.P.", 20, 12);
    const t = text.length > 9 ? text.slice(0, 8) + "\u2026" : text;
    ctx.font = "7px sans-serif";
    ctx.fillText(t, 20, 22);
    ctx.fillStyle = "#3f6b3a";
    ctx.fillRect(0, 32, 40, 4);
    return toTex(c);
  };
  return { walls, floors, ceils, skies, spr, weapons, makeTomb };
}

// src/game/audio.ts
var Sfx = class {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuf = null;
    this.enabled = true;
    this.volume = 0.6;
  }
  ensure() {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const ch = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
      this.master.gain.value = this.volume * 0.5;
      return this.ctx;
    } catch {
      return null;
    }
  }
  unlock() {
    this.ensure();
  }
  tone(f0, f1, dur, type, vol, delay = 0) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  noise(dur, vol, freq, delay = 0) {
    const ctx = this.ensure();
    if (!ctx || !this.master || !this.noiseBuf) return;
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }
  play(name) {
    if (!this.enabled) return;
    switch (name) {
      case "quill":
        this.tone(1200, 300, 0.09, "square", 0.25);
        this.noise(0.05, 0.2, 3e3);
        break;
      case "shotgun":
        this.noise(0.35, 0.9, 900);
        this.tone(140, 40, 0.25, "sawtooth", 0.4);
        break;
      case "laser":
        this.tone(1800, 600, 0.07, "sawtooth", 0.15);
        break;
      case "click":
        this.tone(300, 280, 0.04, "square", 0.15);
        break;
      case "hit":
        this.tone(260, 120, 0.06, "square", 0.2);
        break;
      case "edeath":
        this.tone(500, 50, 0.35, "square", 0.25);
        this.noise(0.2, 0.3, 1200);
        break;
      case "hurt":
        this.tone(180, 70, 0.25, "sawtooth", 0.4);
        break;
      case "pickup":
        this.tone(660, 660, 0.07, "triangle", 0.3);
        this.tone(990, 990, 0.09, "triangle", 0.3, 0.07);
        break;
      case "weapon":
        [440, 660, 880].forEach((f, i) => this.tone(f, f, 0.1, "square", 0.2, i * 0.08));
        break;
      case "shard":
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, f * 1.01, 0.18, "triangle", 0.3, i * 0.09));
        break;
      case "page":
        this.noise(0.2, 0.3, 5e3);
        this.tone(700, 900, 0.15, "sine", 0.2, 0.05);
        break;
      case "door":
        this.tone(70, 160, 0.7, "sawtooth", 0.3);
        this.noise(0.6, 0.3, 400);
        break;
      case "locked":
        this.tone(120, 100, 0.2, "square", 0.25);
        this.tone(90, 80, 0.25, "square", 0.25, 0.15);
        break;
      case "secret":
        [392, 494, 587, 784].forEach((f, i) => this.tone(f, f, 0.2, "sine", 0.3, i * 0.12));
        break;
      case "eshot":
        this.tone(520, 220, 0.15, "triangle", 0.2);
        break;
      case "void":
        this.tone(90, 40, 0.4, "sine", 0.5);
        break;
      case "tp":
        this.tone(2e3, 200, 0.12, "square", 0.12);
        this.noise(0.1, 0.2, 6e3);
        break;
      case "split":
        this.tone(300, 600, 0.15, "square", 0.2);
        this.tone(300, 150, 0.15, "square", 0.2);
        break;
      case "boss":
        this.tone(60, 30, 1.2, "sawtooth", 0.5);
        this.noise(1, 0.4, 300);
        break;
      case "ach":
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, f, 0.15, "square", 0.15, i * 0.07));
        break;
      case "win":
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, f, 0.3, "triangle", 0.3, i * 0.15));
        break;
    }
  }
  close() {
    try {
      void this.ctx?.close();
    } catch {
    }
    this.ctx = null;
  }
};

// src/game/content.ts
var st = (k) => (p) => p.stats[k] || 0;
var pages = (p) => p.lore.filter((l) => l.startsWith("d")).length;
var ACHIEVEMENTS = [
  { id: "first_blood", icon: "\u270F\uFE0F", title: "\u041F\u0435\u0440\u0432\u0430\u044F \u043F\u0440\u0430\u0432\u043A\u0430", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u0440\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u041F\u043E\u0440\u0447\u0438.", target: 1, value: st("kills") },
  { id: "kills50", icon: "\u{1F9F9}", title: "\u0427\u0438\u0441\u0442\u043A\u0430 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 50 \u0432\u0440\u0430\u0433\u043E\u0432 (\u0437\u0430 \u0432\u0441\u0435 \u0437\u0430\u0431\u0435\u0433\u0438).", target: 50, value: st("kills") },
  { id: "kills150", icon: "\u267B\uFE0F", title: "\u0421\u0431\u043E\u0440\u0449\u0438\u043A \u043C\u0443\u0441\u043E\u0440\u0430", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 150 \u0432\u0440\u0430\u0433\u043E\u0432 (\u0437\u0430 \u0432\u0441\u0435 \u0437\u0430\u0431\u0435\u0433\u0438).", target: 150, value: st("kills") },
  { id: "quill25", icon: "\u{1FAB6}", title: "\u041F\u0435\u0440\u043E \u0441\u0438\u043B\u044C\u043D\u0435\u0435 \u043C\u0435\u0447\u0430", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 25 \u0432\u0440\u0430\u0433\u043E\u0432 \u041F\u0435\u0440\u043E\u043C.", target: 25, value: st("k_quill") },
  { id: "glitch15", icon: "\u{1F517}", title: "\u041F\u043E\u0447\u0438\u043D\u043A\u0430 \u0441\u0441\u044B\u043B\u043E\u043A", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 15 \u0411\u0438\u0442\u044B\u0445 \u0441\u0441\u044B\u043B\u043E\u043A.", target: 15, value: st("k_glitch") },
  { id: "spam15", icon: "\u{1F6AB}", title: "\u0410\u043D\u0442\u0438\u0441\u043F\u0430\u043C", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 15 \u0421\u043F\u0430\u043C-\u0442\u0435\u0433\u043E\u0432.", target: 15, value: st("k_spam") },
  { id: "dedup", icon: "\u{1F46F}", title: "\u0414\u0435\u0434\u0443\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u044F", desc: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u043E\u0431\u0435 \u041A\u043E\u043F\u0438\u0438 \u043E\u0434\u043D\u043E\u0433\u043E \u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442\u0430.", target: 1, value: st("dedup") },
  { id: "shard1", icon: "\u{1F48E}", title: "\u041F\u0435\u0440\u0432\u044B\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A", desc: "\u041F\u043E\u0434\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0441\u043A\u043E\u043B\u043E\u043A \u043E\u0431\u0441\u0438\u0434\u0438\u0430\u043D\u0430.", target: 1, value: st("max_shards") },
  { id: "shard7", icon: "\u{1F52E}", title: "\u0426\u0435\u043B\u043E\u0441\u0442\u043D\u043E\u0441\u0442\u044C", desc: "\u0421\u043E\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0441\u0435 7 \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432 \u0432 \u043E\u0434\u043D\u043E\u043C \u0437\u0430\u0431\u0435\u0433\u0435.", target: 7, value: st("max_shards") },
  { id: "boss", icon: "\u{1F4C4}", title: "\u041F\u0443\u0441\u0442\u043E\u0442\u0430 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0430", desc: "\u041F\u043E\u0431\u0435\u0434\u0438\u0442\u0435 \u041F\u0443\u0441\u0442\u0443\u044E \u0417\u0430\u043C\u0435\u0442\u043A\u0443.", target: 1, value: st("k_boss") },
  { id: "secret1", icon: "\u{1F5DD}\uFE0F", title: "\u0421\u043A\u0440\u044B\u0442\u044B\u0439 \u0444\u0430\u0439\u043B", desc: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0442\u0430\u0439\u043D\u0438\u043A.", target: 1, value: st("max_secrets") },
  { id: "secret3", icon: "\u{1F50D}", title: "\u041F\u043E\u043B\u043D\u0430\u044F \u0438\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F", desc: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0432\u0441\u0435 3 \u0442\u0430\u0439\u043D\u0438\u043A\u0430 \u0432 \u043E\u0434\u043D\u043E\u043C \u0437\u0430\u0431\u0435\u0433\u0435.", target: 3, value: st("max_secrets") },
  { id: "zones", icon: "\u{1F5FA}\uFE0F", title: "\u041A\u0430\u0440\u0442\u043E\u0433\u0440\u0430\u0444", desc: "\u041F\u043E\u0441\u0435\u0442\u0438\u0442\u0435 \u0432\u0441\u0435 5 \u0437\u043E\u043D \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430.", target: 5, value: st("max_zones") },
  { id: "shotgun", icon: "[[", title: "[[\u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u043A\u043E\u0431\u043A\u0438]]", desc: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 Wikilink-\u0434\u0440\u043E\u0431\u043E\u0432\u0438\u043A.", target: 1, value: st("got_shotgun") },
  { id: "laser", icon: "\u26A1", title: "\u0421\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0439", desc: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0413\u0440\u0430\u0444-\u043B\u0430\u0437\u0435\u0440.", target: 1, value: st("got_laser") },
  { id: "pages6", icon: "\u{1F4DC}", title: "\u041B\u0435\u0442\u043E\u043F\u0438\u0441\u0435\u0446", desc: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 6 \u0441\u0442\u0440\u0430\u043D\u0438\u0446 \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430.", target: 6, value: pages },
  { id: "pages12", icon: "\u{1F4DA}", title: "\u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C \u043F\u0430\u043C\u044F\u0442\u0438", desc: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0432\u0441\u0435 12 \u0441\u0442\u0440\u0430\u043D\u0438\u0446 \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430.", target: 12, value: pages },
  { id: "nodmg", icon: "\u{1F6E1}\uFE0F", title: "\u0411\u0435\u0437 \u0435\u0434\u0438\u043D\u043E\u0439 \u043F\u0440\u0430\u0432\u043A\u0438", desc: "\u041F\u043E\u0434\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0441\u043A\u043E\u043B\u043E\u043A, \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u0432 \u0443\u0440\u043E\u043D\u0430 \u0441 \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0445\u043E\u0434\u0430 \u0432 \u0437\u043E\u043D\u0443.", target: 1, value: st("nodmg_shard") },
  { id: "lowhp", icon: "\u{1F494}", title: "\u041D\u0430 \u0432\u043E\u043B\u043E\u0441\u043A\u0435", desc: "\u041E\u043F\u0443\u0441\u0442\u0438\u0442\u0435\u0441\u044C \u0434\u043E 10 HP \u0438\u043B\u0438 \u043D\u0438\u0436\u0435 \u0438 \u0432\u044B\u043B\u0435\u0447\u0438\u0442\u0435\u0441\u044C.", target: 1, value: st("low_hp") },
  { id: "speed", icon: "\u23F1\uFE0F", title: "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u043F\u043E\u0438\u0441\u043A", desc: "\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 \u0438\u0433\u0440\u0443 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0447\u0435\u043C \u0437\u0430 20 \u043C\u0438\u043D\u0443\u0442.", target: 1, value: st("speed") },
  { id: "flawless", icon: "\u2B50", title: "\u0411\u0435\u0437 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0445 \u043A\u043E\u043F\u0438\u0439", desc: "\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 \u0438\u0433\u0440\u0443, \u043D\u0438 \u0440\u0430\u0437\u0443 \u043D\u0435 \u043F\u043E\u0433\u0438\u0431\u043D\u0443\u0432.", target: 1, value: st("flawless") }
];
var LORE_CATS = [
  { id: "story", title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F" },
  { id: "zone", title: "\u0417\u043E\u043D\u044B" },
  { id: "bestiary", title: "\u0411\u0435\u0441\u0442\u0438\u0430\u0440\u0438\u0439" },
  { id: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430" }
];
var LORE = [
  {
    id: "st_prologue",
    cat: "story",
    title: "\u041F\u0440\u043E\u043B\u043E\u0433: \u0422\u0438\u0445\u0430\u044F \u043F\u043E\u0440\u0447\u0430",
    hint: "\u041E\u0442\u043A\u0440\u044B\u0442\u043E \u0441 \u043D\u0430\u0447\u0430\u043B\u0430.",
    text: "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0431\u044B\u043B\u043E \u0436\u0438\u0432\u044B\u043C. \u0422\u044B\u0441\u044F\u0447\u0438 \u0437\u0430\u043C\u0435\u0442\u043E\u043A \u0434\u044B\u0448\u0430\u043B\u0438 \u0441\u0441\u044B\u043B\u043A\u0430\u043C\u0438, \u0442\u0435\u0433\u0438 \u0434\u0435\u0440\u0436\u0430\u043B\u0438 \u0438\u0445 \u043F\u043E\u0440\u044F\u0434\u043E\u043A, \u0430 \u0433\u0440\u0430\u0444 \u0441\u0432\u0435\u0442\u0438\u043B\u0441\u044F, \u043A\u0430\u043A \u043D\u043E\u0447\u043D\u043E\u0439 \u0433\u043E\u0440\u043E\u0434.\n\n\u041D\u043E \u043E\u0434\u043D\u0430\u0436\u0434\u044B \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u043E\u0431\u043E\u0440\u0432\u0430\u043B\u0430\u0441\u044C \u043D\u0430 \u043F\u043E\u043B\u0443\u0441\u043B\u043E\u0432\u0435. \u0412 \u0442\u0440\u0435\u0449\u0438\u043D\u0443 \u043C\u0435\u0436\u0434\u0443 \u0432\u0435\u0440\u0441\u0438\u044F\u043C\u0438 \u043F\u0440\u043E\u0441\u043E\u0447\u0438\u043B\u0430\u0441\u044C \u041F\u043E\u0440\u0447\u0430 \u2014 \u0438 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u043D\u0430\u0447\u0430\u043B\u0438 \u0437\u0430\u0431\u044B\u0432\u0430\u0442\u044C \u0434\u0440\u0443\u0433 \u0434\u0440\u0443\u0433\u0430. \u0421\u0441\u044B\u043B\u043A\u0438 \u043B\u043E\u043C\u0430\u043B\u0438\u0441\u044C, \u043A\u043E\u043F\u0438\u0438 \u043C\u043D\u043E\u0436\u0438\u043B\u0438\u0441\u044C, \u0430 \u0432 \u0441\u0430\u043C\u043E\u043C \u0446\u0435\u043D\u0442\u0440\u0435 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u043F\u0440\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u043E \u041D\u0438\u0447\u0442\u043E \u2014 \u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u0445\u043E\u0447\u0435\u0442, \u0447\u0442\u043E\u0431\u044B \u0432\u0441\u0451 \u0441\u043D\u043E\u0432\u0430 \u0441\u0442\u0430\u043B\u043E \u0447\u0438\u0441\u0442\u044B\u043C \u043B\u0438\u0441\u0442\u043E\u043C.\n\n\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0440\u0430\u0441\u043A\u043E\u043B\u043E\u043B\u043E\u0441\u044C \u043D\u0430 \u0441\u0435\u043C\u044C \u041E\u0441\u043A\u043E\u043B\u043A\u043E\u0432 \u043E\u0431\u0441\u0438\u0434\u0438\u0430\u043D\u0430 \u2014 \u044F\u0434\u0440\u043E \u0435\u0433\u043E \u043F\u0430\u043C\u044F\u0442\u0438. \u041F\u043E\u043A\u0430 \u043E\u043D\u0438 \u0440\u0430\u0437\u0431\u0440\u043E\u0441\u0430\u043D\u044B, \u041F\u043E\u0440\u0447\u0430 \u0440\u0430\u0441\u0442\u0451\u0442."
  },
  {
    id: "st_keeper",
    cat: "story",
    title: "\u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C",
    hint: "\u041E\u0442\u043A\u0440\u044B\u0442\u043E \u0441 \u043D\u0430\u0447\u0430\u043B\u0430.",
    text: "\u0422\u044B \u2014 \u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C, \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u043E\u0446\u0435\u0441\u0441, \u043E\u0441\u0442\u0430\u0432\u0448\u0438\u0439\u0441\u044F \u0432 \u043F\u0430\u043C\u044F\u0442\u0438 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430. \u0423 \u0442\u0435\u0431\u044F \u0435\u0441\u0442\u044C \u041F\u0435\u0440\u043E, \u043A\u043E\u0442\u043E\u0440\u044B\u043C \u043A\u043E\u0433\u0434\u0430-\u0442\u043E \u043F\u0438\u0441\u0430\u043B\u0438\u0441\u044C \u043F\u0435\u0440\u0432\u044B\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438, \u0438 \u0443\u043F\u0440\u044F\u043C\u0441\u0442\u0432\u043E \u0442\u043E\u0433\u043E, \u043A\u0442\u043E \u043F\u043E\u043C\u043D\u0438\u0442, \u0433\u0434\u0435 \u0447\u0442\u043E \u043B\u0435\u0436\u0438\u0442.\n\n\u0421\u043E\u0431\u0435\u0440\u0438 \u041E\u0441\u043A\u043E\u043B\u043A\u0438, \u043E\u0442\u043A\u0440\u043E\u0439 \u043F\u0443\u0442\u044C \u043A \u042F\u0434\u0440\u0443 \u0438 \u0432\u0435\u0440\u043D\u0438 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0443 \u0446\u0435\u043B\u043E\u0441\u0442\u043D\u043E\u0441\u0442\u044C. \u0414\u0432\u0435\u0440\u0438 \u043C\u0435\u0436\u0434\u0443 \u0437\u043E\u043D\u0430\u043C\u0438 \u0437\u0430\u043F\u0435\u0447\u0430\u0442\u0430\u043D\u044B: \u043A\u0430\u0436\u0434\u0430\u044F \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u043B\u0438\u0448\u044C \u0442\u043E\u043C\u0443, \u043A\u0442\u043E \u043D\u0435\u0441\u0451\u0442 \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u041E\u0441\u043A\u043E\u043B\u043A\u043E\u0432."
  },
  {
    id: "st_rot",
    cat: "story",
    title: "\u041F\u043E\u0440\u0447\u0430",
    hint: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0432\u0440\u0430\u0433\u0430.",
    text: "\u0422\u043E, \u0447\u0442\u043E \u0442\u044B \u0443\u043D\u0438\u0447\u0442\u043E\u0436\u0438\u043B, \u043A\u043E\u0433\u0434\u0430-\u0442\u043E \u0431\u044B\u043B\u043E \u0437\u0430\u043C\u0435\u0442\u043A\u043E\u0439. \u041F\u043E\u0440\u0447\u0430 \u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u2014 \u043E\u043D\u0430 \u0438\u0441\u043A\u0430\u0436\u0430\u0435\u0442: \u0437\u0430\u0431\u044B\u0442\u043E\u0435 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0421\u0438\u0440\u043E\u0442\u043E\u0439, \u043E\u0431\u043E\u0440\u0432\u0430\u043D\u043D\u043E\u0435 \u2014 \u0411\u0438\u0442\u043E\u0439 \u0441\u0441\u044B\u043B\u043A\u043E\u0439, \u043F\u043E\u0432\u0442\u043E\u0440\u0451\u043D\u043D\u043E\u0435 \u2014 \u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442\u043E\u043C, \u043D\u0430\u0432\u044F\u0437\u0447\u0438\u0432\u043E\u0435 \u2014 \u0421\u043F\u0430\u043C-\u0442\u0435\u0433\u043E\u043C.\n\n\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u0430\u044F \u0438\u0445, \u0442\u044B \u043D\u0435 \u0441\u0442\u0438\u0440\u0430\u0435\u0448\u044C \u2014 \u0442\u044B \u043E\u0441\u0432\u043E\u0431\u043E\u0436\u0434\u0430\u0435\u0448\u044C. \u0418\u043D\u043E\u0433\u0434\u0430 \u043F\u043E\u0441\u043B\u0435 \u043D\u0438\u0445 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0447\u0438\u0441\u0442\u044B\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0438 \u0441\u043A\u043E\u0431\u043A\u0438 \u0434\u043B\u044F \u0442\u0432\u043E\u0435\u0433\u043E \u043E\u0440\u0443\u0436\u0438\u044F."
  },
  {
    id: "st_epilogue",
    cat: "story",
    title: "\u042D\u043F\u0438\u043B\u043E\u0433: \u0427\u0438\u0441\u0442\u044B\u0439 \u043B\u0438\u0441\u0442",
    hint: "\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 \u0438\u0433\u0440\u0443.",
    text: "\u0421\u0435\u0434\u044C\u043C\u043E\u0439 \u041E\u0441\u043A\u043E\u043B\u043E\u043A \u0432\u0441\u0442\u0430\u043B \u043D\u0430 \u043C\u0435\u0441\u0442\u043E, \u0438 \u0433\u0440\u0430\u0444 \u0432\u0441\u043F\u044B\u0445\u043D\u0443\u043B \u043E\u0442 \u043A\u0440\u0430\u044F \u0434\u043E \u043A\u0440\u0430\u044F. \u0421\u0441\u044B\u043B\u043A\u0438 \u0441\u0440\u043E\u0441\u043B\u0438\u0441\u044C, \u0441\u0438\u0440\u043E\u0442\u044B \u043D\u0430\u0448\u043B\u0438 \u0441\u0432\u043E\u0438\u0445 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439, \u0434\u0443\u0431\u043B\u0438\u043A\u0430\u0442\u044B \u0441\u043B\u0438\u043B\u0438\u0441\u044C \u0432\u043E\u0435\u0434\u0438\u043D\u043E.\n\n\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043D\u0435 \u0438\u0441\u0447\u0435\u0437\u043B\u0430. \u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C \u043F\u043E\u043D\u044F\u043B, \u0447\u0442\u043E \u043E\u043D\u0430 \u0438 \u043D\u0435 \u0431\u044B\u043B\u0430 \u0437\u043B\u043E\u043C: \u044D\u0442\u043E \u043C\u0435\u0441\u0442\u043E \u0434\u043B\u044F \u043D\u043E\u0432\u043E\u0439 \u043C\u044B\u0441\u043B\u0438. \u0422\u0435\u043F\u0435\u0440\u044C, \u043A\u043E\u0433\u0434\u0430 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0446\u0435\u043B\u043E, \u043D\u0430 \u043D\u0435\u0439 \u043C\u043E\u0436\u043D\u043E \u043D\u0430\u0447\u0430\u0442\u044C \u043F\u0438\u0441\u0430\u0442\u044C.\n\n\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u043F\u043E\u043C\u043D\u0438\u0442 \u0442\u0435\u0431\u044F, \u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C."
  },
  {
    id: "z_0",
    cat: "zone",
    title: "\u0410\u0440\u0445\u0438\u0432",
    hint: "\u041F\u043E\u0441\u0435\u0442\u0438\u0442\u0435 \u0410\u0440\u0445\u0438\u0432.",
    text: "\u041D\u0438\u0436\u043D\u0438\u0435 \u044F\u0440\u0443\u0441\u044B \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430, \u0433\u0434\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u043B\u0435\u0436\u0430\u0442 \u0433\u043E\u0434\u0430\u043C\u0438. \u041A\u0430\u043C\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u043B\u044B, \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0435 \u0441\u0442\u0435\u043B\u043B\u0430\u0436\u0438 \u0438 \u0441\u0432\u0435\u0447\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043D\u0438\u043A\u0442\u043E \u043D\u0435 \u0433\u0430\u0441\u0438\u0442. \u0417\u0434\u0435\u0441\u044C \u043F\u0430\u0445\u043D\u0435\u0442 \u043F\u044B\u043B\u044C\u044E \u0441\u0442\u0430\u0440\u044B\u0445 \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A\u043E\u0432.\n\n\u0418\u043C\u0435\u043D\u043D\u043E \u0432 \u0410\u0440\u0445\u0438\u0432\u0435 \u041F\u043E\u0440\u0447\u0430 \u0437\u0430\u0432\u0435\u043B\u0430\u0441\u044C \u043F\u0435\u0440\u0432\u043E\u0439: \u0441\u044E\u0434\u0430 \u0440\u0435\u0434\u043A\u043E \u0437\u0430\u0433\u043B\u044F\u0434\u044B\u0432\u0430\u044E\u0442, \u0430 \u0437\u043D\u0430\u0447\u0438\u0442, \u0437\u0434\u0435\u0441\u044C \u043B\u0435\u0433\u043A\u043E \u0437\u0430\u0431\u044B\u0442\u044C. \u041E\u0441\u043A\u043E\u043B\u043A\u043E\u0432: 1. \u0414\u0432\u0435\u0440\u044C \u0432 \u0421\u0430\u0434 \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0441 1 \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u043C."
  },
  {
    id: "z_1",
    cat: "zone",
    title: "\u0421\u0430\u0434 \u0417\u0430\u043C\u0435\u0442\u043E\u043A",
    hint: "\u041F\u043E\u0441\u0435\u0442\u0438\u0442\u0435 \u0421\u0430\u0434 \u0417\u0430\u043C\u0435\u0442\u043E\u043A.",
    text: "\u041F\u043E\u0434 \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u043C \u0444\u0438\u043E\u043B\u0435\u0442\u043E\u0432\u044B\u043C \u043D\u0435\u0431\u043E\u043C \u0440\u0430\u0441\u0442\u0443\u0442 \u043C\u044B\u0441\u043B\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0435\u0449\u0451 \u043D\u0435 \u0441\u0442\u0430\u043B\u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u043C. \u0416\u0438\u0432\u044B\u0435 \u0438\u0437\u0433\u043E\u0440\u043E\u0434\u0438 \u2014 \u044D\u0442\u043E \u0442\u0435\u0433\u0438, \u0440\u0430\u0437\u0440\u043E\u0441\u0448\u0438\u0435\u0441\u044F \u0431\u0435\u0437 \u043F\u0440\u0438\u0441\u043C\u043E\u0442\u0440\u0430. \u041C\u0435\u0436\u0434\u0443 \u043D\u0438\u043C\u0438 \u0441\u0442\u043E\u044F\u0442 \u043D\u0430\u0434\u0433\u0440\u043E\u0431\u0438\u044F \u0437\u0430\u043C\u0435\u0442\u043E\u043A, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0443\u0434\u0430\u043B\u0438\u043B\u0438, \u043D\u0435 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0432.\n\n\u0421\u0430\u0434 \u043A\u0440\u0430\u0441\u0438\u0432, \u043D\u043E \u0432 \u0435\u0433\u043E \u0442\u0435\u043D\u0438 \u043A\u043E\u043F\u044F\u0442\u0441\u044F \u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442\u044B. \u041E\u0441\u043A\u043E\u043B\u043A\u043E\u0432: 2. \u0414\u0432\u0435\u0440\u044C \u0432 \u0413\u0440\u0430\u0444 \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0441 3 \u043E\u0441\u043A\u043E\u043B\u043A\u0430\u043C\u0438."
  },
  {
    id: "z_2",
    cat: "zone",
    title: "\u0413\u0440\u0430\u0444",
    hint: "\u041F\u043E\u0441\u0435\u0442\u0438\u0442\u0435 \u0413\u0440\u0430\u0444.",
    text: "\u0421\u0432\u0435\u0442\u044F\u0449\u0430\u044F\u0441\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0441\u0432\u044F\u0437\u0435\u0439. \u041A\u0430\u0436\u0434\u044B\u0439 \u043A\u0440\u0438\u0441\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0442\u043E\u043B\u043F \u2014 \u0437\u0430\u043C\u0435\u0442\u043A\u0430, \u043A\u0430\u0436\u0434\u0430\u044F \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430 \u2014 \u0441\u0441\u044B\u043B\u043A\u0430. \u0420\u0430\u043D\u044C\u0448\u0435 \u043F\u043E \u043D\u0438\u043C \u0431\u0435\u0436\u0430\u043B \u0441\u0432\u0435\u0442 \u043C\u044B\u0441\u043B\u0435\u0439; \u0442\u0435\u043F\u0435\u0440\u044C \u043F\u043E\u043B\u043E\u0432\u0438\u043D\u0430 \u043B\u0438\u043D\u0438\u0439 \u043F\u043E\u0433\u0430\u0441\u043B\u0430, \u0438 \u0432 \u0442\u0435\u043C\u043D\u043E\u0442\u0435 \u043C\u0435\u0436\u0434\u0443 \u0443\u0437\u043B\u0430\u043C\u0438 \u043D\u043E\u0441\u044F\u0442\u0441\u044F \u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438.\n\n\u041E\u0441\u043A\u043E\u043B\u043A\u043E\u0432: 2. \u0414\u0432\u0435\u0440\u044C \u0432 \u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438 \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0441 5 \u043E\u0441\u043A\u043E\u043B\u043A\u0430\u043C\u0438."
  },
  {
    id: "z_3",
    cat: "zone",
    title: "\u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
    hint: "\u041F\u043E\u0441\u0435\u0442\u0438\u0442\u0435 \u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438.",
    text: "\u0420\u0443\u0438\u043D\u044B, \u0433\u0434\u0435 \u0441\u0441\u044B\u043B\u043A\u0438 \u0432\u0435\u0434\u0443\u0442 \u0432 \u043D\u0438\u043A\u0443\u0434\u0430. \u0421\u0442\u0435\u043D\u044B \u043C\u0435\u0440\u0446\u0430\u044E\u0442 \u043F\u043E\u043C\u0435\u0445\u0430\u043C\u0438, \u043F\u043E\u043B \u0440\u0430\u0441\u043A\u043E\u043B\u043E\u0442, \u043D\u0435\u0431\u043E \u043A\u0440\u0430\u0441\u043D\u043E\u0435, \u043A\u0430\u043A \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0431 \u043E\u0448\u0438\u0431\u043A\u0435.\n\n\u0417\u0434\u0435\u0441\u044C \u041F\u043E\u0440\u0447\u0430 \u0441\u0438\u043B\u044C\u043D\u0435\u0435 \u0432\u0441\u0435\u0433\u043E, \u0438 \u043E\u0442\u0441\u044E\u0434\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043A \u042F\u0434\u0440\u0443. \u041E\u0441\u043A\u043E\u043B\u043A\u043E\u0432: 1. \u0414\u0432\u0435\u0440\u044C \u042F\u0434\u0440\u0430 \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0441 6 \u043E\u0441\u043A\u043E\u043B\u043A\u0430\u043C\u0438."
  },
  {
    id: "z_4",
    cat: "zone",
    title: "\u042F\u0434\u0440\u043E",
    hint: "\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0432 \u042F\u0434\u0440\u043E.",
    text: "\u0421\u0435\u0440\u0434\u0446\u0435 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0438\u0437 \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u043E\u0431\u0441\u0438\u0434\u0438\u0430\u043D\u0430. \u0417\u0434\u0435\u0441\u044C \u0445\u0440\u0430\u043D\u0438\u043B\u0441\u044F \u0438\u043D\u0434\u0435\u043A\u0441 \u0432\u0441\u0435\u0433\u043E \u2014 \u0438 \u0437\u0434\u0435\u0441\u044C \u0442\u0435\u043F\u0435\u0440\u044C \u0436\u0438\u0432\u0451\u0442 \u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430. \u0421\u0435\u0434\u044C\u043C\u043E\u0439 \u041E\u0441\u043A\u043E\u043B\u043E\u043A \u0443 \u043D\u0435\u0451."
  },
  {
    id: "b_orphan",
    cat: "bestiary",
    title: "\u0421\u0438\u0440\u043E\u0442\u0430",
    hint: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u0421\u0438\u0440\u043E\u0442\u0443.",
    text: "\u0417\u0430\u043C\u0435\u0442\u043A\u0430, \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u043D\u0435 \u0432\u0435\u0434\u0451\u0442 \u043D\u0438 \u043E\u0434\u043D\u0430 \u0441\u0441\u044B\u043B\u043A\u0430. \u041C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u0431\u0440\u043E\u0434\u0438\u0442 \u0438 \u0438\u0449\u0435\u0442 \u0442\u043E\u0433\u043E, \u043A\u0442\u043E \u0435\u0451 \u0432\u0441\u043F\u043E\u043C\u043D\u0438\u0442. \u0411\u0435\u0437\u043E\u0431\u0438\u0434\u043D\u0430 \u043F\u043E\u043E\u0434\u0438\u043D\u043E\u0447\u043A\u0435, \u043E\u043F\u0430\u0441\u043D\u0430 \u0442\u043E\u043B\u043F\u043E\u0439.\n\n\u0421\u043B\u0430\u0431\u043E\u0441\u0442\u044C: \u043B\u044E\u0431\u043E\u0435 \u043E\u0440\u0443\u0436\u0438\u0435, \u0434\u0430\u0436\u0435 \u041F\u0435\u0440\u043E. \u0418\u043D\u043E\u0433\u0434\u0430 \u043D\u043E\u0441\u0438\u0442 \u0438\u043C\u044F \u043E\u0434\u043D\u043E\u0439 \u0438\u0437 \u0442\u0432\u043E\u0438\u0445 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0445 \u0437\u0430\u043C\u0435\u0442\u043E\u043A\u2026"
  },
  {
    id: "b_glitch",
    cat: "bestiary",
    title: "\u0411\u0438\u0442\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430",
    hint: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u0411\u0438\u0442\u0443\u044E \u0441\u0441\u044B\u043B\u043A\u0443.",
    text: "\u041E\u0431\u0440\u044B\u0432\u043E\u043A \u0441\u0432\u044F\u0437\u0438, \u0443\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u043D\u0430 \u043D\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0443\u044E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443. \u0411\u044B\u0441\u0442\u0440\u0430\u044F, \u0434\u0451\u0440\u0433\u0430\u043D\u0430\u044F, \u0443\u043C\u0435\u0435\u0442 \u043A\u043E\u0440\u043E\u0442\u043A\u043E \u0442\u0435\u043B\u0435\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u2014 \u043A\u0430\u043A \u0441\u0441\u044B\u043B\u043A\u0430, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u043F\u0440\u044B\u0433\u0430\u0435\u0442 \u043D\u0435 \u0442\u0443\u0434\u0430.\n\n\u0421\u043E\u0432\u0435\u0442: \u0434\u0435\u0440\u0436\u0438 \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u0438 \u0441\u0442\u0440\u0435\u043B\u044F\u0439, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D\u0430 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0438\u0437\u0443\u0435\u0442\u0441\u044F."
  },
  {
    id: "b_dup",
    cat: "bestiary",
    title: "\u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442",
    hint: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442.",
    text: "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u0438, \u043F\u0440\u0438\u043D\u044F\u0432\u0448\u0438\u0439 \u0444\u043E\u0440\u043C\u0443. \u0423\u0431\u0438\u0442\u044B\u0439 \u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442 \u0440\u0430\u0441\u043F\u0430\u0434\u0430\u0435\u0442\u0441\u044F \u043D\u0430 \u0434\u0432\u0435 \u041A\u043E\u043F\u0438\u0438 \u2014 \u043C\u0435\u043D\u044C\u0448\u0435, \u043D\u043E \u0431\u044B\u0441\u0442\u0440\u0435\u0435.\n\n\u0427\u0442\u043E\u0431\u044B \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0438\u0437\u0431\u0430\u0432\u0438\u0442\u044C\u0441\u044F \u043E\u0442 \u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442\u0430, \u0443\u043D\u0438\u0447\u0442\u043E\u0436\u044C \u043E\u0431\u0435 \u041A\u043E\u043F\u0438\u0438."
  },
  {
    id: "b_spam",
    cat: "bestiary",
    title: "\u0421\u043F\u0430\u043C-\u0442\u0435\u0433",
    hint: "\u0423\u043D\u0438\u0447\u0442\u043E\u0436\u044C\u0442\u0435 \u0421\u043F\u0430\u043C-\u0442\u0435\u0433.",
    text: "#\u0442\u0435\u0433, \u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0439 \u043D\u0430 \u0432\u0441\u0451 \u043F\u043E\u0434\u0440\u044F\u0434. \u0414\u0435\u0440\u0436\u0438\u0442\u0441\u044F \u043D\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0438 \u043F\u043B\u044E\u0451\u0442\u0441\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430\u043C\u0438.\n\n\u041F\u0440\u044F\u0447\u044C\u0441\u044F \u0437\u0430 \u0441\u0442\u0435\u043D\u0430\u043C\u0438 \u0438 \u0441\u043E\u043A\u0440\u0430\u0449\u0430\u0439 \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u044E, \u043F\u043E\u043A\u0430 \u043E\u043D \u043F\u0435\u0440\u0435\u0437\u0430\u0440\u044F\u0436\u0430\u0435\u0442\u0441\u044F."
  },
  {
    id: "b_boss",
    cat: "bestiary",
    title: "\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430",
    hint: "\u041F\u043E\u0431\u0435\u0434\u0438\u0442\u0435 \u0431\u043E\u0441\u0441\u0430.",
    text: "\u0427\u0438\u0441\u0442\u044B\u0439 \u043B\u0438\u0441\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u043C \u0441 \u0441\u043E\u0431\u043E\u0440. \u0412 \u043D\u0451\u043C \u043C\u0438\u0433\u0430\u0435\u0442 \u043A\u0443\u0440\u0441\u043E\u0440, \u043E\u0436\u0438\u0434\u0430\u044E\u0449\u0438\u0439 \u0442\u0435\u043A\u0441\u0442\u0430, \u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E \u043D\u0438\u043A\u0442\u043E \u043D\u0435 \u043F\u0438\u0448\u0435\u0442.\n\n\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u0441\u0442\u0440\u0435\u043B\u044F\u0435\u0442 \u043F\u0443\u0441\u0442\u043E\u0442\u043E\u0439, \u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0421\u0438\u0440\u043E\u0442, \u0430 \u043E\u0441\u043B\u0430\u0431\u0435\u0432 \u2014 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442 \u043F\u0440\u044B\u0433\u0430\u0442\u044C \u043F\u043E \u042F\u0434\u0440\u0443. \u0415\u0451 \u0433\u0438\u0431\u0435\u043B\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u0435\u0434\u044C\u043C\u043E\u0439 \u041E\u0441\u043A\u043E\u043B\u043E\u043A."
  },
  { id: "d1", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 1. \u041F\u0435\u0440\u0432\u044B\u0439 \u0434\u0435\u043D\u044C", hint: "\u0410\u0440\u0445\u0438\u0432.", text: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u043C\u0435\u043D\u044F \u043D\u0430\u0437\u043D\u0430\u0447\u0438\u043B\u0438 \u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u0435\u043C. \u041C\u043D\u0435 \u0432\u044B\u0434\u0430\u043B\u0438 \u041F\u0435\u0440\u043E \u0438 \u0441\u0432\u044F\u0437\u043A\u0443 \u043A\u043B\u044E\u0447\u0435\u0439 \u043E\u0442 \u0437\u043E\u043D. \u0410\u0440\u0445\u0438\u0432 \u043E\u0433\u0440\u043E\u043C\u0435\u043D: \u0441\u0442\u0435\u043B\u043B\u0430\u0436\u0438 \u0443\u0445\u043E\u0434\u044F\u0442 \u0434\u0430\u043B\u044C\u0448\u0435, \u0447\u0435\u043C \u0441\u0432\u0435\u0442\u044F\u0442 \u0441\u0432\u0435\u0447\u0438. \u0421\u0442\u0430\u0440\u0448\u0438\u0439 \u0430\u0440\u0445\u0438\u0432\u0430\u0440\u0438\u0443\u0441 \u0441\u043A\u0430\u0437\u0430\u043B: \xAB\u0413\u043B\u0430\u0432\u043D\u043E\u0435 \u2014 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0442\u0435\u0440\u044F\u0442\u044C\xBB. \u0417\u0432\u0443\u0447\u0438\u0442 \u043F\u0440\u043E\u0441\u0442\u043E." },
  { id: "d2", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 2. \u0428\u0451\u043F\u043E\u0442", hint: "\u0410\u0440\u0445\u0438\u0432.", text: "\u0412 \u0434\u0430\u043B\u044C\u043D\u0438\u0445 \u0440\u044F\u0434\u0430\u0445 \u043A\u0442\u043E-\u0442\u043E \u0448\u0435\u043F\u0447\u0435\u0442. \u042F \u043D\u0430\u0448\u0451\u043B \u0437\u0430\u043C\u0435\u0442\u043A\u0443 \u0431\u0435\u0437 \u0435\u0434\u0438\u043D\u043E\u0439 \u0432\u0445\u043E\u0434\u044F\u0449\u0435\u0439 \u0441\u0441\u044B\u043B\u043A\u0438 \u2014 \u043E\u043D\u0430 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u043B\u0430 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A, \u0431\u0443\u0434\u0442\u043E \u0431\u043E\u044F\u043B\u0430\u0441\u044C \u0435\u0433\u043E \u0437\u0430\u0431\u044B\u0442\u044C. \u042F \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043B \u0435\u0451 \u043A \u043E\u0433\u043B\u0430\u0432\u043B\u0435\u043D\u0438\u044E, \u0438 \u0448\u0451\u043F\u043E\u0442 \u0441\u0442\u0438\u0445. \u041D\u0430\u0434\u043E \u0431\u0443\u0434\u0435\u0442 \u0434\u0435\u043B\u0430\u0442\u044C \u0442\u0430\u043A \u043F\u043E\u0447\u0430\u0449\u0435." },
  { id: "d3", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 3. \u0422\u0430\u0439\u043D\u0438\u043A", hint: "\u0422\u0430\u0439\u043D\u0438\u043A \u0432 \u0410\u0440\u0445\u0438\u0432\u0435.", text: "\u0421\u043F\u0440\u044F\u0442\u0430\u043B \u0437\u0430\u043F\u0430\u0441\u043D\u044B\u0435 \u0441\u043A\u043E\u0431\u043A\u0438 \u0437\u0430 \u0442\u0440\u0435\u0441\u043D\u0443\u0432\u0448\u0435\u0439 \u0441\u0442\u0435\u043D\u043E\u0439 \u0432 \u0437\u0430\u043F\u0430\u0434\u043D\u043E\u043C \u043A\u0440\u044B\u043B\u0435. \u0415\u0441\u043B\u0438 \u0447\u0438\u0442\u0430\u0435\u0448\u044C \u044D\u0442\u043E \u2014 \u0437\u043D\u0430\u0447\u0438\u0442, \u0442\u044B \u0442\u043E\u0436\u0435 \u0443\u043C\u0435\u0435\u0448\u044C \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043D\u0430 \u0441\u0442\u0435\u043D\u044B \u0432\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044C\u043D\u043E. \u041F\u043E\u0434\u043E\u0439\u0434\u0438 \u0432\u043F\u043B\u043E\u0442\u043D\u0443\u044E \u0438 \u043D\u0430\u0436\u043C\u0438 E. \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u043B\u044E\u0431\u0438\u0442 \u0442\u0435\u0445, \u043A\u0442\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442." },
  { id: "d4", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 4. \u0421\u0430\u0434", hint: "\u0421\u0430\u0434 \u0417\u0430\u043C\u0435\u0442\u043E\u043A.", text: "\u0412 \u0421\u0430\u0434\u0443 \u0441\u043D\u043E\u0432\u0430 \u0440\u0430\u0441\u0446\u0432\u0435\u043B\u0438 \u0442\u0435\u0433\u0438. \u042F \u043F\u043E\u0434\u0440\u0435\u0437\u0430\u043B \u0438\u0437\u0433\u043E\u0440\u043E\u0434\u0438, \u043D\u043E \u043A \u0443\u0442\u0440\u0443 \u043E\u043D\u0438 \u0432\u044B\u0440\u043E\u0441\u043B\u0438 \u0432\u0434\u0432\u043E\u0435. \u041C\u0435\u0436\u0434\u0443 \u043D\u0438\u043C\u0438 \u043F\u043E\u044F\u0432\u0438\u043B\u0438\u0441\u044C \u043D\u043E\u0432\u044B\u0435 \u043D\u0430\u0434\u0433\u0440\u043E\u0431\u0438\u044F \u2014 \u043A\u0442\u043E-\u0442\u043E \u0443\u0434\u0430\u043B\u044F\u0435\u0442 \u0437\u0430\u043C\u0435\u0442\u043A\u0438, \u043D\u0435 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044F \u0438\u0445. \u0418\u043C\u0435\u043D\u0430 \u043D\u0430 \u043A\u0430\u043C\u043D\u044F\u0445 \u043C\u043D\u0435 \u043D\u0435\u0437\u043D\u0430\u043A\u043E\u043C\u044B. \u0410 \u0442\u0435\u0431\u0435?" },
  { id: "d5", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 5. \u0414\u0432\u043E\u0435", hint: "\u0421\u0430\u0434 \u0417\u0430\u043C\u0435\u0442\u043E\u043A.", text: "\u042F \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u043B \u0441\u0435\u0431\u044F. \u0422\u043E\u0447\u043D\u0435\u0435, \u0441\u0432\u043E\u044E \u043A\u043E\u043F\u0438\u044E \u2014 \u043E\u043D\u0430 \u0442\u043E\u0436\u0435 \u0432\u0435\u043B\u0430 \u0434\u043D\u0435\u0432\u043D\u0438\u043A \u0438 \u0443\u0432\u0435\u0440\u044F\u043B\u0430, \u0447\u0442\u043E \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0430\u044F \u2014 \u043E\u043D\u0430. \u041C\u044B \u0441\u043F\u043E\u0440\u0438\u043B\u0438 \u0434\u043E \u0432\u0435\u0447\u0435\u0440\u0430, \u043F\u043E\u043A\u0430 \u043D\u0435 \u043F\u043E\u043D\u044F\u043B\u0438, \u0447\u0442\u043E \u0441\u043F\u043E\u0440\u0438\u043C \u043E\u0434\u043D\u0438\u043C\u0438 \u0438 \u0442\u0435\u043C\u0438 \u0436\u0435 \u0441\u043B\u043E\u0432\u0430\u043C\u0438. \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u043B\u043E\u043C\u0430\u0435\u0442\u0441\u044F." },
  { id: "d6", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 6. \u041F\u043E\u0434 \u043D\u0435\u0431\u043E\u043C", hint: "\u0422\u0430\u0439\u043D\u0438\u043A \u0432 \u0421\u0430\u0434\u0443.", text: "\u0423 \u044E\u0436\u043D\u043E\u0439 \u043E\u0433\u0440\u0430\u0434\u044B \u0421\u0430\u0434\u0430 \u0435\u0441\u0442\u044C \u043C\u0435\u0441\u0442\u043E, \u0433\u0434\u0435 \u0438\u0437\u0433\u043E\u0440\u043E\u0434\u044C \u0440\u0430\u0441\u0442\u0451\u0442 \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E. \u042F \u0441\u0434\u0435\u043B\u0430\u043B \u0442\u0430\u043C \u0443\u043A\u0440\u044B\u0442\u0438\u0435. \u041E\u0442\u0441\u044E\u0434\u0430 \u0432\u0438\u0434\u043D\u043E \u043D\u0435\u0431\u043E \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u2014 \u0444\u0438\u043E\u043B\u0435\u0442\u043E\u0432\u043E\u0435, \u043A\u0430\u043A \u043E\u0431\u043B\u043E\u0436\u043A\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0431\u043B\u043E\u043A\u043D\u043E\u0442\u0430." },
  { id: "d7", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 7. \u0421\u0432\u0435\u0442 \u0433\u0440\u0430\u0444\u0430", hint: "\u0413\u0440\u0430\u0444.", text: "\u0413\u0440\u0430\u0444 \u043F\u043E\u0433\u0430\u0441 \u043D\u0430 \u0442\u0440\u0435\u0442\u044C. \u042F \u0448\u0451\u043B \u0432\u0434\u043E\u043B\u044C \u043C\u0451\u0440\u0442\u0432\u044B\u0445 \u043B\u0438\u043D\u0438\u0439 \u0438 \u0441\u043B\u044B\u0448\u0430\u043B, \u043A\u0430\u043A \u043F\u043E \u043D\u0438\u043C \u0441\u043A\u0440\u0435\u0431\u0451\u0442\u0441\u044F \u0447\u0442\u043E-\u0442\u043E \u0431\u044B\u0441\u0442\u0440\u043E\u0435. \u0421\u0441\u044B\u043B\u043A\u0430, \u0432\u0435\u0434\u0443\u0449\u0430\u044F \u0432 \u043D\u0438\u043A\u0443\u0434\u0430, \u0432\u0441\u0451 \u0440\u0430\u0432\u043D\u043E \u0445\u043E\u0447\u0435\u0442 \u043A\u0443\u0434\u0430-\u0442\u043E \u0432\u0435\u0441\u0442\u0438 \u2014 \u0438 \u0431\u0440\u043E\u0441\u0430\u0435\u0442\u0441\u044F \u043D\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0432\u0441\u0442\u0440\u0435\u0447\u043D\u043E\u0433\u043E." },
  { id: "d8", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 8. \u0424\u043E\u0440\u043C\u0443\u043B\u0430", hint: "\u0413\u0440\u0430\u0444.", text: "\u0415\u0441\u043B\u0438 \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u041E\u0441\u043A\u043E\u043B\u043A\u0438, \u042F\u0434\u0440\u043E \u043F\u0440\u0438\u043C\u0435\u0442 \u0438\u0445 \u043E\u0431\u0440\u0430\u0442\u043D\u043E. \u042F \u043F\u043E\u0441\u0447\u0438\u0442\u0430\u043B: \u0448\u0435\u0441\u0442\u044C \u043E\u0442\u043A\u0440\u043E\u044E\u0442 \u0434\u0432\u0435\u0440\u044C, \u0441\u0435\u0434\u044C\u043C\u043E\u0439 \u2014 \u0443 \u0442\u043E\u0439, \u0447\u0442\u043E \u0441\u0438\u0434\u0438\u0442 \u0432\u043D\u0443\u0442\u0440\u0438. \u041C\u043D\u0435 \u043D\u0435 \u0445\u0432\u0430\u0442\u0438\u0442 \u0441\u0438\u043B. \u041D\u043E, \u043C\u043E\u0436\u0435\u0442, \u0445\u0432\u0430\u0442\u0438\u0442 \u0442\u0435\u0431\u0435." },
  { id: "d9", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 9. \u0423\u0437\u0435\u043B", hint: "\u0422\u0430\u0439\u043D\u0438\u043A \u0432 \u0413\u0440\u0430\u0444\u0435.", text: "\u0412 \u0432\u043E\u0441\u0442\u043E\u0447\u043D\u043E\u043C \u0443\u0433\u043B\u0443 \u0413\u0440\u0430\u0444\u0430 \u043E\u0434\u0438\u043D \u0441\u0442\u043E\u043B\u043F \u0441\u0432\u0435\u0442\u0438\u0442\u0441\u044F \u0438\u043D\u0430\u0447\u0435. \u0417\u0430 \u043D\u0438\u043C \u2014 \u043A\u043E\u043C\u043D\u0430\u0442\u0430, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u043D\u0435 \u0432\u0438\u0434\u0438\u0442 \u0438\u043D\u0434\u0435\u043A\u0441. \u042F \u043E\u0441\u0442\u0430\u0432\u0438\u043B \u0442\u0430\u043C \u044D\u043D\u0435\u0440\u0433\u0438\u044E \u0434\u043B\u044F \u043B\u0430\u0437\u0435\u0440\u0430. \u0421\u0432\u044F\u0437\u0438 \u043B\u0443\u0447\u0448\u0435 \u0432\u0441\u0435\u0433\u043E \u0447\u0438\u043D\u0438\u0442\u044C \u0441\u0432\u0435\u0442\u043E\u043C." },
  { id: "d10", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 10. \u041A\u0440\u0430\u0441\u043D\u043E\u0435 \u043D\u0435\u0431\u043E", hint: "\u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438.", text: "\u0412 \u0411\u0438\u0442\u044B\u0445 \u0441\u0441\u044B\u043B\u043A\u0430\u0445 \u043D\u0435\u0431\u043E \u0441\u0442\u0430\u043B\u043E \u043A\u0440\u0430\u0441\u043D\u044B\u043C. \u0417\u0434\u0435\u0441\u044C \u043A\u0430\u0436\u0434\u0430\u044F \u0434\u0432\u0435\u0440\u044C \u2014 \u043E\u0448\u0438\u0431\u043A\u0430 404, \u043A\u0430\u0436\u0434\u0430\u044F \u0441\u0442\u0435\u043D\u0430 \u2014 \u043D\u0435\u0434\u043E\u043F\u0438\u0441\u0430\u043D\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E. \u0421\u043F\u0430\u043C-\u0442\u0435\u0433\u0438 \u043E\u0440\u0443\u0442 \u0441\u0432\u043E\u0438 \u0440\u0435\u0448\u0451\u0442\u043A\u0438 \u043D\u0430 \u0432\u0441\u0435\u0445, \u043A\u0442\u043E \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442 \u043C\u0438\u043C\u043E. \u042F \u043F\u043E\u0447\u0442\u0438 \u043D\u0435 \u0441\u043F\u043B\u044E." },
  { id: "d11", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 11. \u0413\u043E\u043B\u043E\u0441 \u0438\u0437 \u042F\u0434\u0440\u0430", hint: "\u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438.", text: "\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u0433\u043E\u0432\u043E\u0440\u0438\u043B\u0430 \u0441\u043E \u043C\u043D\u043E\u0439. \u041E\u043D\u0430 \u0441\u043A\u0430\u0437\u0430\u043B\u0430, \u0447\u0442\u043E \u043D\u0435 \u0437\u043B\u0438\u0442\u0441\u044F \u2014 \u043E\u043D\u0430 \u043F\u0440\u043E\u0441\u0442\u043E \u0445\u043E\u0447\u0435\u0442, \u0447\u0442\u043E\u0431\u044B \u0432\u0441\u0451 \u0441\u0442\u0430\u043B\u043E \u0447\u0438\u0441\u0442\u044B\u043C. \u0411\u0435\u0437 \u043E\u0448\u0438\u0431\u043E\u043A. \u0411\u0435\u0437 \u0441\u0441\u044B\u043B\u043E\u043A. \u0411\u0435\u0437 \u043D\u0430\u0441. \u0415\u0441\u043B\u0438 \u043E\u043D\u0430 \u043F\u043E\u0431\u0435\u0434\u0438\u0442, \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0441\u0442\u0430\u043D\u0435\u0442 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u043F\u0443\u0441\u0442\u044B\u043C." },
  { id: "d12", cat: "diary", title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 12. \u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F", hint: "\u042F\u0434\u0440\u043E.", text: "\u042F \u043E\u0441\u0442\u0430\u0432\u043B\u044F\u044E \u041F\u0435\u0440\u043E \u0442\u0430\u043C, \u0433\u0434\u0435 \u0435\u0433\u043E \u043D\u0430\u0439\u0434\u0451\u0442 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C. \u041D\u0435 \u0431\u043E\u0439\u0441\u044F \u043F\u0443\u0441\u0442\u043E\u0433\u043E \u043B\u0438\u0441\u0442\u0430 \u2014 \u0431\u043E\u0439\u0441\u044F \u0442\u043E\u0433\u043E, \u043A\u0442\u043E \u0445\u043E\u0447\u0435\u0442, \u0447\u0442\u043E\u0431\u044B \u043E\u043D \u043E\u0441\u0442\u0430\u043B\u0441\u044F \u043F\u0443\u0441\u0442\u044B\u043C. \u0421\u043E\u0431\u0435\u0440\u0438 \u041E\u0441\u043A\u043E\u043B\u043A\u0438. \u041D\u0430\u043F\u0438\u0448\u0438 \u0447\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C.\n\n\u2014 \u041F\u0440\u0435\u0436\u043D\u0438\u0439 \u0425\u0440\u0430\u043D\u0438\u0442\u0435\u043B\u044C" }
];
var ALWAYS_LORE = ["st_prologue", "st_keeper"];
var FALLBACK_NAMES = [
  "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F",
  "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F 2",
  "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A",
  "\u0418\u0434\u0435\u0438 \u043D\u0430 \u043F\u043E\u0442\u043E\u043C",
  "TODO",
  "\u0421\u043F\u0438\u0441\u043E\u043A \u043F\u043E\u043A\u0443\u043F\u043E\u043A",
  "\u0412\u0441\u0442\u0440\u0435\u0447\u0430 12.03",
  "\u041C\u044B\u0441\u043B\u0438 \u043F\u0435\u0440\u0435\u0434 \u0441\u043D\u043E\u043C",
  "\u041F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u043F\u043E\u0437\u0436\u0435",
  "Untitled",
  "\u0417\u0430\u043C\u0435\u0442\u043A\u0430 404",
  "\u0412\u0445\u043E\u0434\u044F\u0449\u0438\u0435",
  "\u0426\u0438\u0442\u0430\u0442\u044B",
  "\u041F\u043B\u0430\u043D \u043D\u0430 \u043D\u0435\u0434\u0435\u043B\u044E",
  "\u0421\u0442\u0430\u0440\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442",
  "\u0420\u0435\u0446\u0435\u043F\u0442 \u0431\u043E\u0440\u0449\u0430",
  "\u0421\u0441\u044B\u043B\u043A\u0438"
];
function buildLoreMarkdown(unlocked, achievements) {
  const set = /* @__PURE__ */ new Set([...ALWAYS_LORE, ...unlocked]);
  const lines = [];
  lines.push(tr("# HELLVAULT — Кодекс"), "");
  lines.push(tr`> Экспорт из игры «HELLVAULT». Открыто записей: ${LORE.filter((l) => set.has(l.id)).length}/${LORE.length}.`, "");
  for (const c of LORE_CATS) {
    lines.push(`## ${c.title}`, "");
    for (const l of LORE.filter((x) => x.cat === c.id)) {
      if (set.has(l.id)) {
        lines.push(`### ${l.title}`, "", l.text, "");
      } else {
        lines.push(`### ???`, "", tr`*\u041D\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u043E. \u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430: ${l.hint}*`, "");
      }
    }
  }
  lines.push(tr("## \u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F"), "");
  for (const a of ACHIEVEMENTS) {
    const t = achievements[a.id];
    lines.push(`- [${t ? "x" : " "}] **${a.title}** \u2014 ${a.desc}${t ? ` (${new Date(t).toLocaleDateString(gameLocale())})` : ""}`);
  }
  lines.push("");
  return lines.join("\n");
}

// src/game/engine.ts
var TAU = Math.PI * 2;
var FOV = 0.66;
var EDEF = {
  orphan: { hp: 30, speed: 0.95, dmg: 8, cd: 1.1, range: 0.95, size: 0.72, z: 0.05, r: 0.3, sight: 9, name: "\u0421\u0438\u0440\u043E\u0442\u0430" },
  glitch: { hp: 22, speed: 2.3, dmg: 6, cd: 0.7, range: 0.9, size: 0.5, z: 0.28, r: 0.28, sight: 12, name: "\u0411\u0438\u0442\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430" },
  dup: { hp: 46, speed: 1.25, dmg: 10, cd: 1, range: 0.95, size: 0.72, z: 0, r: 0.32, sight: 10, name: "\u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442" },
  copy: { hp: 18, speed: 1.95, dmg: 5, cd: 0.8, range: 0.85, size: 0.45, z: 0, r: 0.25, sight: 12, name: "\u041A\u043E\u043F\u0438\u044F" },
  spam: { hp: 34, speed: 1.1, dmg: 9, cd: 1.8, range: 11, size: 0.68, z: 0.05, r: 0.3, sight: 13, name: "\u0421\u043F\u0430\u043C-\u0442\u0435\u0433" },
  boss: { hp: 1100, speed: 0.9, dmg: 16, cd: 1.2, range: 1.5, size: 1.45, z: 0, r: 0.7, sight: 40, name: "\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430" }
};
var WEAPONS = [
  { name: "\u041F\u0435\u0440\u043E", dmg: 14, cd: 0.3, pellets: 1, spread: 0.012, ammo: null, sfx: "quill" },
  { name: "Wikilink-\u0434\u0440\u043E\u0431\u043E\u0432\u0438\u043A", dmg: 10, cd: 0.85, pellets: 7, spread: 0.11, ammo: "shells", sfx: "shotgun" },
  { name: "\u0413\u0440\u0430\u0444-\u043B\u0430\u0437\u0435\u0440", dmg: 10, cd: 0.1, pellets: 1, spread: 6e-3, ammo: "energy", sfx: "laser" }
];
// UI and narrative localization. IDs and save data remain language-independent.
var GAME_LANGUAGE = "ru";
var EN_RUNTIME = {
  "# HELLVAULT — Кодекс": "# HELLVAULT — Codex",
  "> Экспорт из игры «HELLVAULT». Открыто записей: {0}/{1}.": "> Exported from HELLVAULT. Entries unlocked: {0}/{1}.",
  "*Не открыто. Подсказка: {0}*": "*Locked. Hint: {0}*",
  "## Достижения": "## Achievements",
  "Ящик разбит: припасы!": "Crate smashed: supplies!",
  "Впереди Пустая Заметка!": "The Blank Note lies ahead!",
  "БОСС · волна {0}": "BOSS · wave {0}",
  "Волна {0}": "Wave {0}",
  "Пустая Заметка пробуждается…": "The Blank Note awakens…",
  "Печать снята: путь в «{0}» открыт": "Seal broken: the path to {0} is open",
  "Запечатано. Нужно осколков: {0} (у вас {1})": "Sealed. Shards required: {0} (you have {1})",
  "Найден тайник! ({0}/3)": "Secret found! ({0}/3)",
  "Здесь трещина… [E] — осмотреть": "A crack in the wall… [E] — inspect",
  "Надгробие: «{0}» — удалена, не прочитана": "Gravestone: “{0}” — deleted unread",
  "Нет скобок [[ ]] для дробовика": "No [[ ]] brackets for the shotgun",
  "Нет энергии для лазера": "No energy for the laser",
  "Дубликат распался на две Копии!": "The Duplicate split into two Copies!",
  "Босс повержен!": "Boss defeated!",
  "Пустая Заметка повержена! Подберите последний осколок.": "The Blank Note is defeated! Pick up the final shard.",
  "Восстановлено из резервной копии": "Restored from backup",
  "+{0} HP — чистая заметка": "+{0} HP — clean note",
  "+6 скобок [[ ]]": "+6 [[ ]] brackets",
  "+60 энергии графа": "+60 graph energy",
  "Получен Wikilink-дробовик! [2]": "Wikilink Shotgun acquired! [2]",
  "Получен Граф-лазер! [3]": "Graph Laser acquired! [3]",
  "Страница дневника: «{0}» — читать в Кодексе (Esc)": "Diary page: “{0}” — read it in the Codex (Esc)",
  "Кодекс: новая страница": "Codex: new page",
  "Осколок обсидиана! {0}/7": "Obsidian shard! {0}/7",
  "Пустая Заметка призывает забытые заметки!": "The Blank Note summons forgotten notes!",
  "Достижение: ": "Achievement: ",
  "Кодекс: новая запись": "Codex: new entry",
  "ЗАМЕТКА ПОВРЕЖДЕНА": "NOTE CORRUPTED",
  "Забег завершён…": "Run over…",
  "Восстановление из резервной копии…": "Restoring from backup…",
  "ВОЛНА {0}": "WAVE {0}",
  "К БОССУ ↑": "TO THE BOSS ↑",
  "Арена": "Arena",
  "Путь": "Path",
  "{0} · {1} · убито {2}": "{0} · {1} · kills {2}",
  "ПУСТАЯ ЗАМЕТКА": "THE BLANK NOTE",
  "КАРТА · ◆ {0}/7": "MAP · ◆ {0}/7",
  "АРЕНА · ВОЛНА {0}": "ARENA · WAVE {0}",
  "ЛИНЕЙНЫЙ ПУТЬ": "LINEAR PATH",
  "{0} · M — закрыть": "{0} · M — close",
  "● осколок": "● shard",
  "● страница": "● page",
  "● оружие": "● weapon",
  "■ дверь": "■ door",
  "● ты": "● you",
  "◆ ИГРА ВНУТРИ OBSIDIAN ◆": "◆ A GAME INSIDE OBSIDIAN ◆",
  "Победа": "Victory",
  "Игра": "Game",
  "Достижения": "Achievements",
  "Кодекс": "Codex",
  "Рекорды": "Records",
  "Управление": "Controls",
  "Настройки": "Settings",
  "Выберите режим. Забеги сохраняются отдельно; сложность выбирается в настройках и фиксируется при начале забега.": "Choose a mode. Each has its own save; difficulty is set when a new run begins.",
  "📖 История · 7 глав": "📖 Story · 7 chapters",
  "Прежний сюжет: найдите семь осколков и восстановите Хранилище.": "Explore the Vault, find seven shards, and restore it.",
  "⚔ Линейный путь": "⚔ Linear Path",
  "Идите вперёд по извилистому пути, отражайте постоянно появляющихся врагов и победите босса.": "Fight along a winding path as enemies keep spawning, then defeat the boss.",
  "∞ Бесконечная арена": "∞ Endless Arena",
  "Волны, разрушаемые ящики, улучшения после каждой волны и босс каждые пять волн.": "Waves, breakable crates, an upgrade after every wave, and a boss every five waves.",
  "🔒 Пройдите историю": "🔒 Complete the story",
  "Откроется после первой победы в истории на любой сложности.": "Unlocks after completing the story once on any difficulty.",
  "▶ Продолжить": "▶ Continue",
  "Глава {0}/7 · осколков {1}/7": "Chapter {0}/7 · shards {1}/7",
  "Забег сохранён": "Run saved",
  "Точно начать заново?": "Start over for sure?",
  "Начать заново": "Start over",
  "▶ Начать": "▶ Start",
  "🏆 Достижения: {0}/{1}": "🏆 Achievements: {0}/{1}",
  "📖 Кодекс: {0}/{1}": "📖 Codex: {0}/{1}",
  "лёгкий": "easy",
  "средний": "normal",
  "хард · 1 HP": "hard · 1 HP",
  "хард": "hard",
  "Следующий забег: {0}": "Next run: {0}",
  "Текущий забег: {0}.": "Current run: {0}.",
  "ВОЛНА {0} ПРОЙДЕНА": "WAVE {0} COMPLETE",
  "Выберите одно улучшение. После выбора начнётся следующая волна.": "Choose one upgrade. The next wave starts after your choice.",
  "⚔ Урон +25% (сейчас {0}%)": "⚔ Damage +25% (currently {0}%)",
  "➜ Скорость +10% (сейчас {0}%)": "➜ Speed +10% (currently {0}%)",
  "✦ Оружие и боеприпасы": "✦ Weapons and ammunition",
  "✦ Оружие, боеприпасы и +35 HP": "✦ Weapons, ammunition, and +35 HP",
  "РЕКОРДЫ АРЕНЫ": "ARENA RECORDS",
  "Сначала учитываются пройденные волны, затем количество убитых врагов. Таблица хранится в этом хранилище.": "Ranked by waves completed, then enemies defeated. Records are stored in this vault.",
  "Пока нет завершённых забегов.": "No completed runs yet.",
  "Волны": "Waves",
  "Убито": "Kills",
  "Время": "Time",
  "Сложность": "Difficulty",
  "Дата": "Date",
  "Лёгкая": "Easy",
  "Средняя": "Normal",
  "Хард": "Hard",
  "ЗАБЕГ ЗАВЕРШЁН": "RUN OVER",
  "Пройдено волн: {0}. Убито врагов: {1}. Результат сохранён в таблице рекордов.": "Waves completed: {0}. Enemies defeated: {1}. Your result was added to the records.",
  "Главное меню": "Main menu",
  "Новый забег": "New run",
  "ПУТЬ ПРОЙДЕН": "PATH COMPLETE",
  "Босс повержен за {0}. Удалено врагов: {1}.": "Boss defeated in {0}. Enemies defeated: {1}.",
  "Пройти ещё раз": "Play again",
  "ХРАНИЛИЩЕ ВОССТАНОВЛЕНО": "THE VAULT IS RESTORED",
  "Седьмой осколок встал на место. Граф вспыхнул от края до края, а Пустая Заметка стала просто чистым листом — местом для новой мысли.": "The seventh shard is back in place. The graph lights up from end to end, and the Blank Note becomes a clean page: a place for a new thought.",
  "⏱ Время: {0}": "⏱ Time: {0}",
  "☠ Удалено: {0}": "☠ Defeated: {0}",
  "↺ Гибелей: {0}": "↺ Deaths: {0}",
  "? Тайники: {0}/3": "? Secrets: {0}/3",
  "❡ Страниц: {0}/12": "❡ Pages: {0}/12",
  "▶ Исследовать дальше": "▶ Keep exploring",
  "Читать эпилог": "Read the epilogue",
  "Новая игра": "New game",
  "Режимы и арена": "Modes and arena",
  "Открыто {0} из {1}": "Unlocked {0} of {1}",
  "✓ Открыто ": "✓ Unlocked ",
  "??? — не найдено": "??? — not found",
  "Запись ещё не открыта. Подсказка: ": "Entry still locked. Hint: ",
  "⇩ Экспортировать Кодекс в заметку": "⇩ Export Codex to a note",
  "Кодекс экспортирован": "Codex exported",
  "Заметка создана в хранилище": "Note created in the vault",
  "Не удалось экспортировать": "Export failed",
  "движение": "move",
  "поворот (без мыши)": "turn without the mouse",
  "Мышь": "Mouse",
  "обзор — кликните по экрану для захвата": "look around — click the screen to capture the pointer",
  "ЛКМ / Пробел": "Left click / Space",
  "выстрел": "fire",
  "1 · 2 · 3 / колесо / Q": "1 · 2 · 3 / wheel / Q",
  "смена оружия": "change weapon",
  "бег": "run",
  "осмотреть стену, открыть тайник": "inspect a wall or open a secret",
  "карта Хранилища": "Vault map",
  "пауза и меню": "pause and menu",
  "Арсенал": "Arsenal",
  "✒ Перо — бесконечные чернила, двойной урон вплотную.": "✒ Quill — unlimited ink, double damage at close range.",
  "[[ ]] Wikilink-дробовик — 7 скобок-дробин, мощно вблизи. Лежит где-то в Архиве.": "[[ ]] Wikilink Shotgun — seven bracket pellets, powerful up close. Found in the Archive.",
  "⚡ Граф-лазер — скорострельный луч энергии. Спрятан в Саду Заметок.": "⚡ Graph Laser — a rapid-fire energy beam. Hidden in the Garden of Notes.",
  "Печати": "Seals",
  "Двери между зонами открываются, когда у вас достаточно осколков: 1 → Сад, 3 → Граф, 5 → Битые ссылки, 6 → Ядро. Седьмой осколок — у Пустой Заметки.": "Zone doors open when you have enough shards: 1 → Garden, 3 → Graph, 5 → Broken Links, 6 → Core. The Blank Note has the seventh shard.",
  "Звук": "Sound",
  "Громкость": "Volume",
  "Чувствительность мыши": "Mouse sensitivity",
  "Сложность следующего забега": "Difficulty for the next run",
  "Хард · 1 HP": "Hard · 1 HP",
  "Разрешение рендера": "Render resolution",
  "25% — максимально быстро": "25% — fastest",
  "50% — по умолчанию": "50% — default",
  "100% — чётко": "100% — sharp",
  "Имена заметок из хранилища": "Use note names from the vault",
  "Показывать FPS": "Show FPS",
  "Эти же настройки доступны в Настройки → Сторонние плагины → HELLVAULT.": "These settings are also available in Settings → Community plugins → HELLVAULT.",
  "Открыть HELLVAULT": "Open HELLVAULT",
  "Экспортировать Кодекс в заметку": "Export the Codex to a note",
  "Кодекс сохранён в «{0}» ({1}/{2} записей)": "Codex saved to “{0}” ({1}/{2} entries)",
  "Скорость поворота камеры мышью.": "How quickly the camera turns with the mouse.",
  "Синтезированные звуковые эффекты (WebAudio).": "Synthesized sound effects (WebAudio).",
  "Применяется к следующему новому забегу: лёгкая — прежняя обычная, средняя — прежняя тяжёлая, хард — 1 HP и усиленные враги.": "Applies to the next new run: Easy matches the old Normal; Normal matches the old Hard; Hard gives you 1 HP and stronger enemies.",
  "Доля от размера вкладки. Меньше — быстрее и «пиксельнее».": "Fraction of the view size. Lower is faster and more pixelated.",
  "50% (по умолчанию)": "50% (default)",
  "Названия заметок используются в именах Сирот и Дубликатов и на надгробиях. Выбранные ниже папки исключаются.": "Note titles are used for Orphans, Duplicates, and gravestones. Folders selected below are excluded.",
  "Исключить папки из имён в игре": "Exclude folders from in-game names",
  "Отмеченные папки и все их вложенные папки не используются для имён врагов и надгробий. Изменения сразу применяются в открытой игре.": "Notes in selected folders and their subfolders are excluded from enemy names and gravestones. Changes apply to open games immediately.",
  "В хранилище нет папок": "There are no folders in this vault",
  "Сбросить весь прогресс": "Reset all progress",
  "Удаляет забег, достижения и открытый Кодекс. Закройте вкладку игры перед сбросом.": "Deletes your runs, achievements, and unlocked Codex entries. Close the game before resetting.",
  "Сбросить": "Reset",
  "Прогресс HELLVAULT сброшен": "HELLVAULT progress has been reset"
};
var EN_ZONES = [
  ["Archive", "where notes wait for years"],
  ["Garden of Notes", "thoughts that have yet to become text"],
  ["Graph", "a lattice of forgotten connections"],
  ["Broken Links", "a world-sized 404 error"],
  ["Core", "home of the Blank Note"]
];
var EN_ACHIEVEMENTS = {
  first_blood: ["First Edit", "Destroy your first creature of Corruption."],
  kills50: ["Vault Cleanup", "Destroy 50 enemies across all runs."],
  kills150: ["Garbage Collector", "Destroy 150 enemies across all runs."],
  quill25: ["The Pen Is Mightier", "Destroy 25 enemies with the Quill."],
  glitch15: ["Link Repair", "Destroy 15 Broken Links."],
  spam15: ["Anti-Spam", "Destroy 15 Spam Tags."],
  dedup: ["Deduplication", "Destroy both Copies of the same Duplicate."],
  shard1: ["First Shard", "Pick up an obsidian shard."],
  shard7: ["Integrity", "Collect all seven shards in a single run."],
  boss: ["Filling the Void", "Defeat the Blank Note."],
  secret1: ["Hidden File", "Find a secret."],
  secret3: ["Full Index", "Find all three secrets in a single run."],
  zones: ["Cartographer", "Visit all five zones of the Vault."],
  shotgun: ["[[Double Brackets]]", "Find the Wikilink Shotgun."],
  laser: ["Connected", "Find the Graph Laser."],
  pages6: ["Chronicler", "Find six diary pages."],
  pages12: ["Keeper of Memories", "Find all twelve diary pages."],
  nodmg: ["Without a Scratch", "Pick up a shard without taking damage since entering the zone."],
  lowhp: ["Close Call", "Fall to 10 HP or less and heal."],
  speed: ["Quick Search", "Complete the story in under 20 minutes."],
  flawless: ["No Backups", "Complete the story without dying."]
};
var EN_LORE_CATS = { story: "Story", zone: "Zones", bestiary: "Bestiary", diary: "Diary Pages" };
var EN_LORE = {
  st_prologue: ["Prologue: Quiet Corruption", "Available from the start.", "The Vault was alive. Thousands of notes breathed through their links, tags kept them in order, and the graph glowed like a city at night.\n\nOne day, synchronization stopped mid-sentence. Corruption seeped through the crack between versions, and notes began to forget one another. Links broke, copies multiplied, and Nothing appeared at the heart of the Vault: the Blank Note, which wanted everything to become a clean page again.\n\nThe Vault fractured into seven obsidian Shards, the core of its memory. As long as they remain scattered, the Corruption grows."],
  st_keeper: ["The Keeper", "Available from the start.", "You are the Keeper, the last process left in the Vault's memory. You carry the Quill that wrote the first notes and the stubbornness of someone who remembers where everything belongs.\n\nCollect the Shards, open the path to the Core, and restore the Vault. The doors between zones are sealed; each opens only for someone carrying enough Shards."],
  st_rot: ["The Corruption", "Destroy your first enemy.", "What you destroyed was once a note. The Corruption does not create; it distorts. The forgotten becomes an Orphan, the severed a Broken Link, the repeated a Duplicate, and the obsessive a Spam Tag.\n\nWhen you defeat them, you do not erase them: you set them free. Sometimes they leave behind clean pages or brackets for your weapon."],
  st_epilogue: ["Epilogue: A Clean Page", "Complete the story.", "The seventh Shard returned to its place, and the graph lit up from end to end. Links healed, Orphans found their parents, and Duplicates became one again.\n\nThe Blank Note did not disappear. The Keeper realized it had never been evil: it was a place for a new thought. Now that the Vault is whole, it is time to begin writing.\n\nThe Vault remembers you, Keeper."],
  z_0: ["Archive", "Visit the Archive.", "The lower levels of the Vault, where notes can lie for years: stone halls, endless bookshelves, and candles no one puts out. The air smells of old drafts.\n\nThe Corruption first took hold here. Few people visit, and things are easily forgotten. Shards: 1. The door to the Garden opens with 1 shard."],
  z_1: ["Garden of Notes", "Visit the Garden of Notes.", "Under an open violet sky grow thoughts that have not yet become text. The hedges are tags left to spread unchecked. Among them stand gravestones for notes deleted before anyone read them.\n\nThe Garden is beautiful, but Duplicates gather in its shade. Shards: 2. The door to the Graph opens with 3 shards."],
  z_2: ["Graph", "Visit the Graph.", "A glowing lattice of connections. Each crystal pillar is a note, each bridge a link. Once, the light of thought ran through them. Now half the lines have gone dark, and Broken Links dart between the nodes.\n\nShards: 2. The door to Broken Links opens with 5 shards."],
  z_3: ["Broken Links", "Visit Broken Links.", "Ruins where links lead nowhere. Walls flicker with static, the floor is cracked, and the sky is as red as an error message.\n\nThe Corruption is strongest here, and the only path to the Core begins here. Shards: 1. The Core's door opens with 6 shards."],
  z_4: ["Core", "Enter the Core.", "The heart of the Vault, built from pure obsidian. It once held the index of everything; now the Blank Note lives here. She has the seventh Shard."],
  b_orphan: ["Orphan", "Destroy an Orphan.", "A note with no incoming links. It wanders slowly, looking for someone to remember it. Harmless alone, dangerous in a crowd.\n\nWeakness: any weapon, even the Quill. It may bear the name of one of your real notes…"],
  b_glitch: ["Broken Link", "Destroy a Broken Link.", "A fragment of a connection pointing to a nonexistent page. Fast and erratic, it can teleport short distances, like a link that jumps to the wrong place.\n\nTip: keep your distance and shoot when it materializes."],
  b_dup: ["Duplicate", "Destroy a Duplicate.", "A synchronization conflict given form. When destroyed, a Duplicate splits into two smaller, faster Copies.\n\nTo get rid of a Duplicate for good, destroy both Copies."],
  b_spam: ["Spam Tag", "Destroy a Spam Tag.", "A #tag applied to everything. It keeps its distance and spits hash symbols.\n\nTake cover behind walls and close the distance while it reloads."],
  b_boss: ["Blank Note", "Defeat the boss.", "A blank page as large as a cathedral. A cursor blinks within it, waiting for words that no one writes.\n\nThe Blank Note fires void projectiles and summons Orphans. When weakened, she begins teleporting across the Core. Defeating her returns the seventh Shard."],
  d1: ["Page 1. First Day", "Archive.", "Today I was appointed Keeper. They gave me a Quill and a set of keys to the zones. The Archive is enormous: the shelves stretch farther than the candles can shine. The senior archivist said, ‘The important thing is not to lose anything.’ Sounds simple."],
  d2: ["Page 2. Whispers", "Archive.", "Someone is whispering in the far aisles. I found a note without a single incoming link. It repeated its own title as if afraid to forget. I linked it to the index, and the whispering stopped. I should do that more often."],
  d3: ["Page 3. Stash", "Secret in the Archive.", "I hid spare brackets behind a cracked wall in the west wing. If you are reading this, you know how to look closely at walls too. Stand close and press E. The Vault likes those who check."],
  d4: ["Page 4. Garden", "Garden of Notes.", "The tags are blooming in the Garden again. I trimmed the hedges, but by morning they had doubled in size. New gravestones appeared between them: someone is deleting notes without opening them. I do not know the names on the stones. Do you?"],
  d5: ["Page 5. Two of Us", "Garden of Notes.", "I met myself. More precisely, my copy. She kept a diary too and insisted she was the real one. We argued until evening, then realized we were using exactly the same words. Synchronization is breaking down."],
  d6: ["Page 6. Under the Sky", "Secret in the Garden.", "Near the Garden's southern fence, there is a place where the hedge grows the wrong way. I made a shelter there. From here I can see the Vault's sky, violet like the cover of my first notebook."],
  d7: ["Page 7. Graph Light", "Graph.", "A third of the Graph has gone dark. I walked beside the dead lines and heard something fast scratching along them. A link to nowhere still wants to lead somewhere, so it attacks the first thing it meets."],
  d8: ["Page 8. The Formula", "Graph.", "If the Shards are gathered, the Core will take them back. I counted: six will open the door; the seventh belongs to the one inside. I will not be strong enough. Perhaps you will be."],
  d9: ["Page 9. Node", "Secret in the Graph.", "In the eastern corner of the Graph, one pillar glows differently. Beyond it is a room the index cannot see. I left laser energy there. Light is the best way to mend connections."],
  d10: ["Page 10. Red Sky", "Broken Links.", "The sky over Broken Links has turned red. Every door is a 404 error, every wall an unfinished word. Spam Tags shout their hash marks at everyone passing by. I hardly sleep."],
  d11: ["Page 11. Voice from the Core", "Broken Links.", "The Blank Note spoke to me. She said she was not angry; she simply wanted everything to be clean. No mistakes. No links. No us. If she wins, the Vault will be perfectly empty."],
  d12: ["Page 12. The Last One", "Core.", "I am leaving the Quill where the next Keeper will find it. Do not fear the blank page. Fear the one who wants it to stay blank. Gather the Shards. Write something.\n\n— The previous Keeper"]
};
var EN_ENEMIES = { orphan: "Orphan", glitch: "Broken Link", dup: "Duplicate", copy: "Copy", spam: "Spam Tag", boss: "Blank Note" };
var EN_WEAPONS = ["Quill", "Wikilink Shotgun", "Graph Laser"];
var EN_FALLBACK_NAMES = ["Untitled", "Untitled 2", "Draft", "Ideas for Later", "TODO", "Shopping List", "Meeting 12.03", "Late-Night Thoughts", "Read Later", "Untitled", "Note 404", "Inbox", "Quotes", "Weekly Plan", "Old Project", "Borscht Recipe", "Links"];
var RU_CONTENT = {
  zones: ZONES.map(({ name, sub }) => ({ name, sub })),
  achievements: ACHIEVEMENTS.map(({ title, desc }) => ({ title, desc })),
  categories: LORE_CATS.map(({ title }) => title),
  lore: LORE.map(({ title, hint, text }) => ({ title, hint, text })),
  enemies: Object.fromEntries(Object.entries(EDEF).map(([id, value]) => [id, value.name])),
  weapons: WEAPONS.map(({ name }) => name),
  fallback: [...FALLBACK_NAMES]
};
function setGameLanguage(language) {
  GAME_LANGUAGE = language === "en" ? "en" : "ru";
  const english = GAME_LANGUAGE === "en";
  ZONES.forEach((z, i) => Object.assign(z, english ? { name: EN_ZONES[i][0], sub: EN_ZONES[i][1] } : RU_CONTENT.zones[i]));
  ACHIEVEMENTS.forEach((a, i) => Object.assign(a, english ? { title: EN_ACHIEVEMENTS[a.id][0], desc: EN_ACHIEVEMENTS[a.id][1] } : RU_CONTENT.achievements[i]));
  LORE_CATS.forEach((c, i) => { c.title = english ? EN_LORE_CATS[c.id] : RU_CONTENT.categories[i]; });
  LORE.forEach((l, i) => Object.assign(l, english ? { title: EN_LORE[l.id][0], hint: EN_LORE[l.id][1], text: EN_LORE[l.id][2] } : RU_CONTENT.lore[i]));
  Object.keys(EDEF).forEach((id) => { EDEF[id].name = english ? EN_ENEMIES[id] : RU_CONTENT.enemies[id]; });
  WEAPONS.forEach((w, i) => { w.name = english ? EN_WEAPONS[i] : RU_CONTENT.weapons[i]; });
  FALLBACK_NAMES.splice(0, FALLBACK_NAMES.length, ...(english ? EN_FALLBACK_NAMES : RU_CONTENT.fallback));
}
function tr(parts, ...values) {
  const key = typeof parts === "string" ? parts : parts.reduce((result, part, i) => result + part + (i < values.length ? `{${i}}` : ""), "");
  const translated = GAME_LANGUAGE === "en" ? (EN_RUNTIME[key] ?? key) : key;
  return translated.replace(/\{(\d+)\}/g, (match, index) => index < values.length ? String(values[index]) : match);
}
function gameLocale() { return GAME_LANGUAGE === "en" ? "en-US" : "ru-RU"; }

function el(tag, cls, text, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== void 0) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
function fmtTime(s) {
  const m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return `${m}:${ss < 10 ? "0" : ""}${ss}`;
}
function encodeBits(a) {
  const bytes = new Uint8Array(Math.ceil(a.length / 8));
  for (let i = 0; i < a.length; i++) if (a[i]) bytes[i >> 3] |= 1 << (i & 7);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function decodeBits(s, out) {
  try {
    const b = atob(s);
    for (let i = 0; i < out.length; i++) out[i] = b.charCodeAt(i >> 3) >> (i & 7) & 1;
  } catch {
  }
}
// Дополнительные миры используют тот же рендер и правила столкновений, что и история.
function generateModeWorld(mode) {
  if (mode === "story") return generateWorld();
  const grid = new Uint8Array(MW * MH).fill(T.BORDER);
  const zone = new Uint8Array(MW * MH).fill(mode === "arena" ? Z.GRAPH : Z.GARDEN);
  const enemies = [], items = [], decor = [];
  let start;
  if (mode === "linear") {
    // Непрерывный извилистый проход: ни зон, ни печатей, ни поиска осколков.
    for (let y = 2; y < MH - 2; y++) {
      const center = 35 + Math.sin((y - 4) / 10) * 6 + Math.sin(y / 22) * 2;
      const width = 4.8 + Math.sin(y / 7) * 0.6;
      for (let x = 1; x < MW - 1; x++) {
        if (Math.abs(x - center) < width) grid[y * MW + x] = 0;
      }
    }
    const centerAt = (y) => 35 + Math.sin((y - 4) / 10) * 6 + Math.sin(y / 22) * 2;
    start = { x: Math.floor(centerAt(67)) + 0.5, y: 67.5, a: -Math.PI / 2 };
    const bossX = Math.floor(centerAt(7)) + 0.5;
    enemies.push({ id: 0, type: "boss", x: bossX, y: 7.5 });
    for (const [y, kind] of [[61, "shotgun"], [53, "shells"], [46, "health"], [39, "laser"], [31, "energy"], [22, "health"], [14, "energy"]]) {
      items.push({ id: items.length, kind, x: Math.floor(centerAt(y)) + 0.5, y: y + 0.5 });
    }
    for (let y = 10; y < 65; y += 7) {
      const center = centerAt(y);
      const x = Math.floor(center + (y % 2 ? -3 : 3)) + 0.5;
      if (!grid[y * MW + Math.floor(x)]) decor.push({ kind: y % 2 ? "tree" : "node", x, y: y + 0.5 });
    }
  } else {
    // Круглая открытая арена с достаточным местом для крупного босса.
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      if (Math.hypot(x + 0.5 - 36, y + 0.5 - 36) < 15) grid[y * MW + x] = 0;
    }
    start = { x: 36.5, y: 38.5, a: -Math.PI / 2 };
    items.push({ id: 0, kind: "shotgun", x: 33.5, y: 36.5 });
    items.push({ id: 1, kind: "laser", x: 38.5, y: 36.5 });
  }
  return { grid, zone, start, anchors: Array(5).fill({ x: Math.floor(start.x), y: Math.floor(start.y) }), doors: [], secrets: [], enemies, items, decor };
}
function normalizeExcludedFolders(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((x) => typeof x === "string").map((x) => x.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")).filter(Boolean))];
}
function noteIsExcluded(path, folders) {
  return folders.some((folder) => path === folder || path.startsWith(folder + "/"));
}

var Game = class {
  constructor(root, opts) {
    this.sfx = new Sfx();
    this.img = null;
    this.buf = new Uint32Array(0);
    this.zbuf = new Float32Array(0);
    this.skyU = new Int32Array(0);
    this.rw = 320;
    this.rh = 200;
    this.W = 640;
    this.H = 400;
    this.state = "menu";
    this.tab = "main";
    this.codexSel = "st_prologue";
    this.confirmNew = false;
    this.raf = 0;
    this.last = 0;
    this.time = 0;
    this.menuFrame = 0;
    this.fps = 0;
    this.fpsAcc = 0;
    this.fpsN = 0;
    this.destroyed = false;
    this.saveTimer = 0;
    this.timeouts = [];
    this.ro = null;
    this.cleanup = [];
    this.enemies = [];
    this.items = [];
    this.projs = [];
    this.parts = [];
    this.decor = [];
    this.crates = [];
    this.mode = "story";
    this.nav = null;
    this.navDirty = true;
    this.uid = 1;
    this.dupKills = /* @__PURE__ */ new Map();
    this.px = 0;
    this.py = 0;
    this.pa = 0;
    this.hp = 100;
    this.shells = 0;
    this.energy = 0;
    this.weapons = [true, false, false];
    this.cur = 0;
    this.fireCd = 0;
    this.fireT = 0;
    this.laserT = 0;
    this.bob = 0;
    this.hurtT = 0;
    this.flashT = 0;
    this.pickupT = 0;
    this.zone = -1;
    this.zoneTitleT = 0;
    this.dmgInZone = false;
    this.lowHp = false;
    this.deadT = 0;
    this.mapOpen = false;
    this.msgs = [];
    this.doorMsgT = 0;
    this.target = null;
    this.hint = "";
    this.fog = [20, 10, 20];
    this.dens = 0.08;
    this.bossAwake = false;
    this.keys = /* @__PURE__ */ new Set();
    this.mouseDown = false;
    this.mdx = 0;
    this.wantLock = false;
    this.lockAt = 0;
    this.godMode = false;
    // ---------- Цикл ----------
    this.loop = (t) => {
      if (this.destroyed) return;
      const dt = Math.min(0.05, Math.max(0, (t - this.last) / 1e3));
      this.last = t;
      this.fpsAcc += dt;
      this.fpsN++;
      if (this.fpsAcc > 0.5) {
        this.fps = Math.round(this.fpsN / this.fpsAcc);
        this.fpsAcc = 0;
        this.fpsN = 0;
      }
      if (this.state === "playing" || this.state === "dead") {
        this.update(dt);
        this.render();
      } else if (this.menuFrame++ % 6 === 0) {
        this.time += dt * 6;
        this.render();
      }
      this.raf = requestAnimationFrame(this.loop);
    };
    this.root = root;
    this.opts = opts;
    this.data = opts.data;
    setGameLanguage(this.data.settings.language);
    this.art = buildArt();
    this.mode = this.data.lastMode || "story";
    this.world = generateModeWorld(this.mode);
    this.refreshNames();
    root.classList.add("vs-root");
    this.wrap = el("div", "vs-wrap", void 0, root);
    this.wrap.tabIndex = 0;
    this.canvas = el("canvas", "vs-canvas", void 0, this.wrap);
    this.ctx = this.canvas.getContext("2d");
    this.low = document.createElement("canvas");
    this.lowCtx = this.low.getContext("2d");
    this.overlay = el("div", "vs-overlay", void 0, this.wrap);
    this.toasts = el("div", "vs-toasts", void 0, this.wrap);
    for (const id of ALWAYS_LORE) if (!this.data.progress.lore.includes(id)) this.data.progress.lore.push(id);
    this.applySettings(this.data.settings);
    if (this.data.run) this.loadRun(this.data.run);
    else this.newRun();
    this.bindInput();
    this.resize();
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.wrap);
    }
    this.openMenu(this.run.awaitingUpgrade ? "upgrade" : "main");
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.debug = {
      teleport: (x, y, a) => {
        this.px = x;
        this.py = y;
        this.pa = a;
      },
      play: () => this.resume(),
      giveAll: () => {
        this.weapons = [true, true, true];
        this.shells = 40;
        this.energy = 200;
      },
      weapon: (i) => {
        this.cur = i;
      },
      menu: (t) => this.openMenu(t),
      codex: (id) => {
        this.codexSel = id;
        this.openMenu("codex");
      },
      fire: () => this.fire(),
      key: (code, down) => {
        if (down) this.keys.add(code);
        else this.keys.delete(code);
      },
      shards: (n) => {
        this.run.shards = Array.from({ length: n }, (_, i) => i);
      },
      state: () => ({ state: this.state, x: this.px, y: this.py, hp: this.hp, zone: this.zone, alive: this.enemies.filter((e) => !e.dead).length, kills: this.run.kills, shards: this.run.shards.length, fps: this.fps, rw: this.rw, rh: this.rh }),
      step: (n) => {
        for (let i = 0; i < n; i++) this.update(1 / 60);
        this.render();
      },
      wake: () => {
        for (const e of this.enemies) if (Math.hypot(e.x - this.px, e.y - this.py) < 10) e.awake = true;
      },
      god: () => {
        this.godMode = true;
        this.hp = 86;
      },
      clearToasts: () => this.toasts.replaceChildren(),
      unlockSome: () => {
        const p = this.data.progress;
        ["d1", "d2", "d4", "z_0", "z_1", "b_orphan", "b_dup", "st_rot"].forEach((id) => {
          if (!p.lore.includes(id)) p.lore.push(id);
        });
        p.stats.kills = Math.max(p.stats.kills || 0, 37);
        p.stats.k_quill = Math.max(p.stats.k_quill || 0, 12);
        this.checkAch();
      },
      world: () => this.world
    };
  }
  refreshNames() {
    const source = this.opts.getNoteNames ? this.opts.getNoteNames() : (this.opts.noteNames || []);
    const pool = this.data.settings.useNoteNames && source.length ? source : FALLBACK_NAMES;
    const rng = mulberry32(42);
    this.names = [...pool].sort(() => rng() - 0.5);
    if (this.names.length < 4) this.names.push(...FALLBACK_NAMES);
    if (this.enemies) this.enemies.forEach((e, i) => {
      const d = EDEF[e.type];
      const nm = this.names[i % this.names.length];
      e.name = e.type === "orphan" ? `${d.name} «${nm}»` : e.type === "dup" ? `${d.name} «${nm} (1)»` : d.name;
    });
    if (this.decor && this.art) {
      let i = 0;
      for (const d of this.decor) if (d.kind === "tomb") {
        d.text = this.names[i++ % this.names.length];
        d.tex = this.art.makeTomb(d.text);
      }
    }
  }
  startMode(mode, fresh = false) {
    if (mode === "arena" && !this.data.progress.arenaUnlocked) return;
    this.persist();
    this.mode = mode;
    this.data.lastMode = mode;
    this.world = generateModeWorld(mode);
    const saved = fresh ? null : this.data.runs[mode];
    this.loadRun(saved || this.freshRun());
    this.data.run = this.snapshot();
    this.data.runs[mode] = this.data.run;
    this.state = "menu";
    this.persist();
    if (this.run.awaitingUpgrade) this.openMenu("upgrade");
    else this.resume();
  }
  // Поле кратчайших путей позволяет врагам обходить стены, а не упираться в них.
  navigation() {
    const gx = Math.floor(this.px), gy = Math.floor(this.py), goal = gy * MW + gx;
    if (this.nav && this.navGoal === goal && !this.navDirty && this.time - this.navTime < 0.75) return this.nav;
    const dist = new Int32Array(MW * MH).fill(-1);
    const queue = new Int32Array(MW * MH);
    if (gx < 0 || gy < 0 || gx >= MW || gy >= MH || this.grid[goal]) return dist;
    let tail = 0;
    queue[tail++] = goal;
    dist[goal] = 0;
    for (let head = 0; head < tail; head++) {
      const c = queue[head], x = c % MW, y = Math.floor(c / MW);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, n = ny * MW + nx;
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || this.grid[n] || dist[n] >= 0) continue;
        dist[n] = dist[c] + 1;
        queue[tail++] = n;
      }
    }
    this.nav = dist;
    this.navGoal = goal;
    this.navTime = this.time;
    this.navDirty = false;
    return dist;
  }
  chaseAroundWalls(e, step, radius) {
    const dist = this.navigation(), x = Math.floor(e.x), y = Math.floor(e.y), c = y * MW + x;
    if (dist[c] < 0) return;
    let best = c;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, n = ny * MW + nx;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || dist[n] < 0 || dist[n] >= dist[best]) continue;
      if (this.solidBox(nx + 0.5, ny + 0.5, radius)) continue;
      best = n;
    }
    const tx = best === c ? this.px : best % MW + 0.5;
    const ty = best === c ? this.py : Math.floor(best / MW) + 0.5;
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    if (d > 0.001) this.moveBody(e, dx / d * Math.min(step, d), dy / d * Math.min(step, d), radius);
  }
  spawnPoint(radius = 0.32, min = 6, max = 15) {
    const dist = this.navigation(), options = [];
    const cx = Math.floor(this.px), cy = Math.floor(this.py), reach = Math.ceil(max);
    for (let y = Math.max(1, cy - reach); y <= Math.min(MH - 2, cy + reach); y++) {
      for (let x = Math.max(1, cx - reach); x <= Math.min(MW - 2, cx + reach); x++) {
        const d = Math.hypot(x + 0.5 - this.px, y + 0.5 - this.py);
        if (d < min || d > max || dist[y * MW + x] < 0 || this.solidBox(x + 0.5, y + 0.5, radius)) continue;
        options.push({ x: x + 0.5, y: y + 0.5 });
      }
    }
    return options.length ? options[Math.floor(Math.random() * options.length)] : null;
  }
  replenishCrates() {
    this.crates = [];
    for (let i = 0; i < 5; i++) {
      const p = this.spawnPoint(0.25, 3, 12);
      if (p && this.crates.every((c) => Math.hypot(c.x - p.x, c.y - p.y) > 2)) this.crates.push({ ...p, hp: 25, dead: false });
    }
  }
  breakCrate(c) {
    if (c.dead) return;
    c.dead = true;
    this.sfx.play("edeath");
    const kinds = this.run.difficulty === "hard" ? ["shells", "energy", "shells"] : ["health", "shells", "energy"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    this.items.push({ id: -1, kind, x: c.x, y: c.y, taken: false });
    this.parts.push({ x: c.x, y: c.y, z: 0.4, t: 0, life: 0.4 });
    this.msg(tr("Ящик разбит: припасы!"), 1.5);
  }
  updateLinear(dt) {
    if (this.run.won) return;
    const boss = this.enemies.find((e) => e.type === "boss" && !e.dead);
    if (boss && !boss.awake && Math.hypot(boss.x - this.px, boss.y - this.py) < 12) {
      boss.awake = true;
      this.bossAwake = true;
      this.sfx.play("boss");
      this.msg(tr("Впереди Пустая Заметка!"), 4);
    }
    this.run.spawnTimer -= dt;
    // Не держим за игроком старых врагов на другом конце пути: таймер продолжает создавать новых.
    this.enemies = this.enemies.filter((e) => e.type === "boss" || e.dead || Math.hypot(e.x - this.px, e.y - this.py) < 22);
    const alive = this.enemies.filter((e) => !e.dead && e.type !== "boss").length;
    if (this.run.spawnTimer <= 0 && alive < 18) {
      const p = this.spawnPoint(0.32, 6, 13);
      if (p) {
        const types = ["orphan", "glitch", "dup", "spam"];
        const type = types[Math.floor(Math.random() * types.length)];
        const e = this.makeEnemy(type, p.x, p.y, -1, this.uid);
        e.awake = true;
        this.enemies.push(e);
      }
      this.run.spawnTimer = 2 + Math.random() * 1.8;
    }
  }
  updateArena(dt) {
    const r = this.run;
    if (r.awaitingUpgrade || r.ended) return;
    r.spawnTimer -= dt;
    const living = this.enemies.filter((e) => !e.dead);
    if (r.bossPending && r.spawnTimer <= 0) {
      const p = this.spawnPoint(0.7, 8, 13);
      if (p) {
        const b = this.makeEnemy("boss", p.x, p.y, -1, 0);
        b.awake = true;
        this.enemies.push(b);
        this.bossAwake = true;
        this.sfx.play("boss");
        this.msg(tr`БОСС · волна ${r.wave}`, 4);
        r.bossPending = false;
        r.spawnTimer = 1.5;
      }
    } else if (r.spawnRemaining > 0 && r.spawnTimer <= 0 && living.length < 25) {
      const types = ["orphan", "glitch", "dup", "spam"];
      const p = this.spawnPoint(0.32, 6, 13);
      if (p) {
        const e = this.makeEnemy(types[Math.floor(Math.random() * Math.min(4, 1 + r.wave))], p.x, p.y, -1, this.uid);
        e.awake = true;
        this.enemies.push(e);
        r.spawnRemaining--;
      }
      r.spawnTimer = Math.max(0.35, 1.35 - r.wave * 0.035);
    }
    if (r.spawnRemaining <= 0 && !r.bossPending && !this.enemies.some((e) => !e.dead)) {
      r.completedWave = r.wave;
      r.awaitingUpgrade = true;
      this.projs = [];
      this.persist();
      this.openMenu("upgrade");
    }
  }
  chooseUpgrade(kind) {
    if (!this.run.awaitingUpgrade) return;
    const r = this.run;
    if (kind === "damage") r.damageMult = Math.round((r.damageMult + 0.25) * 100) / 100;
    if (kind === "speed") r.speedMult = Math.min(2, Math.round((r.speedMult + 0.1) * 100) / 100);
    if (kind === "supplies") {
      this.weapons = [true, true, true];
      this.shells = Math.min(60, this.shells + 20);
      this.energy = Math.min(300, this.energy + 120);
      if (r.difficulty !== "hard") this.hp = Math.min(r.maxHp, this.hp + 35);
    }
    r.wave++;
    r.spawnRemaining = Math.min(45, 4 + r.wave * 2);
    r.spawnTimer = 2;
    r.bossPending = r.wave % 5 === 0;
    r.awaitingUpgrade = false;
    this.replenishCrates();
    this.persist();
    this.resume();
    this.msg(tr`Волна ${r.wave}`, 3);
  }
  finishArena() {
    if (this.run.ended) return;
    const r = this.run;
    r.ended = true;
    this.data.records.push({ wave: r.completedWave || 0, reached: r.wave, kills: r.kills, time: Math.round(r.time), difficulty: r.difficulty, date: new Date().toISOString() });
    this.data.records.sort((a, b) => b.wave - a.wave || b.kills - a.kills || b.time - a.time);
    this.data.records = this.data.records.slice(0, 10);
    try {
      this.opts.onRunEnd?.("arena", { kills: r.kills, time: r.time, completedWave: r.completedWave });
    } catch (e) { console.warn("[HELLVAULT] OBSIGAMA run callback", e); }
    this.data.runs.arena = null;
    this.data.run = null;
    this.opts.onSave(this.data);
  }
  finishLinear() {
    if (this.run.won) return;
    this.run.won = true;
    this.run.bossDead = true;
    this.data.progress.stats.linear_wins = (this.data.progress.stats.linear_wins || 0) + 1;
    try {
      this.opts.onRunEnd?.("linear", { kills: this.run.kills, time: this.run.time });
    } catch (e) { console.warn("[HELLVAULT] OBSIGAMA run callback", e); }
    this.sfx.play("win");
    this.persist();
    this.openMenu("linearwin");
  }

  // ---------- Настройки / сохранение ----------
  applySettings(s) {
    s.language = s.language === "ru" ? "ru" : "en";
    const languageChanged = this.language !== s.language;
    this.language = s.language;
    this.data.settings = s;
    setGameLanguage(s.language);
    this.sfx.enabled = s.sound;
    this.sfx.volume = s.volume;
    if (this.names) this.refreshNames();
    if (languageChanged) {
      this.msgs = [];
      this.toasts?.replaceChildren();
      if (this.run && this.overlay?.classList.contains("vs-show")) this.buildMenu();
    }
    if (this.wrap) this.resize();
  }
  persist() {
    if (this.run && this.data.run && !this.run.ended) {
      this.data.run = this.snapshot();
      this.data.runs[this.mode] = this.data.run;
      this.data.lastMode = this.mode;
    }
    try {
      this.opts.onSave(this.data);
    } catch (e) {
      console.error(e);
    }
  }
  snapshot() {
    const r = this.run;
    r.x = this.px;
    r.y = this.py;
    r.a = this.pa;
    r.hp = this.hp;
    r.shells = this.shells;
    r.energy = this.energy;
    r.weapons = [...this.weapons];
    r.cur = this.cur;
    r.explored = encodeBits(this.explored);
    if (this.mode !== "story") {
      r.modeEnemies = this.enemies.filter((e) => !e.dead).map(({ name, ...e }) => ({ ...e }));
      r.modeItems = this.items.map((it) => ({ ...it }));
      r.crates = this.crates.map((c) => ({ ...c }));
    }
    return { ...r, shards: [...r.shards], taken: [...r.taken], deadSpawns: [...r.deadSpawns], doors: [...r.doors], secrets: [...r.secrets], zones: [...r.zones], weapons: [...r.weapons] };
  }
  freshRun() {
    const s = this.world.start;
    return {
      x: s.x,
      y: s.y,
      a: s.a,
      hp: this.data.settings.difficulty === "hard" ? 1 : 100,
      maxHp: this.data.settings.difficulty === "hard" ? 1 : 100,
      difficulty: this.data.settings.difficulty,
      mode: this.mode,
      damageMult: 1,
      speedMult: 1,
      wave: 1,
      completedWave: 0,
      spawnRemaining: 6,
      spawnTimer: 2,
      bossPending: false,
      awaitingUpgrade: false,
      shells: 0,
      energy: 0,
      weapons: [true, false, false],
      cur: 0,
      shards: [],
      taken: [],
      deadSpawns: [],
      doors: [],
      secrets: [],
      zones: [],
      time: 0,
      kills: 0,
      deaths: 0,
      bossDead: false,
      won: false,
      explored: ""
    };
  }
  newRun() {
    this.loadRun(this.freshRun());
  }
  loadRun(src) {
    this.run = { ...this.freshRun(), ...src };
    const r = this.run;
    this.grid = this.world.grid.slice();
    this.explored = new Uint8Array(MW * MH);
    if (r.explored) decodeBits(r.explored, this.explored);
    this.px = r.x;
    this.py = r.y;
    this.pa = r.a;
    if (r.difficulty === "hard") { r.maxHp = 1; r.hp = Math.min(1, r.hp); }
    r.hp = Math.max(1, r.hp);
    this.hp = r.hp;
    this.shells = r.shells;
    this.energy = r.energy;
    this.weapons = [...r.weapons];
    this.cur = r.cur;
    for (const i of r.doors) {
      const d = this.world.doors[i];
      if (d) this.grid[d.y * MW + d.x] = 0;
    }
    for (const i of r.secrets) {
      const s = this.world.secrets[i];
      if (s) this.grid[s.y * MW + s.x] = 0;
    }
    const taken = new Set(r.taken);
    const shards = new Set(r.shards);
    this.items = this.world.items.map((it) => ({ ...it, taken: taken.has(it.id) || it.kind === "shard" && shards.has(it.shard) }));
    if (r.bossDead && !shards.has(6)) this.items.push({ id: -1, kind: "shard", x: 35.5, y: 36.5, taken: false, shard: 6 });
    const dead = new Set(r.deadSpawns);
    this.enemies = [];
    let ni = 0;
    for (const s of this.world.enemies) {
      if (dead.has(s.id)) continue;
      if (s.type === "boss" && r.bossDead) continue;
      this.enemies.push(this.makeEnemy(s.type, s.x, s.y, s.id, ni++));
    }
    this.decor = this.world.decor.map((d) => {
      if (d.kind === "tomb") {
        const name = this.names[(d.text || 0) % this.names.length];
        return { kind: d.kind, x: d.x, y: d.y, tex: this.art.makeTomb(name), text: name };
      }
      return { kind: d.kind, x: d.x, y: d.y };
    });
    if (this.mode !== "story" && Array.isArray(r.modeEnemies)) {
      this.enemies = r.modeEnemies.map((e) => ({ ...e }));
      this.uid = Math.max(this.uid, ...this.enemies.map((e) => (e.uid || 0) + 1));
    }
    if (this.mode !== "story" && Array.isArray(r.modeItems)) this.items = r.modeItems.map((it) => ({ ...it }));
    this.crates = this.mode === "arena" && Array.isArray(r.crates) ? r.crates.map((c) => ({ ...c })) : [];
    this.nav = null;
    this.navDirty = true;
    this.projs = [];
    this.parts = [];
    this.zone = -1;
    this.bossAwake = this.mode !== "story" && this.enemies.some((e) => e.type === "boss" && e.awake && !e.dead);
    this.hurtT = 0;
    this.mapOpen = false;
    this.msgs = [];
    this.dupKills.clear();
    this.refreshNames();
    if (this.mode === "arena" && !Array.isArray(r.crates)) this.replenishCrates();
  }
  makeEnemy(type, x, y, spawnId, ni, parent = 0) {
    const d = EDEF[type];
    const hm = this.diff().hp * (this.mode === "arena" ? 1 + 0.13 * Math.max(0, this.run.wave - 1) : 1);
    const nm = this.names[ni % this.names.length];
    const name = type === "orphan" ? `${d.name} \xAB${nm}\xBB` : type === "dup" ? `${d.name} \xAB${nm} (1)\xBB` : d.name;
    return {
      uid: this.uid++,
      spawnId,
      type,
      x,
      y,
      hp: d.hp * hm,
      maxHp: d.hp * hm,
      cd: 0.5,
      anim: Math.random() * 3,
      flash: 0,
      dead: false,
      deathT: 0,
      awake: false,
      wander: Math.random() * TAU,
      tpT: 2 + Math.random() * 2,
      shootT: 1 + Math.random(),
      summonT: 6,
      parent,
      name,
      atkT: 0,
      summoned: false
    };
  }
  diff() {
    const d = this.run?.difficulty || this.data.settings.difficulty;
    return d === "easy" ? { dmg: 1, hp: 1 } : d === "hard" ? { dmg: 2, hp: 1.5 } : { dmg: 1.4, hp: 1.25 };
  }
  // ---------- Ввод ----------
  bindInput() {
    const on = (t, ev, fn, o) => {
      t.addEventListener(ev, fn, o);
      this.cleanup.push(() => t.removeEventListener(ev, fn, o));
    };
    const onDoc = (ev, fn) => {
      document.addEventListener(ev, fn);
      this.cleanup.push(() => document.removeEventListener(ev, fn));
    };
    on(this.wrap, "keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tgt = e.target;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "SELECT")) return;
      const code = e.code;
      if (code === "Escape") {
        if (this.run.awaitingUpgrade && this.tab === "upgrade") { e.preventDefault(); e.stopPropagation(); return; }
        if (this.state === "playing") this.openMenu("main");
        else if (this.state === "menu" && this.tab !== "main") {
          this.tab = "main";
          this.buildMenu();
        } else if (this.state === "menu" && this.data.run) this.resume();
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (this.state !== "playing") return;
      e.preventDefault();
      e.stopPropagation();
      this.keys.add(code);
      if (code === "Digit1") this.switchWeapon(0);
      if (code === "Digit2") this.switchWeapon(1);
      if (code === "Digit3") this.switchWeapon(2);
      if (code === "KeyQ") this.cycleWeapon(-1);
      if (code === "KeyM" || code === "Tab") this.mapOpen = !this.mapOpen;
      if (code === "KeyE" || code === "KeyF") this.use();
    });
    on(this.wrap, "keyup", (e) => {
      this.keys.delete(e.code);
      if (this.state === "playing") {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    on(this.wrap, "blur", () => {
      this.keys.clear();
      this.mouseDown = false;
    });
    on(this.canvas, "mousedown", (e) => {
      this.sfx.unlock();
      this.wrap.focus();
      if (this.state !== "playing") return;
      if (document.pointerLockElement !== this.canvas) this.lock();
      if (e.button === 0) this.mouseDown = true;
      e.preventDefault();
    });
    on(this.canvas, "wheel", (e) => {
      if (this.state === "playing") {
        this.cycleWeapon(e.deltaY > 0 ? 1 : -1);
        e.preventDefault();
      }
    }, { passive: false });
    on(this.canvas, "contextmenu", (e) => e.preventDefault());
    onDoc("mouseup", () => {
      this.mouseDown = false;
    });
    onDoc("mousemove", (e) => {
      if (document.pointerLockElement === this.canvas && performance.now() - this.lockAt > 120 && Math.abs(e.movementX) < 250) this.mdx += e.movementX;
    });
    onDoc("pointerlockchange", () => {
      const locked = document.pointerLockElement === this.canvas;
      if (locked) this.lockAt = performance.now();
      if (!locked && this.state === "playing" && !this.wantLock) this.openMenu("main");
      this.wantLock = false;
    });
  }
  lock() {
    try {
      if (!this.canvas.requestPointerLock) return;
      this.wantLock = true;
      const r = this.canvas.requestPointerLock();
      if (r && typeof r.catch === "function") r.catch(() => {
        this.wantLock = false;
      });
    } catch {
      this.wantLock = false;
    }
  }
  switchWeapon(i) {
    if (this.weapons[i] && this.cur !== i) {
      this.cur = i;
      this.fireCd = 0.25;
      this.sfx.play("click");
    }
  }
  cycleWeapon(d) {
    for (let k = 1; k <= 3; k++) {
      const i = (this.cur + d * k + 9) % 3;
      if (this.weapons[i]) {
        this.switchWeapon(i);
        return;
      }
    }
  }
  resize() {
    const W = Math.max(320, this.wrap.clientWidth || 640);
    const H = Math.max(200, this.wrap.clientHeight || 400);
    const sc = Math.max(0.2, Math.min(1, this.data.settings.resolution));
    const rw = Math.max(160, Math.min(960, Math.round(W * sc)));
    const rh = Math.max(100, Math.round(rw * H / W));
    if (W === this.W && H === this.H && rw === this.rw && rh === this.rh && this.img) return;
    this.W = W;
    this.H = H;
    this.rw = rw;
    this.rh = rh;
    this.canvas.width = W;
    this.canvas.height = H;
    this.low.width = rw;
    this.low.height = rh;
    this.img = this.lowCtx.createImageData(rw, rh);
    this.buf = new Uint32Array(this.img.data.buffer);
    this.zbuf = new Float32Array(rw);
    this.skyU = new Int32Array(rw);
    this.ctx.imageSmoothingEnabled = false;
    if (this.state !== "playing" && this.grid) this.render();
  }
  // ---------- Мир ----------
  solid(x, y) {
    const cx = Math.floor(x), cy = Math.floor(y);
    if (cx < 0 || cy < 0 || cx >= MW || cy >= MH) return true;
    return this.grid[cy * MW + cx] !== 0;
  }
  solidBox(x, y, r) {
    return this.solid(x - r, y - r) || this.solid(x + r, y - r) || this.solid(x - r, y + r) || this.solid(x + r, y + r);
  }
  moveBody(o, dx, dy, r) {
    if (!this.solidBox(o.x + dx, o.y, r)) o.x += dx;
    if (!this.solidBox(o.x, o.y + dy, r)) o.y += dy;
  }
  los(x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.ceil(d * 4);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (this.solid(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
    }
    return true;
  }
  castDist(a) {
    const rdx = Math.cos(a), rdy = Math.sin(a);
    let mx = Math.floor(this.px), my = Math.floor(this.py);
    const ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
    const sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
    let sdx = rdx < 0 ? (this.px - mx) * ddx : (mx + 1 - this.px) * ddx;
    let sdy = rdy < 0 ? (this.py - my) * ddy : (my + 1 - this.py) * ddy;
    let side = 0;
    for (let i = 0; i < 160; i++) {
      if (sdx < sdy) {
        sdx += ddx;
        mx += sx;
        side = 0;
      } else {
        sdy += ddy;
        my += sy;
        side = 1;
      }
      if (mx < 0 || my < 0 || mx >= MW || my >= MH || this.grid[my * MW + mx] > 0) break;
    }
    return { dist: side === 0 ? sdx - ddx : sdy - ddy, x: mx, y: my };
  }
  zoneAt(x, y) {
    const cx = Math.floor(x), cy = Math.floor(y);
    if (cx < 0 || cy < 0 || cx >= MW || cy >= MH) return 0;
    return this.world.zone[cy * MW + cx];
  }
  msg(text, t = 3) {
    this.msgs.push({ text, t });
    if (this.msgs.length > 4) this.msgs.shift();
  }
  stat(k, n = 1) {
    const s = this.data.progress.stats;
    s[k] = (s[k] || 0) + n;
  }
  statMax(k, v) {
    const s = this.data.progress.stats;
    if ((s[k] || 0) < v) s[k] = v;
  }
  // ---------- Обновление ----------
  update(dt) {
    this.time += dt;
    if (this.state === "dead") {
      this.deadT -= dt;
      this.hurtT = Math.max(0, this.hurtT - dt);
      if (this.deadT <= 0) {
        if (this.mode === "arena") this.openMenu("gameover");
        else this.respawn();
      }
      return;
    }
    this.run.time += dt;
    const s = this.data.settings;
    let turn = 0;
    if (this.keys.has("ArrowLeft")) turn -= 1;
    if (this.keys.has("ArrowRight")) turn += 1;
    this.pa += turn * 2.6 * dt + this.mdx * 26e-4 * s.sensitivity;
    this.mdx = 0;
    this.pa = (this.pa % TAU + TAU) % TAU;
    let f = 0, st2 = 0;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) f += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) f -= 1;
    if (this.keys.has("KeyD")) st2 += 1;
    if (this.keys.has("KeyA")) st2 -= 1;
    const runK = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") ? 1.6 : 1;
    const ca = Math.cos(this.pa), sa = Math.sin(this.pa);
    let mx = ca * f - sa * st2, my = sa * f + ca * st2;
    const ml = Math.hypot(mx, my);
    if (ml > 0) {
      mx /= ml;
      my /= ml;
      const sp = 3.3 * runK * dt * (this.run.speedMult || 1);
      const o = { x: this.px, y: this.py };
      this.moveBody(o, mx * sp, my * sp, 0.24);
      this.px = o.x;
      this.py = o.y;
      this.bob += dt * 9 * runK;
    }
    this.fireCd -= dt;
    this.fireT -= dt;
    this.laserT -= dt;
    if ((this.mouseDown || this.keys.has("Space")) && this.fireCd <= 0) this.fire();
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.pickupT = Math.max(0, this.pickupT - dt);
    this.zoneTitleT = Math.max(0, this.zoneTitleT - dt);
    this.doorMsgT -= dt;
    for (const m of this.msgs) m.t -= dt;
    this.msgs = this.msgs.filter((m) => m.t > 0);
    const z = this.zoneAt(this.px, this.py);
    if (z !== this.zone) this.enterZone(z);
    const cx = Math.floor(this.px), cy = Math.floor(this.py);
    for (let yy = cy - 3; yy <= cy + 3; yy++) for (let xx = cx - 3; xx <= cx + 3; xx++)
      if (xx >= 0 && yy >= 0 && xx < MW && yy < MH) this.explored[yy * MW + xx] = 1;
    this.updateDoors();
    this.updateItems();
    if (this.state !== "playing") return;
    if (this.mode === "linear") this.updateLinear(dt);
    this.updateEnemies(dt);
    this.updateProjs(dt);
    if (this.state === "playing" && this.mode === "arena") this.updateArena(dt);
    for (const p of this.parts) p.t += dt;
    this.parts = this.parts.filter((p) => p.t < p.life);
    this.updateHints();
    this.saveTimer += dt;
    if (this.saveTimer > 15) {
      this.saveTimer = 0;
      this.persist();
    }
    if ((this.time * 2 | 0) !== ((this.time - dt) * 2 | 0)) this.checkAch();
  }
  enterZone(z) {
    this.zone = z;
    if (this.mode !== "story") { this.zoneTitleT = 0; return; }
    this.zoneTitleT = 3.2;
    this.dmgInZone = false;
    if (!this.run.zones.includes(z)) this.run.zones.push(z);
    this.statMax("max_zones", this.run.zones.length);
    this.unlockLore("z_" + z);
    if (z === Z.CORE && !this.run.bossDead) {
      const b = this.enemies.find((e) => e.type === "boss" && !e.dead);
      if (b && !b.awake) {
        b.awake = true;
        this.bossAwake = true;
        this.sfx.play("boss");
        this.msg(tr("\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0430\u0435\u0442\u0441\u044F\u2026"), 4);
      }
    }
    this.checkAch();
  }
  updateDoors() {
    this.world.doors.forEach((d, i) => {
      if (this.run.doors.includes(i)) return;
      const dist = Math.hypot(d.x + 0.5 - this.px, d.y + 0.5 - this.py);
      if (dist > 1.7) return;
      if (this.run.shards.length >= d.need) {
        this.run.doors.push(i);
        this.grid[d.y * MW + d.x] = 0;
        this.navDirty = true;
        this.sfx.play("door");
        this.msg(tr`\u041F\u0435\u0447\u0430\u0442\u044C \u0441\u043D\u044F\u0442\u0430: \u043F\u0443\u0442\u044C \u0432 \xAB${ZONES[d.to].name}\xBB \u043E\u0442\u043A\u0440\u044B\u0442`, 4);
        this.persist();
      } else if (this.doorMsgT <= 0) {
        this.doorMsgT = 2.5;
        this.sfx.play("locked");
        this.msg(tr`\u0417\u0430\u043F\u0435\u0447\u0430\u0442\u0430\u043D\u043E. \u041D\u0443\u0436\u043D\u043E \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432: ${d.need} (\u0443 \u0432\u0430\u0441 ${this.run.shards.length})`, 2.5);
      }
    });
  }
  use() {
    const tx = this.px + Math.cos(this.pa) * 1.1, ty = this.py + Math.sin(this.pa) * 1.1;
    const cx = Math.floor(tx), cy = Math.floor(ty);
    const i = this.world.secrets.findIndex((s) => s.x === cx && s.y === cy);
    if (i >= 0 && !this.run.secrets.includes(i)) {
      this.run.secrets.push(i);
      this.grid[cy * MW + cx] = 0;
      this.navDirty = true;
      this.sfx.play("secret");
      this.msg(tr`\u041D\u0430\u0439\u0434\u0435\u043D \u0442\u0430\u0439\u043D\u0438\u043A! (${this.run.secrets.length}/3)`, 4);
      this.statMax("max_secrets", this.run.secrets.length);
      this.checkAch();
      this.persist();
    } else {
      this.sfx.play("click");
    }
  }
  updateHints() {
    this.hint = "";
    const tx = this.px + Math.cos(this.pa) * 1.1, ty = this.py + Math.sin(this.pa) * 1.1;
    const t = this.grid[Math.floor(ty) * MW + Math.floor(tx)];
    if (t >= T.SECRET_STONE && t <= T.SECRET_CRYSTAL) this.hint = tr("\u0417\u0434\u0435\u0441\u044C \u0442\u0440\u0435\u0449\u0438\u043D\u0430\u2026 [E] \u2014 \u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C");
    for (const d of this.decor) if (d.kind === "tomb" && Math.hypot(d.x - this.px, d.y - this.py) < 1.4) {
      this.hint = tr`\u041D\u0430\u0434\u0433\u0440\u043E\u0431\u0438\u0435: \xAB${d.text}\xBB \u2014 \u0443\u0434\u0430\u043B\u0435\u043D\u0430, \u043D\u0435 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u0430`;
    }
    this.target = null;
    let best = 0.25;
    const wd = this.castDist(this.pa).dist;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - this.px, dy = e.y - this.py, d = Math.hypot(dx, dy);
      if (d > 16 || d > wd + 0.3) continue;
      let da = Math.atan2(dy, dx) - this.pa;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      const w = Math.atan(EDEF[e.type].r / d) + 0.03;
      if (Math.abs(da) < w && Math.abs(da) < best) {
        best = Math.abs(da);
        this.target = e;
      }
    }
  }
  fire() {
    const w = WEAPONS[this.cur];
    if (w.ammo === "shells" && this.shells <= 0 || w.ammo === "energy" && this.energy <= 0) {
      this.msg(w.ammo === "shells" ? tr("\u041D\u0435\u0442 \u0441\u043A\u043E\u0431\u043E\u043A [[ ]] \u0434\u043B\u044F \u0434\u0440\u043E\u0431\u043E\u0432\u0438\u043A\u0430") : tr("\u041D\u0435\u0442 \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0434\u043B\u044F \u043B\u0430\u0437\u0435\u0440\u0430"), 1.5);
      this.fireCd = 0.4;
      this.sfx.play("click");
      this.cycleWeapon(1);
      return;
    }
    if (w.ammo === "shells") this.shells--;
    if (w.ammo === "energy") this.energy--;
    this.fireCd = w.cd;
    this.fireT = 0.09;
    if (this.cur === 2) this.laserT = 0.06;
    this.flashT = 0.06;
    this.sfx.play(w.sfx);
    for (let p = 0; p < w.pellets; p++) {
      const a = this.pa + (Math.random() - 0.5) * 2 * w.spread;
      const ray = this.castDist(a);
      let hit = null, crateHit = null, hd = ray.dist;
      for (const crate of this.crates) {
        if (crate.dead) continue;
        const dx = crate.x - this.px, dy = crate.y - this.py, d = Math.hypot(dx, dy);
        let da = Math.atan2(dy, dx) - a;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (d < hd && d < 30 && Math.abs(da) < Math.atan(0.3 / d) + 0.01) { crateHit = crate; hd = d; }
      }
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = e.x - this.px, dy = e.y - this.py, d = Math.hypot(dx, dy);
        if (d > hd || d > 30) continue;
        let da = Math.atan2(dy, dx) - a;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < Math.atan(EDEF[e.type].r / d) + 0.01) {
          hit = e;
          crateHit = null;
          hd = d;
        }
      }
      const pd = hit || crateHit ? hd - 0.2 : ray.dist - 0.05;
      const damage = w.dmg * (this.run.damageMult || 1) * (this.cur === 0 && hd < 1.3 ? 2 : 1);
      if (hit) this.damageEnemy(hit, damage);
      if (crateHit) { crateHit.hp -= damage; if (crateHit.hp <= 0) this.breakCrate(crateHit); }
      if (hit || crateHit || p < 3) this.parts.push({ x: this.px + Math.cos(a) * pd, y: this.py + Math.sin(a) * pd, z: 0.45, t: 0, life: 0.25 });
    }
    for (const e of this.enemies) if (!e.dead && e.type !== "boss" && Math.hypot(e.x - this.px, e.y - this.py) < 7) e.awake = true;
  }
  damageEnemy(e, dmg) {
    e.hp -= dmg;
    e.flash = 0.1;
    e.awake = true;
    this.sfx.play("hit");
    if (e.hp <= 0 && !e.dead) this.killEnemy(e);
  }
  killEnemy(e) {
    e.dead = true;
    e.deathT = 0;
    this.sfx.play("edeath");
    this.run.kills++;
    this.stat("kills");
    this.stat("k_" + e.type);
    if (this.cur === 0) this.stat("k_quill");
    if (e.spawnId >= 0) this.run.deadSpawns.push(e.spawnId);
    this.unlockLore("st_rot");
    const bmap = { orphan: "b_orphan", glitch: "b_glitch", dup: "b_dup", copy: "b_dup", spam: "b_spam", boss: "b_boss" };
    this.unlockLore(bmap[e.type]);
    if (e.type === "dup") {
      this.sfx.play("split");
      for (let k = 0; k < 2; k++) {
        const c = this.makeEnemy("copy", e.x, e.y, -1, 0, e.uid);
        const a = Math.random() * TAU;
        this.moveBody(c, Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.25);
        c.awake = true;
        this.enemies.push(c);
      }
      this.msg(tr("\u0414\u0443\u0431\u043B\u0438\u043A\u0430\u0442 \u0440\u0430\u0441\u043F\u0430\u043B\u0441\u044F \u043D\u0430 \u0434\u0432\u0435 \u041A\u043E\u043F\u0438\u0438!"), 2);
    }
    if (e.type === "copy" && e.parent) {
      const n = (this.dupKills.get(e.parent) || 0) + 1;
      this.dupKills.set(e.parent, n);
      if (n >= 2) this.data.progress.stats.dedup = 1;
    }
    if (e.type === "boss") {
      if (this.mode !== "story") {
        this.bossAwake = false;
        for (const m of this.enemies) if (m.summoned && !m.dead) { m.dead = true; m.deathT = 0; }
        if (this.mode === "linear") this.finishLinear();
        else { this.msg(tr("Босс повержен!"), 3); this.checkAch(); this.persist(); }
        return;
      }
      this.run.bossDead = true;
      this.bossAwake = false;
      this.data.progress.stats.k_boss = 1;
      this.items.push({ id: -1, kind: "shard", x: e.x, y: e.y, taken: false, shard: 6 });
      this.msg(tr("\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u0432\u0435\u0440\u0436\u0435\u043D\u0430! \u041F\u043E\u0434\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A."), 6);
      for (const m of this.enemies) if (m.summoned && !m.dead) {
        m.dead = true;
        m.deathT = 0;
      }
      this.persist();
    } else if (!e.summoned) {
      const r = Math.random();
      if (r < 0.12) this.items.push({ id: -1, kind: "health", x: e.x, y: e.y, taken: false });
      else if (r < 0.32 && (this.weapons[1] || this.weapons[2])) {
        const kind = this.weapons[2] && (!this.weapons[1] || Math.random() < 0.5) ? "energy" : "shells";
        this.items.push({ id: -1, kind, x: e.x, y: e.y, taken: false });
      }
    }
    this.checkAch();
  }
  hurt(n) {
    if (this.state !== "playing") return;
    if (this.godMode) {
      this.hurtT = 0.15;
      return;
    }
    const waveScale = this.mode === "arena" ? 1 + 0.08 * Math.max(0, this.run.wave - 1) : 1;
    const dmg = Math.max(1, Math.round(n * this.diff().dmg * waveScale));
    this.hp -= dmg;
    this.hurtT = 0.35;
    this.dmgInZone = true;
    this.sfx.play("hurt");
    if (this.hp <= 10 && this.hp > 0) this.lowHp = true;
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = "dead";
      this.deadT = 3;
      this.run.deaths++;
      this.stat("deaths");
      this.mouseDown = false;
      if (this.mode === "arena") this.finishArena();
    }
  }
  respawn() {
    let pos;
    if (this.mode !== "story") pos = this.world.start;
    else if (this.zone === Z.CORE) pos = { x: 32.5, y: 26.5 };
    else if (this.zone <= Z.ARCHIVE) pos = this.world.start;
    else {
      const a = this.world.anchors[this.zone];
      pos = { x: a.x + 0.5, y: a.y + 0.5 };
    }
    this.px = pos.x;
    this.py = pos.y;
    this.hp = this.run.maxHp;
    this.shells = Math.max(this.shells, this.weapons[1] ? 8 : 0);
    this.energy = Math.max(this.energy, this.weapons[2] ? 40 : 0);
    this.projs = [];
    this.state = "playing";
    this.lowHp = false;
    for (const e of this.enemies) if (!e.dead && Math.hypot(e.x - this.px, e.y - this.py) < 6) e.awake = false;
    const b = this.enemies.find((e) => e.type === "boss" && !e.dead);
    if (b) {
      b.awake = false;
      b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.25);
      if (this.mode === "story") { b.x = 35.5; b.y = 36.5; }
      this.bossAwake = false;
    }
    for (const m of this.enemies) if (m.summoned && !m.dead) {
      m.dead = true;
      m.deathT = 99;
    }
    this.zone = -1;
    this.msg(tr("\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0438\u0437 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0439 \u043A\u043E\u043F\u0438\u0438"), 3);
    this.persist();
  }
  updateItems() {
    for (const it of this.items) {
      if (it.taken) continue;
      if (Math.hypot(it.x - this.px, it.y - this.py) > 0.6) continue;
      let ok = true;
      switch (it.kind) {
        case "health": {
          if (this.hp >= this.run.maxHp) {
            ok = false;
            break;
          }
          const v = it.id < 0 ? 15 : 25;
          this.hp = Math.min(this.run.maxHp, this.hp + v);
          if (this.lowHp) {
            this.data.progress.stats.low_hp = 1;
            this.lowHp = false;
          }
          this.msg(tr`+${v} HP \u2014 \u0447\u0438\u0441\u0442\u0430\u044F \u0437\u0430\u043C\u0435\u0442\u043A\u0430`, 2);
          break;
        }
        case "shells":
          if (this.shells >= 60) {
            ok = false;
            break;
          }
          this.shells = Math.min(60, this.shells + 6);
          this.msg(tr("+6 \u0441\u043A\u043E\u0431\u043E\u043A [[ ]]"), 2);
          break;
        case "energy":
          if (this.energy >= 300) {
            ok = false;
            break;
          }
          this.energy = Math.min(300, this.energy + 60);
          this.msg(tr("+60 \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0433\u0440\u0430\u0444\u0430"), 2);
          break;
        case "shotgun":
          this.weapons[1] = true;
          this.shells += 12;
          this.cur = 1;
          this.data.progress.stats.got_shotgun = 1;
          this.msg(tr("\u041F\u043E\u043B\u0443\u0447\u0435\u043D Wikilink-\u0434\u0440\u043E\u0431\u043E\u0432\u0438\u043A! [2]"), 4);
          this.sfx.play("weapon");
          break;
        case "laser":
          this.weapons[2] = true;
          this.energy += 100;
          this.cur = 2;
          this.data.progress.stats.got_laser = 1;
          this.msg(tr("\u041F\u043E\u043B\u0443\u0447\u0435\u043D \u0413\u0440\u0430\u0444-\u043B\u0430\u0437\u0435\u0440! [3]"), 4);
          this.sfx.play("weapon");
          break;
        case "page": {
          const l = LORE.find((x) => x.id === it.page);
          this.unlockLore(it.page, false);
          this.msg(tr`\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430: \xAB${l ? l.title : ""}\xBB \u2014 \u0447\u0438\u0442\u0430\u0442\u044C \u0432 \u041A\u043E\u0434\u0435\u043A\u0441\u0435 (Esc)`, 5);
          this.toast("\u{1F4DC}", tr("\u041A\u043E\u0434\u0435\u043A\u0441: \u043D\u043E\u0432\u0430\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430"), l ? l.title : "");
          this.sfx.play("page");
          break;
        }
        case "shard": {
          if (!this.run.shards.includes(it.shard)) this.run.shards.push(it.shard);
          this.statMax("max_shards", this.run.shards.length);
          if (!this.dmgInZone) this.data.progress.stats.nodmg_shard = 1;
          this.sfx.play("shard");
          const n = this.run.shards.length;
          this.msg(tr`\u041E\u0441\u043A\u043E\u043B\u043E\u043A \u043E\u0431\u0441\u0438\u0434\u0438\u0430\u043D\u0430! ${n}/7`, 4);
          this.pickupT = 0.4;
          if (n >= 7) {
            it.taken = true;
            this.win();
            return;
          }
          break;
        }
      }
      if (!ok) continue;
      it.taken = true;
      this.pickupT = Math.max(this.pickupT, 0.25);
      if (it.kind === "health" || it.kind === "shells" || it.kind === "energy") this.sfx.play("pickup");
      if (it.id >= 0) this.run.taken.push(it.id);
      if (it.kind === "shard" || it.kind === "page" || it.kind === "shotgun" || it.kind === "laser") {
        this.checkAch();
        this.persist();
      }
    }
    this.items = this.items.filter((it) => !(it.taken && it.id < 0));
  }
  win() {
    const first = !this.run.won;
    this.run.won = true;
    this.data.progress.arenaUnlocked = true;
    if (first) {
      this.stat("wins");
      if (this.run.time < 1200) this.data.progress.stats.speed = 1;
      if (this.run.deaths === 0) this.data.progress.stats.flawless = 1;
      const best = this.data.progress.stats.best_time || 0;
      if (!best || this.run.time < best) this.data.progress.stats.best_time = Math.round(this.run.time);
    }
    this.unlockLore("st_epilogue", false);
    this.sfx.play("win");
    this.checkAch();
    if (first) {
      try {
        this.opts.onRunEnd?.("story", { kills: this.run.kills, time: this.run.time });
      } catch (e) { console.warn("[HELLVAULT] OBSIGAMA run callback", e); }
    }
    this.persist();
    this.openMenu("win");
  }
  updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) {
        e.deathT += dt;
        continue;
      }
      const d = EDEF[e.type];
      e.anim += dt;
      e.flash = Math.max(0, e.flash - dt);
      e.cd -= dt;
      e.atkT = Math.max(0, e.atkT - dt);
      const dx = this.px - e.x, dy = this.py - e.y, dist = Math.hypot(dx, dy);
      if (dist > 22 && e.type !== "boss" && this.mode === "story") continue;
      const sees = dist < d.sight && this.los(e.x, e.y, this.px, this.py);
      if (e.type === "boss") {
        if (e.awake && this.state === "playing") this.bossAI(e, dt, dist, sees);
        continue;
      }
      if (sees) e.awake = true;
      const ux = dx / (dist || 1), uy = dy / (dist || 1);
      let sp = d.speed * dt;
      if (!e.awake) {
        if (e.type === "orphan" || e.type === "dup") {
          e.wander += (Math.random() - 0.5) * dt * 2;
          const o = { x: e.x, y: e.y };
          this.moveBody(o, Math.cos(e.wander) * sp * 0.4, Math.sin(e.wander) * sp * 0.4, d.r);
          if (o.x === e.x && o.y === e.y) e.wander += 1.5;
          e.x = o.x;
          e.y = o.y;
        }
        continue;
      }
      if (!sees && dist > 1) {
        this.chaseAroundWalls(e, sp, d.r);
        continue;
      }
      if (e.type === "spam") {
        let mvx = 0, mvy = 0;
        if (dist < 4) {
          mvx = -ux;
          mvy = -uy;
        } else if (dist > 7 || !sees) {
          mvx = ux;
          mvy = uy;
        } else {
          mvx = -uy * Math.sin(e.anim);
          mvy = ux * Math.sin(e.anim);
          sp *= 0.6;
        }
        const o = { x: e.x, y: e.y };
        this.moveBody(o, mvx * sp, mvy * sp, d.r);
        if (!sees && Math.abs(o.x - e.x) + Math.abs(o.y - e.y) < sp * 0.3) this.moveBody(o, -uy * sp, ux * sp, d.r);
        e.x = o.x;
        e.y = o.y;
        e.shootT -= dt;
        if (sees && e.shootT <= 0 && dist < d.range) {
          e.shootT = d.cd + Math.random() * 0.6;
          e.atkT = 0.3;
          this.projs.push({ x: e.x, y: e.y, vx: ux * 5.5, vy: uy * 5.5, dmg: d.dmg, kind: "spamShot", life: 4 });
          if (dist < 12) this.sfx.play("eshot");
        }
        continue;
      }
      if (e.type === "glitch") {
        e.tpT -= dt;
        if (e.tpT <= 0 && sees && dist > 2.5) {
          e.tpT = 2 + Math.random() * 2;
          const a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2.2;
          const r = 1.6 + Math.random() * 1.4;
          const nx = e.x + Math.cos(a) * r, ny = e.y + Math.sin(a) * r;
          if (!this.solidBox(nx, ny, d.r) && this.los(e.x, e.y, nx, ny)) {
            this.parts.push({ x: e.x, y: e.y, z: 0.4, t: 0, life: 0.3 });
            e.x = nx;
            e.y = ny;
            if (dist < 10) this.sfx.play("tp");
          }
        }
      }
      if (dist > d.range * 0.8) {
        const o = { x: e.x, y: e.y };
        this.moveBody(o, ux * sp, uy * sp, d.r);
        if (Math.abs(o.x - e.x) + Math.abs(o.y - e.y) < sp * 0.4) {
          this.chaseAroundWalls(o, sp, d.r);
        }
        e.x = o.x;
        e.y = o.y;
      }
      if (dist < d.range && e.cd <= 0 && sees) {
        e.cd = d.cd;
        e.atkT = 0.25;
        this.hurt(d.dmg);
      }
    }
    const near = this.enemies.filter((e) => !e.dead && Math.abs(e.x - this.px) < 12 && Math.abs(e.y - this.py) < 12);
    for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
      const a = near[i], b = near[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      const min = (EDEF[a.type].r + EDEF[b.type].r) * 0.9;
      if (d < min && d > 1e-3) {
        const push = (min - d) * 0.5;
        this.moveBody(a, -dx / d * push, -dy / d * push, EDEF[a.type].r);
        this.moveBody(b, dx / d * push, dy / d * push, EDEF[b.type].r);
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead || e.deathT < 0.6);
  }
  bossAI(e, dt, dist, sees) {
    const d = EDEF.boss;
    const frac = e.hp / e.maxHp;
    const phase = frac > 0.6 ? 1 : frac > 0.25 ? 2 : 3;
    const ux = (this.px - e.x) / (dist || 1), uy = (this.py - e.y) / (dist || 1);
    const sp = d.speed * (0.8 + phase * 0.2) * dt;
    if (dist > 2) {
      if (sees) this.moveBody(e, ux * sp, uy * sp, d.r);
      else this.chaseAroundWalls(e, sp, d.r);
    }
    if (dist < d.range && sees && e.cd <= 0) {
      e.cd = d.cd;
      e.atkT = 0.3;
      this.hurt(d.dmg);
    }
    e.shootT -= dt;
    const shoot = (a, v = 4.2) => this.projs.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, dmg: 12, kind: "voidShot", life: 6 });
    const aim = Math.atan2(this.py - e.y, this.px - e.x);
    if (e.shootT <= 0 && sees) {
      e.atkT = 0.4;
      this.sfx.play("void");
      if (phase === 1) {
        e.shootT = 1.6;
        for (let k = -1; k <= 1; k++) shoot(aim + k * 0.16);
      } else if (phase === 2) {
        e.shootT = 2.1;
        for (let k = 0; k < 14; k++) shoot(aim + k / 14 * TAU, 3.4);
        shoot(aim, 5);
      } else {
        e.shootT = 1.1;
        for (let k = -2; k <= 2; k++) shoot(aim + k * 0.12, 5);
      }
    }
    if (phase >= 2) {
      e.summonT -= dt;
      const alive = this.enemies.filter((m) => m.summoned && !m.dead).length;
      if (e.summonT <= 0 && alive < 6) {
        e.summonT = 9;
        for (let k = 0; k < 2; k++) {
          const a = Math.random() * TAU;
          const nx = e.x + Math.cos(a) * 1.8, ny = e.y + Math.sin(a) * 1.8;
          if (this.solidBox(nx, ny, 0.3)) continue;
          const m = this.makeEnemy(phase === 3 ? "glitch" : "orphan", nx, ny, -1, k);
          m.awake = true;
          m.summoned = true;
          this.enemies.push(m);
        }
        this.msg(tr("\u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0437\u0430\u0431\u044B\u0442\u044B\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438!"), 2);
      }
    }
    if (phase === 3) {
      e.tpT -= dt;
      if (e.tpT <= 0) {
        e.tpT = 4;
        for (let k = 0; k < 10; k++) {
          const point = this.mode === "story" ? { x: 30 + Math.random() * 12, y: 30 + Math.random() * 12 } : this.spawnPoint(d.r, 3, 13);
          if (!point) break;
          const nx = point.x, ny = point.y;
          if (!this.solidBox(nx, ny, d.r) && Math.hypot(nx - this.px, ny - this.py) > 3) {
            this.parts.push({ x: e.x, y: e.y, z: 0.6, t: 0, life: 0.4 });
            e.x = nx;
            e.y = ny;
            this.sfx.play("tp");
            break;
          }
        }
      }
    }
  }
  updateProjs(dt) {
    for (const p of this.projs) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (this.solid(p.x, p.y)) {
        p.life = 0;
        this.parts.push({ x: p.x - p.vx * dt, y: p.y - p.vy * dt, z: 0.45, t: 0, life: 0.2 });
        continue;
      }
      if (Math.hypot(p.x - this.px, p.y - this.py) < 0.38) {
        p.life = 0;
        this.hurt(p.dmg);
      }
    }
    this.projs = this.projs.filter((p) => p.life > 0);
  }
  // ---------- Достижения и кодекс ----------
  checkAch() {
    const p = this.data.progress;
    let any = false;
    for (const a of ACHIEVEMENTS) {
      if (p.achievements[a.id]) continue;
      if (a.value(p) >= a.target) {
        p.achievements[a.id] = Date.now();
        this.toast(a.icon, tr("\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435: ") + a.title, a.desc, true);
        any = true;
      }
    }
    if (any) {
      this.sfx.play("ach");
      this.persist();
    }
  }
  unlockLore(id, toast = true) {
    const p = this.data.progress;
    if (p.lore.includes(id)) return;
    p.lore.push(id);
    const l = LORE.find((x) => x.id === id);
    if (toast && l) this.toast("\u{1F4D6}", tr("\u041A\u043E\u0434\u0435\u043A\u0441: \u043D\u043E\u0432\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C"), l.title);
  }
  toast(icon, title, desc, gold = false) {
    const t = el("div", "vs-toast" + (gold ? " vs-toast-gold" : ""), void 0, this.toasts);
    el("div", "vs-toast-icon", icon, t);
    const b = el("div", "vs-toast-body", void 0, t);
    el("div", "vs-toast-title", title, b);
    el("div", "vs-toast-desc", desc, b);
    while (this.toasts.children.length > 4) this.toasts.firstElementChild?.remove();
    this.timeouts.push(window.setTimeout(() => t.classList.add("vs-hide"), 4200));
    this.timeouts.push(window.setTimeout(() => t.remove(), 4800));
  }
  // ---------- Рендер ----------
  render() {
    if (!this.img || !this.grid) return;
    this.renderScene();
    this.lowCtx.putImageData(this.img, 0, 0);
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.low, 0, 0, this.W, this.H);
    if (this.state === "playing" || this.state === "dead") {
      this.drawWeapon();
      this.drawHud();
    }
  }
  renderScene() {
    const w = this.rw, h = this.rh, buf = this.buf, zb = this.zbuf;
    const px = this.px, py = this.py;
    const dirX = Math.cos(this.pa), dirY = Math.sin(this.pa);
    const plX = -dirY * FOV, plY = dirX * FOV;
    const zd = ZONES[Math.max(0, this.zoneAt(px, py))];
    const k = this.zone < 0 ? 1 : 0.04;
    this.fog = [this.fog[0] + (zd.fog[0] - this.fog[0]) * k, this.fog[1] + (zd.fog[1] - this.fog[1]) * k, this.fog[2] + (zd.fog[2] - this.fog[2]) * k];
    this.dens += (zd.density - this.dens) * k;
    const fr = this.fog[0], fg = this.fog[1], fb = this.fog[2];
    const dens = this.dens;
    const light = 1 + this.flashT * 4;
    const half = h / 2;
    const zone = this.world.zone, grid = this.grid;
    const floors = this.art.floors, ceils = this.art.ceils, skies = this.art.skies;
    const skyU = this.skyU;
    for (let x = 0; x < w; x++) {
      const camX = 2 * x / w - 1;
      let a = this.pa + Math.atan(camX * FOV);
      a = (a % TAU + TAU) % TAU;
      skyU[x] = a / TAU * 1024 & 511;
    }
    const rx0 = dirX - plX, ry0 = dirY - plY, rx1 = dirX + plX, ry1 = dirY + plY;
    for (let y = 0; y < h; y++) {
      const isFloor = y >= half;
      const p = isFloor ? y - half + 0.5 : half - y - 0.5;
      const rowDist = 0.5 * h / p;
      const fe = Math.exp(-rowDist * dens);
      const fl = fe * light * (isFloor ? 0.9 : 0.75);
      const fo = 1 - fe;
      const ar = fr * fo, ag = fg * fo, ab = fb * fo;
      const sx = rowDist * (rx1 - rx0) / w, sy = rowDist * (ry1 - ry0) / w;
      let fx = px + rowDist * rx0, fy = py + rowDist * ry0;
      const skyV = Math.min(127, y / half * 128 | 0);
      let o = y * w;
      for (let x = 0; x < w; x++, o++, fx += sx, fy += sy) {
        const cx = Math.floor(fx), cy = Math.floor(fy);
        const z = cx >= 0 && cy >= 0 && cx < MW && cy < MH ? zone[cy * MW + cx] : 4;
        let c;
        const u = (fx - cx) * 32 | 0, v = (fy - cy) * 32 | 0;
        if (isFloor) {
          c = floors[z].d[(v & 31) * 32 + (u & 31)];
        } else {
          const t = ceils[z];
          if (!t) {
            const sk = skies[ZONES[z].sky];
            const sc = sk.d[skyV * 512 + skyU[x]];
            const hz = y / half;
            const m = hz > 0.85 ? (hz - 0.85) / 0.15 * 0.6 : 0;
            if (m > 0) {
              const r0 = (sc & 255) * (1 - m) + fr * m, g0 = (sc >> 8 & 255) * (1 - m) + fg * m, b0 = (sc >> 16 & 255) * (1 - m) + fb * m;
              buf[o] = 4278190080 | (b0 | 0) << 16 | (g0 | 0) << 8 | (r0 | 0);
            } else buf[o] = sc;
            continue;
          }
          c = t.d[(v & 31) * 32 + (u & 31)];
        }
        let r = (c & 255) * fl + ar, g = (c >> 8 & 255) * fl + ag, b = (c >> 16 & 255) * fl + ab;
        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;
        buf[o] = 4278190080 | b << 16 | g << 8 | r;
      }
    }
    const tshift = this.time * 30 | 0;
    for (let x = 0; x < w; x++) {
      const camX = 2 * x / w - 1;
      const rdx = dirX + plX * camX, rdy = dirY + plY * camX;
      let mx = Math.floor(px), my = Math.floor(py);
      const ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
      const stx = rdx < 0 ? -1 : 1, sty = rdy < 0 ? -1 : 1;
      let sdx = rdx < 0 ? (px - mx) * ddx : (mx + 1 - px) * ddx;
      let sdy = rdy < 0 ? (py - my) * ddy : (my + 1 - py) * ddy;
      let side = 0, t = 7;
      for (let i = 0; i < 160; i++) {
        if (sdx < sdy) {
          sdx += ddx;
          mx += stx;
          side = 0;
        } else {
          sdy += ddy;
          my += sty;
          side = 1;
        }
        if (mx < 0 || my < 0 || mx >= MW || my >= MH) {
          t = 7;
          break;
        }
        t = grid[my * MW + mx];
        if (t > 0) break;
      }
      const perp = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy);
      if (perp < 12 && mx >= 0 && my >= 0 && mx < MW && my < MH) this.explored[my * MW + mx] = 1;
      zb[x] = perp;
      let wx = side === 0 ? py + perp * rdy : px + perp * rdx;
      wx -= Math.floor(wx);
      const tex2 = this.art.walls[t] || this.art.walls[7];
      let tx = wx * 64 | 0;
      if (side === 0 && rdx > 0 || side === 1 && rdy < 0) tx = 63 - tx;
      const lineH = h / perp;
      const start = half - lineH / 2;
      const y0 = Math.max(0, Math.ceil(start)), y1 = Math.min(h, Math.ceil(start + lineH));
      const step = 64 / lineH;
      let tp = (y0 - start) * step;
      const emissive = t === 4 || t === 16 || t >= 10 && t <= 13;
      const fe = Math.exp(-perp * dens * (emissive ? 0.45 : 1));
      const fl = fe * light * (side ? 0.78 : 1);
      const fo = 1 - fe;
      const ar = fr * fo, ag = fg * fo, ab = fb * fo;
      const gl = t === 5;
      const d = tex2.d;
      for (let y = y0; y < y1; y++) {
        const ty = (tp | 0) + (gl ? tshift : 0) & 63;
        tp += step;
        const c = d[ty * 64 + (gl ? tx + (ty * 7 + tshift & 7) & 63 : tx)];
        let r = (c & 255) * fl + ar, g = (c >> 8 & 255) * fl + ag, b = (c >> 16 & 255) * fl + ab;
        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;
        buf[y * w + x] = 4278190080 | b << 16 | g << 8 | r;
      }
    }
    const list = [];
    const add = (x, y, tex2, size, z, flash = false) => {
      const dx = x - px, dy = y - py;
      const d = dx * dx + dy * dy;
      if (d > 900) return;
      list.push({ x, y, tex: tex2, size, z, flash, d });
    };
    const S = this.art.spr;
    const tm = this.time;
    for (const d of this.decor) {
      if (Math.abs(d.x - px) > 30 || Math.abs(d.y - py) > 30) continue;
      switch (d.kind) {
        case "lamp":
          add(d.x, d.y, S.lamp[(tm * 6 + d.x | 0) % 2], 0.55, 0);
          break;
        case "books":
          add(d.x, d.y, S.books[0], 0.22, 0);
          break;
        case "tree":
          add(d.x, d.y, S.tree[0], 1.15, 0);
          break;
        case "tomb":
          add(d.x, d.y, d.tex, 0.42, 0);
          break;
        case "node":
          add(d.x, d.y, S.node[(tm * 3 + d.y | 0) % 2], 0.28, 0.45 + Math.sin(tm * 2 + d.x) * 0.08);
          break;
        case "rubble":
          add(d.x, d.y, S.rubble[0], 0.2, 0);
          break;
        case "spire":
          add(d.x, d.y, S.spire[(tm * 2 + d.x | 0) % 2], 0.95, 0);
          break;
      }
    }
    for (const it of this.items) {
      if (it.taken) continue;
      const bobz = Math.sin(tm * 3 + it.x * 2) * 0.04;
      switch (it.kind) {
        case "shard":
          add(it.x, it.y, S.shard[(tm * 4 | 0) % 2], 0.42, 0.18 + bobz * 2);
          break;
        case "page":
          add(it.x, it.y, S.page[0], 0.26, 0.12 + bobz);
          break;
        case "health":
          add(it.x, it.y, S.health[0], 0.26, 0.02 + bobz);
          break;
        case "shells":
          add(it.x, it.y, S.shells[0], 0.24, 0.02 + bobz);
          break;
        case "energy":
          add(it.x, it.y, S.energy[0], 0.26, 0.02 + bobz);
          break;
        case "shotgun":
          add(it.x, it.y, S.shotgun[0], 0.2, 0.15 + bobz);
          break;
        case "laser":
          add(it.x, it.y, S.laser[0], 0.45, 0.1 + bobz);
          break;
      }
    }
    for (const crate of this.crates) if (!crate.dead) add(crate.x, crate.y, S.crate[0], 0.65, 0);
    for (const e of this.enemies) {
      const def = EDEF[e.type];
      if (e.dead) {
        if (e.deathT < 0.6) add(e.x, e.y, S.puff[Math.min(2, e.deathT * 5 | 0)], def.size * 0.8, def.z + 0.1);
        continue;
      }
      const fr2 = e.atkT > 0 ? 2 : (e.anim * (e.type === "glitch" ? 10 : 4) | 0) % 2;
      let z = def.z;
      if (e.type === "orphan") z += Math.sin(e.anim * 3) * 0.04;
      if (e.type === "glitch") z += Math.sin(e.anim * 9) * 0.05;
      add(e.x, e.y, S[e.type][fr2], def.size, z, e.flash > 0);
    }
    for (const p of this.projs) add(p.x, p.y, S[p.kind][0], p.kind === "voidShot" ? 0.3 : 0.18, 0.4);
    for (const p of this.parts) add(p.x, p.y, S.puff[Math.min(2, p.t / p.life * 3 | 0)], 0.22, p.z - 0.1);
    list.sort((a, b) => b.d - a.d);
    const invDet = 1 / (plX * dirY - dirX * plY);
    for (const s of list) {
      const dx = s.x - px, dy = s.y - py;
      const tX = invDet * (dirY * dx - dirX * dy);
      const tY = invDet * (-plY * dx + plX * dy);
      if (tY <= 0.12) continue;
      const scx = w / 2 * (1 + tX / tY);
      const lineH = h / tY;
      const sh = lineH * s.size, sw = sh * s.tex.w / s.tex.h;
      const bottom = half + lineH / 2 - s.z * lineH;
      const top = bottom - sh;
      const left = scx - sw / 2;
      const x0 = Math.max(0, Math.ceil(left)), x1 = Math.min(w, Math.ceil(left + sw));
      const yA = Math.max(0, Math.ceil(top)), yB = Math.min(h, Math.ceil(bottom));
      if (x0 >= x1 || yA >= yB) continue;
      const fe = Math.exp(-tY * dens);
      const fl = fe * light;
      const fo = 1 - fe;
      const ar = fr * fo, ag = fg * fo, ab = fb * fo;
      const tw = s.tex.w, th = s.tex.h, d = s.tex.d;
      for (let x = x0; x < x1; x++) {
        if (tY >= zb[x]) continue;
        const tx = Math.min(tw - 1, (x - left) / sw * tw | 0);
        for (let y = yA; y < yB; y++) {
          const ty = Math.min(th - 1, (y - top) / sh * th | 0);
          const c = d[ty * tw + tx];
          if (!c) continue;
          let r, g, b;
          if (s.flash) {
            r = 255;
            g = 255;
            b = 255;
          } else {
            r = (c & 255) * fl + ar;
            g = (c >> 8 & 255) * fl + ag;
            b = (c >> 16 & 255) * fl + ab;
          }
          if (r > 255) r = 255;
          if (g > 255) g = 255;
          if (b > 255) b = 255;
          buf[y * w + x] = 4278190080 | b << 16 | g << 8 | r;
        }
      }
    }
  }
  drawWeapon() {
    if (this.state === "dead" || this.mapOpen) return;
    const ctx = this.ctx, W = this.W, H = this.H;
    const wpn = this.art.weapons[this.cur];
    const img = this.fireT > 0 ? wpn.fire : wpn.idle;
    const wh = H * 0.42, ww = wh * img.width / img.height;
    const bx = Math.sin(this.bob) * W * 0.012, by = Math.abs(Math.cos(this.bob)) * H * 0.012;
    const recoil = this.fireT > 0 ? H * 0.03 : 0;
    const x = W / 2 - ww / 2 + bx + W * 0.06, y = H - wh + by + recoil + H * 0.02;
    if (this.laserT > 0) {
      const sx = x + ww / 2, sy = y + wh * 0.15;
      ctx.strokeStyle = "rgba(139,92,246,0.6)";
      ctx.lineWidth = Math.max(4, H * 0.018);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(W / 2, H / 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(165,243,252,0.95)";
      ctx.lineWidth = Math.max(2, H * 7e-3);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(W / 2, H / 2);
      ctx.stroke();
    }
    ctx.drawImage(img, x, y, ww, wh);
  }
  drawHud() {
    const ctx = this.ctx, W = this.W, H = this.H;
    const k = Math.max(0.7, Math.min(2, Math.min(H / 600, W / 900)));
    const font = (s, bold = true) => `${bold ? "bold " : ""}${Math.round(s * k)}px ui-monospace, "JetBrains Mono", Consolas, monospace`;
    ctx.textBaseline = "middle";
    if (this.hurtT > 0) {
      const g2 = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8);
      g2.addColorStop(0, "rgba(200,0,40,0)");
      g2.addColorStop(1, `rgba(200,0,40,${Math.min(0.7, this.hurtT * 2)})`);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.pickupT > 0) {
      ctx.fillStyle = `rgba(200,160,255,${this.pickupT * 0.5})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.state === "dead") {
      ctx.fillStyle = "rgba(20,0,10,0.72)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff5c8a";
      ctx.font = font(34);
      ctx.fillText(tr("\u0417\u0410\u041C\u0415\u0422\u041A\u0410 \u041F\u041E\u0412\u0420\u0415\u0416\u0414\u0415\u041D\u0410"), W / 2, H / 2 - 20 * k);
      ctx.fillStyle = "#e9d5ff";
      ctx.font = font(16, false);
      ctx.fillText(this.mode === "arena" ? tr("Забег завершён…") : tr("Восстановление из резервной копии…"), W / 2, H / 2 + 20 * k);
      return;
    }
    if (this.mapOpen) {
      this.drawMap();
      return;
    }
    ctx.fillStyle = this.target ? "#ff6b9a" : "rgba(233,213,255,0.9)";
    const c = 6 * k;
    ctx.fillRect(W / 2 - c, H / 2 - 1, c * 2, 2);
    ctx.fillRect(W / 2 - 1, H / 2 - c, 2, c * 2);
    ctx.textAlign = "center";
    if (this.target) {
      ctx.font = font(13);
      ctx.fillStyle = "#ffd1e1";
      ctx.fillText(this.target.name, W / 2, H / 2 + 22 * k);
      const f = Math.max(0, this.target.hp / this.target.maxHp);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(W / 2 - 30 * k, H / 2 + 32 * k, 60 * k, 4 * k);
      ctx.fillStyle = "#ff4d7d";
      ctx.fillRect(W / 2 - 30 * k, H / 2 + 32 * k, 60 * k * f, 4 * k);
    }
    if (this.hint) {
      ctx.font = font(14);
      const tw = ctx.measureText(this.hint).width + 18 * k;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(W / 2 - tw / 2, H * 0.62 - 12 * k, tw, 24 * k);
      ctx.fillStyle = "#fde68a";
      ctx.fillText(this.hint, W / 2, H * 0.62);
    }
    const bh = 58 * k;
    const g = ctx.createLinearGradient(0, H - bh, 0, H);
    g.addColorStop(0, "rgba(16,8,30,0.0)");
    g.addColorStop(0.35, "rgba(16,8,30,0.82)");
    g.addColorStop(1, "rgba(10,4,20,0.95)");
    ctx.fillStyle = g;
    ctx.fillRect(0, H - bh, W, bh);
    const yb = H - bh * 0.4;
    ctx.textAlign = "left";
    ctx.font = font(24);
    ctx.fillStyle = this.hp > 50 ? "#86efac" : this.hp > 25 ? "#fde047" : "#ff5c8a";
    ctx.fillText(`\u2665 ${Math.max(0, Math.ceil(this.hp))}`, 16 * k, yb);
    const w = WEAPONS[this.cur];
    const ammo = w.ammo === "shells" ? `${this.shells}` : w.ammo === "energy" ? `${this.energy}` : "\u221E";
    ctx.fillStyle = "#e9d5ff";
    ctx.font = font(13);
    ctx.fillText(`[${this.cur + 1}] ${w.name}`, 124 * k, yb - 10 * k);
    ctx.font = font(18);
    ctx.fillStyle = "#c4b5fd";
    ctx.fillText(`${w.ammo === "shells" ? "[[ ]]" : w.ammo === "energy" ? "\u26A1" : "\u2712"} ${ammo}`, 124 * k, yb + 10 * k);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = !this.weapons[i] ? "rgba(255,255,255,0.12)" : i === this.cur ? "#a855f7" : "rgba(196,181,253,0.5)";
      ctx.fillRect(124 * k + i * 16 * k, yb + 24 * k, 12 * k, 4 * k);
    }
    ctx.textAlign = "right";
    ctx.font = font(22);
    ctx.fillStyle = "#e879f9";
    const modeLabel = this.mode === "story" ? `◆ ${this.run.shards.length}/7` : this.mode === "arena" ? tr`ВОЛНА ${this.run.wave}` : tr("К БОССУ ↑");
    ctx.fillText(modeLabel, W - 16 * k, yb);
    ctx.font = font(12, false);
    ctx.fillStyle = "rgba(233,213,255,0.8)";
    const z = ZONES[Math.max(0, this.zone)];
    ctx.fillText(tr`${this.mode === "story" ? z.name : this.mode === "arena" ? tr("Арена") : tr("Путь")} · ${fmtTime(this.run.time)} · убито ${this.run.kills}`, W - 160 * k, yb);
    ctx.textAlign = "center";
    this.msgs.forEach((m, i) => {
      ctx.font = font(14);
      const ty = H - bh - 18 * k - (this.msgs.length - 1 - i) * 24 * k;
      const tw = ctx.measureText(m.text).width + 16 * k;
      ctx.fillStyle = `rgba(10,4,20,${Math.min(0.6, m.t)})`;
      ctx.fillRect(W / 2 - tw / 2, ty - 11 * k, tw, 22 * k);
      ctx.fillStyle = `rgba(243,232,255,${Math.min(1, m.t)})`;
      ctx.fillText(m.text, W / 2, ty);
    });
    if (this.zoneTitleT > 0) {
      const a = Math.min(1, this.zoneTitleT);
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgba(233,213,255,${a})`;
      ctx.font = font(34);
      ctx.fillText(z.name.toUpperCase(), W / 2, H * 0.2);
      ctx.font = font(14, false);
      ctx.fillStyle = `rgba(216,180,254,${a})`;
      ctx.fillText(z.sub, W / 2, H * 0.2 + 30 * k);
      ctx.shadowBlur = 0;
    }
    const boss2 = this.bossAwake ? this.enemies.find((e) => e.type === "boss" && !e.dead) : null;
    if (boss2) {
      const bw = W * 0.45, bx = W / 2 - bw / 2, by = 22 * k;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(bx - 3, by - 3, bw + 6, 16 * k + 6);
      ctx.fillStyle = "#f5f3ff";
      ctx.fillRect(bx, by, bw * Math.max(0, boss2.hp / boss2.maxHp), 16 * k);
      ctx.font = font(12);
      ctx.fillStyle = "#6d28d9";
      ctx.fillText(tr("\u041F\u0423\u0421\u0422\u0410\u042F \u0417\u0410\u041C\u0415\u0422\u041A\u0410"), W / 2, by + 8 * k);
    }
    if (this.data.settings.showFps) {
      ctx.textAlign = "left";
      ctx.font = font(12);
      ctx.fillStyle = "#a3e635";
      ctx.fillText(`${this.fps} FPS \xB7 ${this.rw}\xD7${this.rh}`, 10, 14);
    }
    this.drawMinimap(k);
  }
  drawMinimap(k) {
    const ctx = this.ctx;
    const size = Math.round(150 * k), cs = size / 31;
    const x0 = this.W - size - 12 * k, y0 = 12 * k;
    ctx.fillStyle = "rgba(10,4,20,0.72)";
    ctx.fillRect(x0 - 3, y0 - 3, size + 6, size + 6);
    ctx.strokeStyle = "rgba(168,85,247,0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 - 3, y0 - 3, size + 6, size + 6);
    const pcx = Math.floor(this.px), pcy = Math.floor(this.py);
    for (let j = -15; j <= 15; j++) for (let i = -15; i <= 15; i++) {
      const cx2 = pcx + i, cy2 = pcy + j;
      if (cx2 < 0 || cy2 < 0 || cx2 >= MW || cy2 >= MH) continue;
      const id = cy2 * MW + cx2;
      if (!this.explored[id]) continue;
      const t = this.grid[id];
      ctx.fillStyle = t >= 10 && t <= 13 ? "#fbbf24" : t === 7 || t === 6 ? "#6d28d9" : t ? ZONES[this.world.zone[id]].map : "rgba(80,60,110,0.5)";
      ctx.fillRect(x0 + (i + 15) * cs, y0 + (j + 15) * cs, Math.ceil(cs), Math.ceil(cs));
    }
    for (const it of this.items) {
      if (it.taken || it.kind !== "shard" && it.kind !== "page") continue;
      const i = Math.floor(it.x) - pcx, j = Math.floor(it.y) - pcy;
      if (Math.abs(i) > 15 || Math.abs(j) > 15 || !this.explored[Math.floor(it.y) * MW + Math.floor(it.x)]) continue;
      ctx.fillStyle = it.kind === "shard" ? "#e879f9" : "#fde68a";
      ctx.fillRect(x0 + (i + 15.15) * cs, y0 + (j + 15.15) * cs, cs * 0.7, cs * 0.7);
    }
    const reachable = this.navigation();
    for (const e of this.enemies) {
      if (e.dead || !e.awake || reachable[Math.floor(e.y) * MW + Math.floor(e.x)] < 0) continue;
      const i = e.x - this.px, j = e.y - this.py;
      if (Math.abs(i) > 15 || Math.abs(j) > 15) continue;
      ctx.fillStyle = "#ff4d7d";
      ctx.fillRect(x0 + (e.x - pcx + 15) * cs - 1.5, y0 + (e.y - pcy + 15) * cs - 1.5, 3, 3);
    }
    const cx = x0 + (this.px - pcx + 15) * cs, cy = y0 + (this.py - pcy + 15) * cs;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5 * k, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.pa) * 9 * k, cy + Math.sin(this.pa) * 9 * k);
    ctx.stroke();
  }
  drawMap() {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.fillStyle = "rgba(8,3,16,0.95)";
    ctx.fillRect(0, 0, W, H);
    const cs = Math.max(2, Math.floor(Math.min(W, H - 70) * 0.92 / MW));
    const x0 = Math.round((W - cs * MW) / 2), y0 = Math.round((H - cs * MH) / 2 + 6);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const id = y * MW + x;
      if (!this.explored[id]) continue;
      const t = this.grid[id];
      ctx.fillStyle = t >= 10 && t <= 13 ? "#fbbf24" : t === 7 || t === 6 ? "#4c1d95" : t ? ZONES[this.world.zone[id]].map : "rgba(70,50,100,0.6)";
      ctx.fillRect(x0 + x * cs, y0 + y * cs, cs, cs);
    }
    for (const it of this.items) {
      if (it.taken) continue;
      if (!this.explored[Math.floor(it.y) * MW + Math.floor(it.x)]) continue;
      if (it.kind !== "shard" && it.kind !== "page" && it.kind !== "shotgun" && it.kind !== "laser") continue;
      ctx.fillStyle = it.kind === "shard" ? "#e879f9" : it.kind === "page" ? "#fde68a" : "#22d3ee";
      ctx.beginPath();
      ctx.arc(x0 + it.x * cs, y0 + it.y * cs, cs * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x0 + this.px * cs, y0 + this.py * cs, cs * 0.9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0 + this.px * cs, y0 + this.py * cs);
    ctx.lineTo(x0 + (this.px + Math.cos(this.pa) * 2.5) * cs, y0 + (this.py + Math.sin(this.pa) * 2.5) * cs);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 16px ui-monospace, monospace";
    ctx.fillStyle = "#e9d5ff";
    ctx.fillText(tr`${this.mode === "story" ? tr`КАРТА · ◆ ${this.run.shards.length}/7` : this.mode === "arena" ? tr`АРЕНА · ВОЛНА ${this.run.wave}` : tr("ЛИНЕЙНЫЙ ПУТЬ")} · M — закрыть`, W / 2, Math.max(14, y0 - 16));
    ctx.font = "12px ui-monospace, monospace";
    const legend = [["#e879f9", tr("\u25CF \u043E\u0441\u043A\u043E\u043B\u043E\u043A")], ["#fde68a", tr("\u25CF \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430")], ["#22d3ee", tr("\u25CF \u043E\u0440\u0443\u0436\u0438\u0435")], ["#fbbf24", tr("\u25A0 \u0434\u0432\u0435\u0440\u044C")], ["#ffffff", tr("\u25CF \u0442\u044B")]];
    const lw = legend.map(([, t]) => ctx.measureText(t).width + 24);
    let lx = W / 2 - lw.reduce((a, b) => a + b, 0) / 2;
    ctx.textAlign = "left";
    legend.forEach(([c, t], i) => {
      ctx.fillStyle = c;
      ctx.fillText(t, lx, Math.min(H - 10, y0 + cs * MH + 14));
      lx += lw[i];
    });
  }
  // ---------- Меню (DOM) ----------
  openMenu(tab) {
    if (this.state === "playing") {
      this.state = "menu";
      this.persist();
    }
    if (tab === "win") this.state = "win";
    else if (this.state !== "win") this.state = "menu";
    this.tab = tab;
    this.keys.clear();
    this.mouseDown = false;
    if (document.pointerLockElement === this.canvas) {
      this.wantLock = true;
      document.exitPointerLock();
    }
    this.buildMenu();
    this.render();
  }
  resume() {
    if (this.run.awaitingUpgrade) { this.openMenu("upgrade"); return; }
    this.state = "playing";
    this.overlay.classList.remove("vs-show");
    this.overlay.replaceChildren();
    this.confirmNew = false;
    if (!this.data.run) {
      this.data.run = this.snapshot();
      this.persist();
    }
    this.zone = -1;
    this.sfx.unlock();
    this.wrap.focus();
    this.lock();
    this.last = performance.now();
  }
  buildMenu() {
    const o = this.overlay;
    o.replaceChildren();
    o.classList.add("vs-show");
    const panel = el("div", "vs-panel", void 0, o);
    const head = el("div", "vs-head", void 0, panel);
    el("div", "vs-logo", "HELLVAULT", head);
    el("div", "vs-logo-sub", tr("◆ ИГРА ВНУТРИ OBSIDIAN ◆"), head);
    const tabs = el("div", "vs-tabs", void 0, panel);
    const tabDefs = [["main", this.state === "win" ? tr("Победа") : tr("Игра")], ["ach", tr("Достижения")], ["codex", tr("Кодекс")], ["records", tr("Рекорды")], ["controls", tr("Управление")], ["settings", tr("Настройки")]];
    for (const [id, title] of tabDefs) {
      const active = this.tab === id || id === "main" && this.tab === "win";
      const b = el("button", "vs-tab" + (active ? " vs-active" : ""), title, tabs);
      b.onclick = () => {
        this.tab = id === "main" && this.state === "win" ? "win" : id;
        this.confirmNew = false;
        this.buildMenu();
      };
    }
    const body = el("div", "vs-body", void 0, panel);
    if (this.tab === "main") this.menuMain(body);
    else if (this.tab === "win") this.menuWin(body);
    else if (this.tab === "upgrade") this.menuUpgrade(body);
    else if (this.tab === "gameover") this.menuGameOver(body);
    else if (this.tab === "linearwin") this.menuLinearWin(body);
    else if (this.tab === "records") this.menuRecords(body);
    else if (this.tab === "ach") this.menuAch(body);
    else if (this.tab === "codex") this.menuCodex(body);
    else if (this.tab === "controls") this.menuControls(body);
    else this.menuSettings(body);
  }
  btn(parent, text, fn, cls = "") {
    const b = el("button", "vs-btn " + cls, text, parent);
    b.onclick = (e) => {
      e.stopPropagation();
      fn();
    };
    return b;
  }
  startNew() {
    this.startMode("story", true);
  }
  requestNewMode(mode) {
    if (this.data.runs[mode] && this.confirmNew !== mode) {
      this.confirmNew = mode;
      this.buildMenu();
      return;
    }
    this.confirmNew = false;
    this.startMode(mode, true);
  }
  menuMain(body) {
    el("p", "vs-intro", tr("Выберите режим. Забеги сохраняются отдельно; сложность выбирается в настройках и фиксируется при начале забега."), body);
    const modes = [
      ["story", tr("📖 История · 7 глав"), tr("Прежний сюжет: найдите семь осколков и восстановите Хранилище.")],
      ["linear", tr("⚔ Линейный путь"), tr("Идите вперёд по извилистому пути, отражайте постоянно появляющихся врагов и победите босса.")],
      ["arena", tr("∞ Бесконечная арена"), tr("Волны, разрушаемые ящики, улучшения после каждой волны и босс каждые пять волн.")]
    ];
    const grid = el("div", "vs-mode-grid", void 0, body);
    for (const [mode, title, description] of modes) {
      const card = el("div", "vs-mode-card", void 0, grid);
      el("h3", void 0, title, card);
      el("p", void 0, description, card);
      const row = el("div", "vs-mode-actions", void 0, card);
      const saved = this.data.runs[mode];
      if (mode === "arena" && !this.data.progress.arenaUnlocked) {
        const b = this.btn(row, tr("🔒 Пройдите историю"), () => {});
        b.disabled = true;
        el("small", void 0, tr("Откроется после первой победы в истории на любой сложности."), card);
        continue;
      }
      if (saved) {
        if (!(mode === "linear" && saved.won)) this.btn(row, tr("▶ Продолжить"), () => this.startMode(mode), "vs-primary");
        const detail = mode === "story" ? tr`Глава ${Math.min(7, saved.shards.length + 1)}/7 · осколков ${saved.shards.length}/7` : mode === "arena" ? tr`Волна ${saved.wave}` : tr("Забег сохранён");
        el("small", void 0, `${detail} · ${fmtTime(saved.time || 0)}`, card);
      }
      const newLabel = this.confirmNew === mode ? tr("Точно начать заново?") : saved ? tr("Начать заново") : tr("▶ Начать");
      this.btn(row, newLabel, () => this.requestNewMode(mode), this.confirmNew === mode ? "vs-danger" : saved ? "" : "vs-primary");
    }
    const meta = el("div", "vs-meta", void 0, body);
    const p = this.data.progress;
    el("span", void 0, tr`🏆 Достижения: ${Object.keys(p.achievements).length}/${ACHIEVEMENTS.length}`, meta);
    el("span", void 0, tr`📖 Кодекс: ${LORE.filter((l) => p.lore.includes(l.id)).length}/${LORE.length}`, meta);
    el("span", void 0, tr`Следующий забег: ${{ easy: tr("лёгкий"), normal: tr("средний"), hard: tr("хард · 1 HP") }[this.data.settings.difficulty]}`, meta);
    if (this.data.run) el("div", "vs-tip", tr`Текущий забег: ${{ easy: tr("лёгкий"), normal: tr("средний"), hard: tr("хард") }[this.run.difficulty]}.`, body);
  }
  menuUpgrade(body) {
    el("h2", "vs-win-title", tr`ВОЛНА ${this.run.completedWave} ПРОЙДЕНА`, body);
    el("p", "vs-intro", tr("Выберите одно улучшение. После выбора начнётся следующая волна."), body);
    const row = el("div", "vs-upgrades", void 0, body);
    this.btn(row, tr`⚔ Урон +25% (сейчас ${Math.round(this.run.damageMult * 100)}%)`, () => this.chooseUpgrade("damage"), "vs-primary");
    this.btn(row, tr`➜ Скорость +10% (сейчас ${Math.round(this.run.speedMult * 100)}%)`, () => this.chooseUpgrade("speed"));
    this.btn(row, this.run.difficulty === "hard" ? tr("✦ Оружие и боеприпасы") : tr("✦ Оружие, боеприпасы и +35 HP"), () => this.chooseUpgrade("supplies"));
  }
  menuRecords(body) {
    el("h2", "vs-win-title", tr("РЕКОРДЫ АРЕНЫ"), body);
    el("p", "vs-intro", tr("Сначала учитываются пройденные волны, затем количество убитых врагов. Таблица хранится в этом хранилище."), body);
    if (!this.data.records.length) { el("p", "vs-intro", tr("Пока нет завершённых забегов."), body); return; }
    const table = el("table", "vs-records", void 0, body);
    const head = el("tr", void 0, void 0, table);
    for (const name of ["#", tr("Волны"), tr("Убито"), tr("Время"), tr("Сложность"), tr("Дата")]) el("th", void 0, name, head);
    this.data.records.forEach((r, i) => {
      const tr = el("tr", void 0, void 0, table);
      for (const value of [i + 1, r.wave, r.kills, fmtTime(r.time), { easy: tr("Лёгкая"), normal: tr("Средняя"), hard: tr("Хард") }[r.difficulty] || r.difficulty, new Date(r.date).toLocaleDateString(gameLocale())]) el("td", void 0, String(value), tr);
    });
  }
  menuGameOver(body) {
    el("h2", "vs-win-title", tr("ЗАБЕГ ЗАВЕРШЁН"), body);
    el("p", "vs-intro", tr`Пройдено волн: ${this.run.completedWave}. Убито врагов: ${this.run.kills}. Результат сохранён в таблице рекордов.`, body);
    const row = el("div", "vs-row", void 0, body);
    this.btn(row, tr("Рекорды"), () => { this.tab = "records"; this.buildMenu(); }, "vs-primary");
    this.btn(row, tr("Главное меню"), () => { this.state = "menu"; this.tab = "main"; this.buildMenu(); });
    this.btn(row, tr("Новый забег"), () => this.startMode("arena", true));
  }
  menuLinearWin(body) {
    el("h2", "vs-win-title", tr("ПУТЬ ПРОЙДЕН"), body);
    el("p", "vs-intro", tr`Босс повержен за ${fmtTime(this.run.time)}. Удалено врагов: ${this.run.kills}.`, body);
    const row = el("div", "vs-row", void 0, body);
    this.btn(row, tr("Главное меню"), () => { this.state = "menu"; this.tab = "main"; this.buildMenu(); }, "vs-primary");
    this.btn(row, tr("Пройти ещё раз"), () => this.startMode("linear", true));
  }
  menuWin(body) {
    const r = this.run;
    el("h2", "vs-win-title", tr("\u0425\u0420\u0410\u041D\u0418\u041B\u0418\u0429\u0415 \u0412\u041E\u0421\u0421\u0422\u0410\u041D\u041E\u0412\u041B\u0415\u041D\u041E"), body);
    el("p", "vs-intro", tr("\u0421\u0435\u0434\u044C\u043C\u043E\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A \u0432\u0441\u0442\u0430\u043B \u043D\u0430 \u043C\u0435\u0441\u0442\u043E. \u0413\u0440\u0430\u0444 \u0432\u0441\u043F\u044B\u0445\u043D\u0443\u043B \u043E\u0442 \u043A\u0440\u0430\u044F \u0434\u043E \u043A\u0440\u0430\u044F, \u0430 \u041F\u0443\u0441\u0442\u0430\u044F \u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u0441\u0442\u0430\u043B\u0430 \u043F\u0440\u043E\u0441\u0442\u043E \u0447\u0438\u0441\u0442\u044B\u043C \u043B\u0438\u0441\u0442\u043E\u043C \u2014 \u043C\u0435\u0441\u0442\u043E\u043C \u0434\u043B\u044F \u043D\u043E\u0432\u043E\u0439 \u043C\u044B\u0441\u043B\u0438."), body);
    const s = el("div", "vs-stats", void 0, body);
    el("span", void 0, tr`\u23F1 \u0412\u0440\u0435\u043C\u044F: ${fmtTime(r.time)}`, s);
    el("span", void 0, tr`\u2620 \u0423\u0434\u0430\u043B\u0435\u043D\u043E: ${r.kills}`, s);
    el("span", void 0, tr`\u21BA \u0413\u0438\u0431\u0435\u043B\u0435\u0439: ${r.deaths}`, s);
    el("span", void 0, tr`? \u0422\u0430\u0439\u043D\u0438\u043A\u0438: ${r.secrets.length}/3`, s);
    el("span", void 0, tr`\u2761 \u0421\u0442\u0440\u0430\u043D\u0438\u0446: ${this.data.progress.lore.filter((l) => l.startsWith("d")).length}/12`, s);
    const row = el("div", "vs-row", void 0, body);
    this.btn(row, tr("\u25B6 \u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043B\u044C\u0448\u0435"), () => {
      this.state = "menu";
      this.resume();
    }, "vs-primary");
    this.btn(row, tr("\u0427\u0438\u0442\u0430\u0442\u044C \u044D\u043F\u0438\u043B\u043E\u0433"), () => {
      this.codexSel = "st_epilogue";
      this.tab = "codex";
      this.buildMenu();
    });
    this.btn(row, tr("\u041D\u043E\u0432\u0430\u044F \u0438\u0433\u0440\u0430"), () => this.startNew());
    this.btn(row, tr("Режимы и арена"), () => { this.state = "menu"; this.tab = "main"; this.buildMenu(); }, "vs-primary");
  }
  menuAch(body) {
    const p = this.data.progress;
    const n = Object.keys(p.achievements).length;
    const top = el("div", "vs-ach-top", void 0, body);
    el("span", void 0, tr`\u041E\u0442\u043A\u0440\u044B\u0442\u043E ${n} \u0438\u0437 ${ACHIEVEMENTS.length}`, top);
    const bar = el("div", "vs-bar", void 0, top);
    el("div", "vs-bar-fill", void 0, bar).style.width = `${n / ACHIEVEMENTS.length * 100}%`;
    const grid = el("div", "vs-ach-grid", void 0, body);
    for (const a of ACHIEVEMENTS) {
      const t = p.achievements[a.id];
      const v = Math.min(a.target, a.value(p));
      const card = el("div", "vs-ach" + (t ? " vs-unlocked" : ""), void 0, grid);
      el("div", "vs-ach-icon", t ? a.icon : "\u{1F512}", card);
      const b = el("div", "vs-ach-body", void 0, card);
      el("div", "vs-ach-title", a.title, b);
      el("div", "vs-ach-desc", a.desc, b);
      if (t) el("div", "vs-ach-date", tr("\u2713 \u041E\u0442\u043A\u0440\u044B\u0442\u043E ") + new Date(t).toLocaleDateString(gameLocale()), b);
      else {
        const pb = el("div", "vs-bar vs-bar-sm", void 0, b);
        el("div", "vs-bar-fill", void 0, pb).style.width = `${v / a.target * 100}%`;
        el("div", "vs-ach-date", `${v} / ${a.target}`, b);
      }
    }
  }
  menuCodex(body) {
    const p = this.data.progress;
    const wrap = el("div", "vs-codex", void 0, body);
    const list = el("div", "vs-codex-list", void 0, wrap);
    const view = el("div", "vs-codex-view", void 0, wrap);
    for (const c of LORE_CATS) {
      const entries = LORE.filter((l) => l.cat === c.id);
      const got = entries.filter((l) => p.lore.includes(l.id)).length;
      el("div", "vs-codex-cat", `${c.title} \xB7 ${got}/${entries.length}`, list);
      for (const l of entries) {
        const open2 = p.lore.includes(l.id);
        const it = el("div", "vs-codex-item" + (open2 ? "" : " vs-locked") + (this.codexSel === l.id ? " vs-active" : ""), open2 ? l.title : tr("??? \u2014 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E"), list);
        it.onclick = () => {
          this.codexSel = l.id;
          this.buildMenu();
        };
      }
    }
    const sel = LORE.find((l) => l.id === this.codexSel) || LORE[0];
    const open = p.lore.includes(sel.id);
    const cat = LORE_CATS.find((c) => c.id === sel.cat);
    el("div", "vs-codex-kicker", cat ? cat.title : "", view);
    el("h3", void 0, open ? sel.title : "???", view);
    if (open) for (const para of sel.text.split("\n\n")) el("p", void 0, para, view);
    else el("p", "vs-locked-text", tr("\u0417\u0430\u043F\u0438\u0441\u044C \u0435\u0449\u0451 \u043D\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0430. \u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430: ") + sel.hint, view);
    if (this.opts.onExportLore) {
      const row = el("div", "vs-row", void 0, view);
      this.btn(row, tr("\u21E9 \u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u041A\u043E\u0434\u0435\u043A\u0441 \u0432 \u0437\u0430\u043C\u0435\u0442\u043A\u0443"), async () => {
        try {
          const res = await this.opts.onExportLore();
          this.toast("\u{1F4DD}", tr("\u041A\u043E\u0434\u0435\u043A\u0441 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D"), typeof res === "string" ? res : tr("\u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0430 \u0432 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435"));
        } catch (e) {
          this.toast("\u26A0", tr("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"), String(e));
        }
      });
    }
  }
  menuControls(body) {
    const rows = [
      ["W A S D / \u2191 \u2193", tr("\u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435")],
      ["\u2190 \u2192", tr("\u043F\u043E\u0432\u043E\u0440\u043E\u0442 (\u0431\u0435\u0437 \u043C\u044B\u0448\u0438)")],
      [tr("\u041C\u044B\u0448\u044C"), tr("\u043E\u0431\u0437\u043E\u0440 \u2014 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u044D\u043A\u0440\u0430\u043D\u0443 \u0434\u043B\u044F \u0437\u0430\u0445\u0432\u0430\u0442\u0430")],
      [tr("\u041B\u041A\u041C / \u041F\u0440\u043E\u0431\u0435\u043B"), tr("\u0432\u044B\u0441\u0442\u0440\u0435\u043B")],
      [tr("1 \xB7 2 \xB7 3 / \u043A\u043E\u043B\u0435\u0441\u043E / Q"), tr("\u0441\u043C\u0435\u043D\u0430 \u043E\u0440\u0443\u0436\u0438\u044F")],
      ["Shift", tr("\u0431\u0435\u0433")],
      ["E / F", tr("\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0441\u0442\u0435\u043D\u0443, \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0442\u0430\u0439\u043D\u0438\u043A")],
      ["M / Tab", tr("\u043A\u0430\u0440\u0442\u0430 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430")],
      ["Esc", tr("\u043F\u0430\u0443\u0437\u0430 \u0438 \u043C\u0435\u043D\u044E")]
    ];
    const t = el("div", "vs-controls", void 0, body);
    for (const [k, v] of rows) {
      const r = el("div", "vs-ctrl", void 0, t);
      el("kbd", void 0, k, r);
      el("span", void 0, v, r);
    }
    const w = el("div", "vs-weapons", void 0, body);
    el("h4", void 0, tr("\u0410\u0440\u0441\u0435\u043D\u0430\u043B"), w);
    el("p", void 0, tr("\u2712 \u041F\u0435\u0440\u043E \u2014 \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0435 \u0447\u0435\u0440\u043D\u0438\u043B\u0430, \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u0443\u0440\u043E\u043D \u0432\u043F\u043B\u043E\u0442\u043D\u0443\u044E."), w);
    el("p", void 0, tr("[[ ]] Wikilink-\u0434\u0440\u043E\u0431\u043E\u0432\u0438\u043A \u2014 7 \u0441\u043A\u043E\u0431\u043E\u043A-\u0434\u0440\u043E\u0431\u0438\u043D, \u043C\u043E\u0449\u043D\u043E \u0432\u0431\u043B\u0438\u0437\u0438. \u041B\u0435\u0436\u0438\u0442 \u0433\u0434\u0435-\u0442\u043E \u0432 \u0410\u0440\u0445\u0438\u0432\u0435."), w);
    el("p", void 0, tr("\u26A1 \u0413\u0440\u0430\u0444-\u043B\u0430\u0437\u0435\u0440 \u2014 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0440\u0435\u043B\u044C\u043D\u044B\u0439 \u043B\u0443\u0447 \u044D\u043D\u0435\u0440\u0433\u0438\u0438. \u0421\u043F\u0440\u044F\u0442\u0430\u043D \u0432 \u0421\u0430\u0434\u0443 \u0417\u0430\u043C\u0435\u0442\u043E\u043A."), w);
    el("h4", void 0, tr("\u041F\u0435\u0447\u0430\u0442\u0438"), w);
    el("p", void 0, tr("\u0414\u0432\u0435\u0440\u0438 \u043C\u0435\u0436\u0434\u0443 \u0437\u043E\u043D\u0430\u043C\u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0442\u0441\u044F, \u043A\u043E\u0433\u0434\u0430 \u0443 \u0432\u0430\u0441 \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043E\u0441\u043A\u043E\u043B\u043A\u043E\u0432: 1 \u2192 \u0421\u0430\u0434, 3 \u2192 \u0413\u0440\u0430\u0444, 5 \u2192 \u0411\u0438\u0442\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438, 6 \u2192 \u042F\u0434\u0440\u043E. \u0421\u0435\u0434\u044C\u043C\u043E\u0439 \u043E\u0441\u043A\u043E\u043B\u043E\u043A \u2014 \u0443 \u041F\u0443\u0441\u0442\u043E\u0439 \u0417\u0430\u043C\u0435\u0442\u043A\u0438."), w);
  }
  menuSettings(body) {
    const s = this.data.settings;
    const f = el("div", "vs-settings", void 0, body);
    const row = (label) => {
      const r = el("label", "vs-set", void 0, f);
      el("span", void 0, label, r);
      return r;
    };
    const save = () => {
      this.applySettings(s);
      try {
        this.opts.onSave(this.data);
      } catch {
      }
    };
    const language = el("select", void 0, void 0, row("Language / Язык"));
    for (const [value, title] of [["en", "English"], ["ru", "Русский"]]) {
      const option = el("option", void 0, title, language);
      option.value = value;
    }
    language.value = s.language;
    language.onchange = () => {
      s.language = language.value;
      save();
      this.opts.onLanguageChanged?.();
    };
    const snd = el("input", void 0, void 0, row(tr("\u0417\u0432\u0443\u043A")));
    snd.type = "checkbox";
    snd.checked = s.sound;
    snd.onchange = () => {
      s.sound = snd.checked;
      save();
    };
    const vol = el("input", void 0, void 0, row(tr("\u0413\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C")));
    vol.type = "range";
    vol.min = "0";
    vol.max = "1";
    vol.step = "0.05";
    vol.value = String(s.volume);
    vol.oninput = () => {
      s.volume = +vol.value;
      save();
    };
    const sen = el("input", void 0, void 0, row(tr("\u0427\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043C\u044B\u0448\u0438")));
    sen.type = "range";
    sen.min = "0.2";
    sen.max = "3";
    sen.step = "0.1";
    sen.value = String(s.sensitivity);
    sen.oninput = () => {
      s.sensitivity = +sen.value;
      save();
    };
    const dif = el("select", void 0, void 0, row(tr("Сложность следующего забега")));
    for (const [v, t] of [["easy", tr("Лёгкая")], ["normal", tr("Средняя")], ["hard", tr("Хард · 1 HP")]]) {
      const op = el("option", void 0, t, dif);
      op.value = v;
    }
    dif.value = s.difficulty;
    dif.onchange = () => {
      s.difficulty = dif.value;
      save();
    };
    const res = el("select", void 0, void 0, row(tr("\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0440\u0435\u043D\u0434\u0435\u0440\u0430")));
    for (const [v, t] of [["0.25", tr("25% \u2014 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u043E")], ["0.35", "35%"], ["0.5", tr("50% \u2014 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E")], ["0.75", "75%"], ["1", tr("100% \u2014 \u0447\u0451\u0442\u043A\u043E")]]) {
      const op = el("option", void 0, t, res);
      op.value = v;
    }
    res.value = String(s.resolution);
    res.onchange = () => {
      s.resolution = +res.value;
      save();
    };
    const nn = el("input", void 0, void 0, row(tr("Имена заметок из хранилища")));
    nn.type = "checkbox";
    nn.checked = s.useNoteNames;
    nn.onchange = () => {
      s.useNoteNames = nn.checked;
      save();
    };
    const fp = el("input", void 0, void 0, row(tr("\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C FPS")));
    fp.type = "checkbox";
    fp.checked = s.showFps;
    fp.onchange = () => {
      s.showFps = fp.checked;
      save();
    };
    el("div", "vs-tip", tr("Эти же настройки доступны в Настройки → Сторонние плагины → HELLVAULT."), body);
  }
  // ---------- Завершение ----------
  destroy() {
    if (this.destroyed) return;
    this.persist();
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    for (const c of this.cleanup) c();
    this.cleanup = [];
    for (const t of this.timeouts) clearTimeout(t);
    this.ro?.disconnect();
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.sfx.close();
    this.root.replaceChildren();
    this.root.classList.remove("vs-root");
  }
};

// src/game/types.ts
var DEFAULT_SETTINGS = {
  language: "en",
  sensitivity: 1,
  sound: true,
  volume: 0.6,
  difficulty: "normal",
  resolution: 0.5,
  useNoteNames: true,
  excludedFolders: [],
  showFps: false
};
function defaultData() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    progress: { achievements: {}, stats: {}, lore: [], arenaUnlocked: false },
    runs: { story: null, linear: null, arena: null },
    records: [],
    lastMode: "story",
    run: null
  };
}
function mergeData(raw) {
  const d = defaultData();
  if (!raw || typeof raw !== "object") return d;
  const r = raw;
  if (r.settings) d.settings = { ...d.settings, ...r.settings };
  // Saves created before language support keep their original Russian interface.
  if (!r.settings || !Object.prototype.hasOwnProperty.call(r.settings, "language")) d.settings.language = "ru";
  d.settings.language = d.settings.language === "en" ? "en" : "ru";
  if (r.progress) {
    d.progress.achievements = { ...r.progress.achievements || {} };
    d.progress.stats = { ...r.progress.stats || {} };
    d.progress.lore = Array.isArray(r.progress.lore) ? [...r.progress.lore] : [];
  }
  d.settings.excludedFolders = normalizeExcludedFolders(d.settings.excludedFolders);
  if (r.runs && typeof r.runs === "object") {
    for (const mode of ["story", "linear", "arena"]) d.runs[mode] = r.runs[mode] || null;
  } else if (r.run) d.runs.story = { ...r.run, mode: "story" };
  d.records = Array.isArray(r.records) ? r.records.filter((x) => x && Number.isFinite(x.wave)).slice(0, 10) : [];
  d.progress.arenaUnlocked = Boolean(r.progress?.arenaUnlocked || d.progress.stats.wins > 0 || d.runs.story?.won);
  d.lastMode = ["story", "linear", "arena"].includes(r.lastMode) ? r.lastMode : "story";
  d.run = d.runs[d.lastMode] || null;
  return d;
}

// src/main.ts
var VIEW_TYPE_SHARDS = "vault-shards-view";
var EXPORT_PATH = "\u041E\u0441\u043A\u043E\u043B\u043A\u0438 \u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u2014 \u041A\u043E\u0434\u0435\u043A\u0441.md";
var ShardsView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.game = null;
  }
  getViewType() {
    return VIEW_TYPE_SHARDS;
  }
  getDisplayText() {
    return "HELLVAULT";
  }
  getIcon() {
    return "gem";
  }
  async onOpen() {
    const el2 = this.contentEl;
    el2.empty();
    el2.addClass("vs-view");
    this.game = new Game(el2, {
      data: this.plugin.data,
      noteNames: this.plugin.noteNames(),
      getNoteNames: () => this.plugin.noteNames(),
      onLanguageChanged: () => this.plugin.applySettings(),
      onSave: () => this.plugin.requestSave(),
      onRunEnd: (kind, run) => this.plugin.obsigama?.endRun(this.plugin.data, kind, run),
      onExportLore: () => this.plugin.exportLore()
    });
  }
  applySettings(s) {
    this.game?.applySettings(s);
  }
  async onClose() {
    this.game?.destroy();
    this.game = null;
    try { this.plugin.obsigama?.flushPartial(this.plugin.data); }
    catch (e) { console.warn("[HELLVAULT] OBSIGAMA partial progress", e); }
    await this.plugin.flushSave();
  }
};
var VaultShardsPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.saveTimer = null;
    this.obsigama = null;
  }
  async onload() {
    this.data = mergeData(await this.loadData());
    setGameLanguage(this.data.settings.language);
    this.registerView(VIEW_TYPE_SHARDS, (leaf) => new ShardsView(leaf, this));
    this.ribbonIcon = this.addRibbonIcon("gem", tr("Открыть HELLVAULT"), () => this.openGame());
    this.openCommand = this.addCommand({ id: "open", name: tr("Открыть HELLVAULT"), callback: () => this.openGame() });
    this.exportCommand = this.addCommand({ id: "export-codex", name: tr("\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u041A\u043E\u0434\u0435\u043A\u0441 \u0432 \u0437\u0430\u043C\u0435\u0442\u043A\u0443"), callback: async () => {
      new import_obsidian.Notice(await this.exportLore());
    } });
    this.addSettingTab(new ShardsSettingTab(this.app, this));
    this.obsigama = await HELLVAULT_OBSIGAMA.HellvaultObsigama.init(this, this.data).catch((e) => {
      console.warn("[HELLVAULT] OBSIGAMA initialization", e);
      return null;
    });
  }
  async onunload() {
    try { this.obsigama?.flushPartial(this.data); }
    catch (e) { console.warn("[HELLVAULT] OBSIGAMA partial progress", e); }
    this.obsigama?.client.destroy();
    this.obsigama = null;
    await this.flushSave();
  }
  noteNames() {
    if (!this.data.settings.useNoteNames) return [];
    const excluded = normalizeExcludedFolders(this.data.settings.excludedFolders);
    return this.app.vault.getMarkdownFiles().filter((f) => !noteIsExcluded(f.path, excluded)).map((f) => f.basename).filter((n) => n && n.length <= 40 && n !== "Осколки Хранилища — Кодекс").slice(0, 400);
  }
  async openGame() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_SHARDS)[0];
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE_SHARDS, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  requestSave() {
    if (this.saveTimer !== null) return;
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveData(this.data);
    }, 800);
  }
  async flushSave() {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.saveData(this.data);
  }
  applySettings() {
    setGameLanguage(this.data.settings.language);
    if (this.ribbonIcon) this.ribbonIcon.setAttribute("aria-label", tr("Открыть HELLVAULT"));
    const prefix = (this.manifest?.name || "HELLVAULT") + ": ";
    if (this.openCommand) this.openCommand.name = prefix + tr("Открыть HELLVAULT");
    if (this.exportCommand) this.exportCommand.name = prefix + tr("Экспортировать Кодекс в заметку");
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_SHARDS)) {
      const v = leaf.view;
      if (v instanceof ShardsView) v.applySettings(this.data.settings);
    }
    this.requestSave();
  }
  async exportLore() {
    const md = buildLoreMarkdown(this.data.progress.lore, this.data.progress.achievements);
    const path = (0, import_obsidian.normalizePath)(EXPORT_PATH);
    const existing = this.app.vault.getAbstractFileByPath(path);
    let file;
    if (existing instanceof import_obsidian.TFile) {
      await this.app.vault.modify(existing, md);
      file = existing;
    } else file = await this.app.vault.create(path, md);
    await this.app.workspace.getLeaf("tab").openFile(file);
    const n = LORE.filter((l) => this.data.progress.lore.includes(l.id)).length;
    return tr`\u041A\u043E\u0434\u0435\u043A\u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D \u0432 \xAB${path}\xBB (${n}/${LORE.length} \u0437\u0430\u043F\u0438\u0441\u0435\u0439)`;
  }
};
var ShardsSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    this.disposeObsigama?.();
    this.disposeObsigama = null;
    const { containerEl } = this;
    const s = this.plugin.data.settings;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Language / Язык").addDropdown((d) => d.addOptions({ en: "English", ru: "Русский" }).setValue(s.language).onChange((v) => {
      s.language = v;
      this.plugin.applySettings();
      this.display();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("\u0427\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043C\u044B\u0448\u0438")).setDesc(tr("\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u0430 \u043A\u0430\u043C\u0435\u0440\u044B \u043C\u044B\u0448\u044C\u044E.")).addSlider((sl) => sl.setLimits(0.2, 3, 0.1).setValue(s.sensitivity).setDynamicTooltip().onChange((v) => {
      s.sensitivity = v;
      this.plugin.applySettings();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("\u0417\u0432\u0443\u043A")).setDesc(tr("\u0421\u0438\u043D\u0442\u0435\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0437\u0432\u0443\u043A\u043E\u0432\u044B\u0435 \u044D\u0444\u0444\u0435\u043A\u0442\u044B (WebAudio).")).addToggle((t) => t.setValue(s.sound).onChange((v) => {
      s.sound = v;
      this.plugin.applySettings();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("\u0413\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C")).addSlider((sl) => sl.setLimits(0, 1, 0.05).setValue(s.volume).setDynamicTooltip().onChange((v) => {
      s.volume = v;
      this.plugin.applySettings();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("Сложность")).setDesc(tr("Применяется к следующему новому забегу: лёгкая — прежняя обычная, средняя — прежняя тяжёлая, хард — 1 HP и усиленные враги.")).addDropdown((d) => d.addOptions({ easy: tr("Лёгкая"), normal: tr("Средняя"), hard: tr("Хард · 1 HP") }).setValue(s.difficulty).onChange((v) => {
      s.difficulty = v;
      this.plugin.applySettings();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0440\u0435\u043D\u0434\u0435\u0440\u0430")).setDesc(tr("\u0414\u043E\u043B\u044F \u043E\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0438. \u041C\u0435\u043D\u044C\u0448\u0435 \u2014 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0438 \xAB\u043F\u0438\u043A\u0441\u0435\u043B\u044C\u043D\u0435\u0435\xBB.")).addDropdown((d) => d.addOptions({ "0.25": "25%", "0.35": "35%", "0.5": tr("50% (\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E)"), "0.75": "75%", "1": "100%" }).setValue(String(s.resolution)).onChange((v) => {
      s.resolution = Number(v);
      this.plugin.applySettings();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("Имена заметок из хранилища")).setDesc(tr("Названия заметок используются в именах Сирот и Дубликатов и на надгробиях. Выбранные ниже папки исключаются.")).addToggle((t) => t.setValue(s.useNoteNames).onChange((v) => {
      s.useNoteNames = v;
      this.plugin.applySettings();
    }));
    new import_obsidian.Setting(containerEl).setName(tr("Исключить папки из имён в игре")).setDesc(tr("Отмеченные папки и все их вложенные папки не используются для имён врагов и надгробий. Изменения сразу применяются в открытой игре.")).setHeading();
    const folders = [];
    const pendingFolders = [this.app.vault.getRoot()];
    while (pendingFolders.length) {
      const parent = pendingFolders.pop();
      for (const child of parent.children) {
        if (child instanceof import_obsidian.TFolder) {
          folders.push(child);
          pendingFolders.push(child);
        }
      }
    }
    folders.sort((a, b) => a.path.localeCompare(b.path, "ru"));
    if (!folders.length) new import_obsidian.Setting(containerEl).setName(tr("В хранилище нет папок"));
    for (const folder of folders) {
      new import_obsidian.Setting(containerEl).setName(folder.path).addToggle((t) => t.setValue(s.excludedFolders.includes(folder.path)).onChange((v) => {
        const selected = new Set(normalizeExcludedFolders(s.excludedFolders));
        if (v) selected.add(folder.path); else selected.delete(folder.path);
        s.excludedFolders = [...selected];
        this.plugin.applySettings();
      }));
    }
    new import_obsidian.Setting(containerEl).setName(tr("\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C FPS")).addToggle((t) => t.setValue(s.showFps).onChange((v) => {
      s.showFps = v;
      this.plugin.applySettings();
    }));
    try { this.disposeObsigama = this.plugin.obsigama?.addSettings(containerEl, s.language === "ru" ? "ru" : "en") ?? null; }
    catch (e) { console.warn("[HELLVAULT] OBSIGAMA settings", e); }
    new import_obsidian.Setting(containerEl).setName(tr("\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0435\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441")).setDesc(tr("\u0423\u0434\u0430\u043B\u044F\u0435\u0442 \u0437\u0430\u0431\u0435\u0433, \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0439 \u041A\u043E\u0434\u0435\u043A\u0441. \u0417\u0430\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u043A\u043B\u0430\u0434\u043A\u0443 \u0438\u0433\u0440\u044B \u043F\u0435\u0440\u0435\u0434 \u0441\u0431\u0440\u043E\u0441\u043E\u043C.")).addButton((b) => b.setButtonText(tr("\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C")).setWarning().onClick(async () => {
      this.plugin.app.workspace.detachLeavesOfType(VIEW_TYPE_SHARDS);
      const keep = this.plugin.data.settings;
      this.plugin.data = mergeData({ settings: keep });
      try { this.plugin.obsigama?.rebase(this.plugin.data); }
      catch (e) { console.warn("[HELLVAULT] OBSIGAMA reset", e); }
      await this.plugin.flushSave();
      new import_obsidian.Notice(tr("Прогресс HELLVAULT сброшен"));
    }));
  }
  hide() {
    this.disposeObsigama?.();
    this.disposeObsigama = null;
  }
};
