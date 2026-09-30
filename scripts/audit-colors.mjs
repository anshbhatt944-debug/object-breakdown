// node scripts/audit-colors.mjs [dir=src]  ->  lists every colour that reads blue, teal or green
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.argv[2] ?? 'src';
const EXT = new Set(['.css', '.scss', '.js', '.jsx', '.ts', '.tsx', '.html', '.svg', '.glsl', '.vert', '.frag']);
const TAILWIND = /\b(?:bg|text|border|ring|from|via|to|fill|stroke|shadow|outline|accent)-(?:cyan|teal|emerald|green|lime|sky|blue|indigo|slate|gray|zinc)-\d{2,3}\b/g;

function hslOf(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}
const bad = ({ h, s, l }) => s >= 0.1 && l > 0.04 && l < 0.96 && h >= 75 && h <= 275;
const rgbBad = (r, g, b) => bad(hslOf(r, g, b));
const hexBad = (x) => { x = x.length === 3 ? [...x].map((c) => c + c).join('') : x.slice(0, 6); return rgbBad(...[0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16))); };

function* walk(dir) {
  if (statSync(dir).isFile()) {
    if (EXT.has(extname(dir))) yield dir;
    return;
  }
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    if (name === 'data' || name === 'workspace') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.has(extname(p))) yield p;
  }
}

let hits = 0;
for (const file of walk(root)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const found = [];
    for (const m of line.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi)) if (hexBad(m[1])) found.push(m[0]);
    for (const m of line.matchAll(/\b0x([0-9a-f]{6})\b/gi)) if (hexBad(m[1])) found.push(m[0]);
    for (const m of line.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/gi)) if (rgbBad(+m[1], +m[2], +m[3])) found.push(m[0] + ')');
    for (const m of line.matchAll(/hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/gi)) if (bad({ h: +m[1], s: +m[2] / 100, l: +m[3] / 100 })) found.push(m[0] + ')');
    for (const m of line.matchAll(/oklch\(\s*[\d.]+%?\s+([\d.]+)\s+([\d.]+)/gi)) if (+m[1] > 0.02 && +m[2] >= 105 && +m[2] <= 290) found.push(m[0] + ')');
    for (const m of line.matchAll(TAILWIND)) found.push(m[0]);
    for (const f of found) { console.log(`${file}:${i + 1}  ${f}`); hits++; }
  });
}
console.log(hits ? `\n${hits} blue/teal/green colour(s) found` : 'clean: no blue, teal or green');
process.exit(hits ? 1 : 0);
