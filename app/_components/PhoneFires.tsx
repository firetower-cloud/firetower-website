"use client";

import { Canvas, compact, rng } from "../_lib/ascii";

/* ── Token watch, on a phone ─────────────────────────────────────────────
   The desktop ridge is a hundred and twenty-four columns: five fires, a
   tower, labels under each one. At 390px that is five pixels a character.

   Narrowed to forty-six, the labels have to go — but the labels were never
   the argument. The argument is that one of these fires is enormous and one
   is a candle, and a shape says that without a single character of help.
   The chips underneath are the legend, and the selected fire is the one
   with the tower looking at it.
   ─────────────────────────────────────────────────────────────────────── */

export const FIRE_COLS = 46;
export const FIRE_ROWS = 18;
/* s sky · g ground · t tower · l quiet · n name · e edge · m flame · c core */
const KEYS = ["s", "g", "t", "l", "n", "e", "m", "c"] as const;

/** One fire per provider, evenly spaced across the width. */
const LANES = [4, 13, 22, 31, 40];
const BASE = 14;

const TOWER = [
  "   .^.   ",
  " _.'|'._ ",
  "/___|___\\",
  "|[ ][ ] |",
  "[=======]",
  "  |\\ /|  ",
  "  |/ \\|  ",
];
const TOWER_X = 36;

export function paintPhoneFires({
  frame,
  reduced,
  rates,
  sel,
  names,
}: {
  frame: number;
  reduced: boolean;
  rates: number[];
  sel: number;
  names: string[];
}) {
  const canvas = new Canvas(FIRE_ROWS, FIRE_COLS);
  const R = rng(reduced ? 5 : frame * 131 + 7);
  /** Seeded once: the scenery must not shimmer while the fires move. */
  const S = rng(99);

  for (let n = 0; n < 14; n++) {
    const y = Math.floor(S() * 7);
    const x = Math.floor(S() * FIRE_COLS);
    if (x < TOWER_X - 1) canvas.set(y, x, S() < 0.3 ? "+" : ".", "s");
  }
  TOWER.forEach((row, i) => canvas.text(i, TOWER_X, row, "t"));
  const lampChars = "#%8&";
  for (const dx of [2, 5]) canvas.set(3, TOWER_X + dx, lampChars.charAt(Math.floor(R() * 4)), "m");

  let ground = "";
  for (let x = 0; x < FIRE_COLS; x++) ground += S() < 0.1 ? "^" : "_";
  canvas.text(BASE + 1, 0, ground, "g");

  // One fire per provider, as tall as it is expensive.
  const maxRate = Math.max(...rates);
  const tops: number[] = [];
  rates.forEach((rate, i) => {
    // Nearer linear than the desktop's square root: at this width the only
    // thing carrying the comparison is height, so it has to be honest.
    const h = Math.round(2 + 11 * Math.pow(rate / maxRate, 0.75));
    const cx = LANES[i];
    tops.push(BASE - h);
    for (let k = 0; k < h; k++) {
      const y = BASE - k;
      const frac = k / h;
      const halfW = (1 - Math.pow(frac, 1.35)) * (1 + h * 0.22);
      const sway = Math.round(Math.sin(frame * 0.35 + k * 0.9 + i * 2) * 0.8 * frac);
      for (let dx = -Math.ceil(halfW); dx <= Math.ceil(halfW); dx++) {
        if (Math.abs(dx) > halfW + 0.2) continue;
        const heat = 1 - (Math.abs(dx) / (halfW + 0.6)) * 0.65 - frac * 0.7 + (R() - 0.5) * 0.3;
        if (heat > 0.6) canvas.set(y, cx + dx + sway, "#@%&".charAt(Math.floor(R() * 4)), "c");
        else if (heat > 0.36) canvas.set(y, cx + dx + sway, "*&$%(){}".charAt(Math.floor(R() * 8)), "m");
        else if (heat > 0.12) canvas.set(y, cx + dx + sway, "^:;'\"`".charAt(Math.floor(R() * 6)), "e");
      }
    }
    if (R() < 0.6) canvas.set(BASE - h - 1, cx + Math.round((R() - 0.5) * 3), R() < 0.5 ? "." : "'", "m");
  });

  // The tower's gaze, and a marker under whichever fire it is reading.
  const target = LANES[sel];
  const y0 = 4;
  const y1 = Math.max(0, tops[sel] - 2);
  const x0 = TOWER_X - 1;
  const steps = Math.max(Math.abs(target - x0), 2);
  for (let s = 2; s < steps; s += 2) {
    const y = Math.round(y0 + ((y1 - y0) * s) / steps);
    const x = Math.round(x0 + ((target - x0) * s) / steps);
    if (canvas.at(y, x) === " ") canvas.set(y, x, ".", "m");
  }
  canvas.set(BASE + 2, target, "^", "m");

  const label = `${names[sel]}  ${compact(rates[sel])}/h`;
  canvas.text(BASE + 3, Math.max(0, Math.min(FIRE_COLS - label.length, target - 6)), label, "n");

  return canvas.split(KEYS) as Record<(typeof KEYS)[number], string>;
}
