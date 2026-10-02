#!/usr/bin/env node
// Draws the icon of a theme extension: a 128×128 miniature of the app built from
// the theme's own colors. Writes <extension>/assets/icon.png.
//
// Usage: node scripts/theme-icon.mjs extensions/<id> [extensions/<id> ...]
//
// No dependencies (Node >= 22.12). The output is deterministic: the same
// manifest colors give the same bytes.
import { crc32, deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SIZE = 128;
const SCALE = 4; // supersampling per axis: 16 samples per pixel
const MAX_BYTES = 16 * 1024; // limit of the catalog (CHECK-018)

// Vuetify defaults, used for the keys a theme does not set.
const FALLBACK = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'on-surface': '#000000',
    primary: '#1867C0',
    'on-primary': '#FFFFFF',
    secondary: '#48A9A6',
  },
  dark: {
    background: '#121212',
    surface: '#212121',
    'on-surface': '#FFFFFF',
    primary: '#2196F3',
    'on-primary': '#FFFFFF',
    secondary: '#54B6B2',
  },
};

const parseHex = (hex) => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`not a #rrggbb color: ${hex}`);
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Palette of a miniature: the theme colors with fallbacks. */
const paletteOf = (theme) => {
  const base = FALLBACK[theme.dark ? 'dark' : 'light'];
  const pick = (key, ...alternatives) => {
    for (const name of [key, ...alternatives]) {
      const value = theme.colors?.[name] ?? base[name];
      if (value !== undefined) return parseHex(value);
    }
    throw new Error(`no color for ${key}`);
  };
  const onSurface = pick('on-surface', 'on-background');
  return {
    background: pick('background'),
    surface: pick('surface'),
    text: onSurface,
    textMuted: theme.colors?.['on-surface-variant']
      ? parseHex(theme.colors['on-surface-variant'])
      : onSurface,
    primary: pick('primary'),
    onPrimary: pick('on-primary'),
    secondary: pick('secondary'),
    line: theme.variables?.['border-color']
      ? parseHex(theme.variables['border-color'])
      : onSurface,
  };
};

/** Shapes from back to front; rectangles have a corner radius, `a` is opacity. */
const shapesOf = (p) => [
  { x: 0, y: 0, w: 128, h: 128, r: 26, color: p.background, a: 1, clip: true },
  // rim: a thin inner outline so that a light icon is visible on a light page
  { x: 0, y: 0, w: 128, h: 128, r: 26, color: p.line, a: 0.32, ring: 3 },
  // card with a soft drop shadow
  { x: 14, y: 19, w: 100, h: 100, r: 15, color: p.line, a: 0.2 },
  { x: 14, y: 14, w: 100, h: 100, r: 15, color: p.surface, a: 1 },
  { x: 14, y: 14, w: 100, h: 100, r: 15, color: p.line, a: 0.16, ring: 1.5 },
  // accent dot and title
  { x: 26, y: 26, w: 20, h: 20, r: 10, color: p.secondary, a: 1 },
  { x: 54, y: 31, w: 46, h: 10, r: 5, color: p.text, a: 1 },
  // body text
  { x: 26, y: 54, w: 76, h: 7, r: 3.5, color: p.textMuted, a: 1 },
  { x: 26, y: 67, w: 56, h: 7, r: 3.5, color: p.textMuted, a: 1 },
  // primary button with its label
  { x: 26, y: 87, w: 76, h: 18, r: 9, color: p.primary, a: 1 },
  { x: 52, y: 94, w: 24, h: 4, r: 2, color: p.onPrimary, a: 1 },
];

/** Signed distance to a rounded rectangle (negative inside). */
const distance = (shape, px, py) => {
  const hx = shape.w / 2;
  const hy = shape.h / 2;
  const qx = Math.abs(px - shape.x - hx) - (hx - shape.r);
  const qy = Math.abs(py - shape.y - hy) - (hy - shape.r);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    shape.r
  );
};

/** RGBA bytes of the icon: opaque rounded square, transparent outside it. */
const renderRgba = (palette) => {
  const shapes = shapesOf(palette);
  const out = Buffer.alloc(SIZE * SIZE * 4);
  const samples = SCALE * SCALE;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let alpha = 0;
      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const px = x + (sx + 0.5) / SCALE;
          const py = y + (sy + 0.5) / SCALE;
          let cr = 0;
          let cg = 0;
          let cb = 0;
          let covered = false;
          for (const shape of shapes) {
            const d = distance(shape, px, py);
            const inside = shape.ring
              ? d <= 0 && d > -shape.ring
              : d <= 0;
            if (!inside) continue;
            if (shape.clip) {
              covered = true;
              [cr, cg, cb] = shape.color;
              continue;
            }
            [cr, cg, cb] = [
              cr + (shape.color[0] - cr) * shape.a,
              cg + (shape.color[1] - cg) * shape.a,
              cb + (shape.color[2] - cb) * shape.a,
            ];
          }
          if (!covered) continue;
          r += cr;
          g += cg;
          b += cb;
          alpha += 1;
        }
      }
      const i = (y * SIZE + x) * 4;
      if (alpha > 0) {
        out[i] = Math.round(r / alpha);
        out[i + 1] = Math.round(g / alpha);
        out[i + 2] = Math.round(b / alpha);
      }
      out[i + 3] = Math.round((alpha / samples) * 255);
    }
  }
  return out;
};

const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(body));
  return Buffer.concat([head, body, tail]);
};

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

/** Filters one row with the type 0..4 (none, sub, up, average, paeth). */
const filterRow = (type, row, prev, bpp) => {
  const out = Buffer.alloc(row.length);
  for (let i = 0; i < row.length; i++) {
    const left = i >= bpp ? row[i - bpp] : 0;
    const up = prev ? prev[i] : 0;
    const upLeft = prev && i >= bpp ? prev[i - bpp] : 0;
    const predictor = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][
      type
    ];
    out[i] = (row[i] - predictor) & 255;
  }
  return out;
};

/** Minimal PNG: 8-bit RGBA, adaptive filters, one IDAT, no ancillary chunks. */
const encodePng = (rgba, width, height) => {
  const stride = width * 4;
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = rgba.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? rgba.subarray((y - 1) * stride, y * stride) : null;
    let best = null;
    let bestCost = Infinity;
    for (let type = 0; type < 5; type++) {
      const filtered = filterRow(type, row, prev, 4);
      let cost = 0;
      for (const byte of filtered) cost += byte < 128 ? byte : 256 - byte;
      if (cost < bestCost) {
        bestCost = cost;
        best = Buffer.concat([Buffer.from([type]), filtered]);
      }
    }
    rows.push(best);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8); // depth 8, RGBA, deflate, adaptive, no interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const writeIcon = (dir) => {
  const manifest = JSON.parse(readFileSync(join(dir, 'extension.json'), 'utf8'));
  const themes = manifest.contributes?.themes;
  if (!Array.isArray(themes) || themes.length === 0) {
    throw new Error(`${dir}: extension.json has no contributes.themes`);
  }
  const png = encodePng(
    renderRgba(paletteOf(themes[0])),
    SIZE,
    SIZE,
  );
  if (png.length > MAX_BYTES) {
    throw new Error(`${dir}: icon is ${png.length} bytes, the limit is ${MAX_BYTES}`);
  }
  mkdirSync(join(dir, 'assets'), { recursive: true });
  writeFileSync(join(dir, 'assets', 'icon.png'), png);
  console.log(`${dir}/assets/icon.png  ${png.length} bytes  (${themes[0].label})`);
};

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error('usage: node scripts/theme-icon.mjs extensions/<id> [extensions/<id> ...]');
  process.exit(2);
}
for (const dir of dirs) writeIcon(dir);
