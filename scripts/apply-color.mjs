#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, openSync, writeSync, closeSync } from 'fs';
import { join } from 'path';
import { homedir, hostname } from 'os';
import { createHash } from 'crypto';

const CACHE_DIR = join(homedir(), '.cache', 'tint-my-claudecode');

const COLOR_NAMES = {
  red: 0, orange: 30, yellow: 60, green: 110,
  teal: 170, blue: 220, violet: 270, pink: 310, rose: 340,
};

function writeTty(data) {
  try {
    const fd = openSync('/dev/tty', 'w');
    writeSync(fd, data);
    closeSync(fd);
  } catch { /* no tty */ }
}

function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  };
  return [f(0), f(8), f(4)];
}

function hueToName(hue) {
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 45)  return 'orange';
  if (hue < 75)  return 'yellow';
  if (hue < 150) return 'green';
  if (hue < 195) return 'teal';
  if (hue < 255) return 'blue';
  if (hue < 285) return 'violet';
  if (hue < 330) return 'pink';
  return 'rose';
}

function makeColor(hue) {
  const [r, g, b] = hslToRgb(hue, 0.85, 0.62);
  return { name: hueToName(hue), hue, rgb: [r, g, b] };
}

function pickColor(sessionId) {
  const hash = createHash('sha256').update(sessionId).digest('hex');
  const hue = parseInt(hash.slice(0, 8), 16) % 360;
  return makeColor(hue);
}

function randomHue(currentHue) {
  let hue = Math.floor(Math.random() * 360);
  if (currentHue != null) {
    const diff = Math.min(Math.abs(hue - currentHue), 360 - Math.abs(hue - currentHue));
    if (diff < 40) hue = (hue + 60) % 360;
  }
  return hue;
}

function parseColorArg(arg) {
  const num = parseInt(arg);
  if (!isNaN(num)) return Math.abs(num) % 360;
  return COLOR_NAMES[arg.toLowerCase()] ?? null;
}

function setIterm2TabColor(r, g, b) {
  writeTty(
    `\x1b]6;1;bg;red;brightness;${r}\x07` +
    `\x1b]6;1;bg;green;brightness;${g}\x07` +
    `\x1b]6;1;bg;blue;brightness;${b}\x07`
  );
}

function setGhosttyBgColor(r, g, b) {
  const base = 18, alpha = 0.20;
  const blend = v => Math.round(base * (1 - alpha) + v * alpha);
  const hex = [r, g, b].map(v => blend(v).toString(16).padStart(2, '0')).join('');
  writeTty(`\x1b]11;#${hex}\x07`);
}

function applyColor(color) {
  const [r, g, b] = color.rgb;
  setIterm2TabColor(r, g, b);
  setGhosttyBgColor(r, g, b);
}

function saveCache(sessionId, color) {
  try {
    writeFileSync(
      join(CACHE_DIR, `${sessionId}.json`),
      JSON.stringify({ sessionId, colorName: color.name, hue: color.hue }, null, 2)
    );
  } catch { /* ignore */ }
}

// --- Parse args ---
const args = process.argv.slice(2);
const isReset   = args.includes('--reset');
const isReroll  = args.includes('--reroll');
const colorFlag = args.find(a => a.startsWith('--color='))?.slice('--color='.length);

let hookData = {};
if (!process.stdin.isTTY) {
  try {
    const raw = readFileSync('/dev/stdin', 'utf8').trim();
    if (raw) hookData = JSON.parse(raw);
  } catch { /* proceed with defaults */ }
}

const sessionId = hookData.session_id ?? process.env.CLAUDE_SESSION_ID ?? hostname();

mkdirSync(CACHE_DIR, { recursive: true });

if (isReset) {
  writeTty('\x1b]6;1;bg;*;default\x07');
  writeTty('\x1b]111\x07');
  try { writeFileSync(join(CACHE_DIR, `${sessionId}.json`), JSON.stringify({ cleared: true })); } catch { /* ignore */ }
  process.exit(0);
}

let cached = null;
try {
  cached = JSON.parse(readFileSync(join(CACHE_DIR, `${sessionId}.json`), 'utf8'));
} catch { /* no cache */ }

if (colorFlag != null) {
  const hue = parseColorArg(colorFlag);
  if (hue == null) {
    console.error(`Unknown color: ${colorFlag}. Use a name (red/orange/yellow/green/teal/blue/violet/pink/rose) or hue 0-359.`);
    process.exit(1);
  }
  const color = makeColor(hue);
  applyColor(color);
  saveCache(sessionId, color);
  process.exit(0);
}

if (isReroll) {
  const hue = randomHue(cached?.hue ?? null);
  const color = makeColor(hue);
  applyColor(color);
  saveCache(sessionId, color);
  process.exit(0);
}

if (cached?.cleared) process.exit(0);

const color = pickColor(sessionId);
applyColor(color);
saveCache(sessionId, color);
