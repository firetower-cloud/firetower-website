"use client";

import { Canvas, pad, rng } from "../_lib/ascii";

/* ── The race, on a phone ────────────────────────────────────────────────
   A hundred and fifty columns of trail becomes forty-six. Everything that
   was scenery goes; what survives is the only thing the section is for —
   two sprites, one finish line, and the distance between them.

   The lanes also stop being side by side and become one above the other,
   which is what a tall narrow screen is good at.
   ─────────────────────────────────────────────────────────────────────── */

export const RACE_COLS = 46;
export const RACE_ROWS = 18;
/* s scrub · g trail · w water · d exhaust · c crate · o swimmer · f finish · p pack · r ranger */
const KEYS = ["s", "g", "w", "d", "c", "o", "f", "p", "r"] as const;

const START = 1;
const FINISH = 43;

/** The ranger: two strides and a finish pose. `PK` is where the pack goes. */
const RANGER = [
  [" _/^\\_ ", " (oo)  ", " PK|\\  ", "   /\\  ", "  /  \\ "],
  [" _/^\\_ ", " (oo)  ", " PK|\\  ", "   |\\  ", "   | \\ "],
];
const CHEER = [" _/^\\_ ", "\\(oo)/ ", " PK|   ", "   /\\  ", "  /  \\ "];
const RANGER_W = 7;
const RANGER_Y = 4;

const SWIMMER = [
  "      /\\          ",
  "  ,__/  \\_____.   ",
  " >=   (~~~)    `. ",
  "  '-._________.'  ",
];
const SWIMMER_W = 18;
const SWIMMER_Y = 14;
const CRATE_Y = 11;

export function paintPhoneRace({
  frame,
  reduced,
  ours,
  theirs,
  finished,
  running,
  pack,
  carries,
  crate,
}: {
  frame: number;
  reduced: boolean;
  ours: number;
  theirs: number;
  finished: boolean;
  running: boolean;
  /** The glyph on the ranger's back, sized like the memory it stands for. */
  pack: string;
  /** How much that is, written above them. */
  carries: string;
  /** What the swimmer is towing, written on the crate. */
  crate: string;
}) {
  const canvas = new Canvas(RACE_ROWS, RACE_COLS);
  /** Seeded once: the scenery must not shimmer while the racers move. */
  const R = rng(11);

  canvas.text(0, 0, "START", "s");
  canvas.text(0, FINISH - 6, "FINISH", "f");
  for (let y = 1; y < RACE_ROWS; y++) canvas.set(y, FINISH, y % 2 ? ":" : "|", "f");

  // ── the land lane ──
  for (let x = 2; x < FINISH - 1; x += 2 + Math.floor(R() * 3)) canvas.set(2, x, "^", "s");
  let trail = "";
  for (let x = 0; x < FINISH; x++) trail += R() < 0.1 ? "." : "_";
  canvas.text(9, 0, trail, "g");

  // ── the water lane ──
  for (const y of [10, RACE_ROWS - 1]) {
    let line = "";
    for (let x = 0; x < FINISH; x++) {
      const v =
        Math.sin(x * 0.5 + y * 1.7 - frame * 0.18) + 0.5 * Math.sin(x * 0.17 + frame * 0.07);
      line += v > 1.1 ? "~" : v > 0.6 ? "-" : " ";
    }
    canvas.text(y, 0, line, "w");
  }

  // ── the ranger, with a pack the size of Firetower's memory ──
  const rx = START + Math.round(ours * (FINISH - START - RANGER_W));
  const sprite = finished ? CHEER : RANGER[running && !reduced ? (frame >> 1) % 2 : 0];
  sprite.forEach((row, i) => {
    const slot = row.indexOf("PK");
    const line = slot >= 0 ? `${row.slice(0, slot)}  ${row.slice(slot + 2)}` : row;
    canvas.text(RANGER_Y + i, rx, line, "r");
    if (slot >= 0) canvas.text(RANGER_Y + i, rx + slot, pack, "p");
  });
  const label = carries.replace("~", "");
  canvas.text(RANGER_Y - 1, Math.min(rx, FINISH - label.length - 1), label, "p");
  if (running) canvas.set(RANGER_Y + 4, rx - 1, R() < 0.5 ? "." : "o", "d");

  // ── the swimmer, towing the competitor's memory on its back ──
  const ox = START + Math.round(theirs * (FINISH - START - SWIMMER_W));
  const towed = crate.replace("~", "");
  canvas.text(CRATE_Y, ox + 1, `.${"-".repeat(14)}.`, "c");
  canvas.text(CRATE_Y + 1, ox + 1, `|${pad(` ${towed}`, 14)}|`, "c", true);
  canvas.text(CRATE_Y + 2, ox + 1, `'${"-".repeat(14)}'`, "c");
  SWIMMER.forEach((row, i) => canvas.text(SWIMMER_Y + i, ox, pad(row, SWIMMER_W), "o"));
  canvas.text(SWIMMER_Y + 2, ox + 6, "(~~~)", "f");
  if (finished) canvas.text(SWIMMER_Y + 1, ox + SWIMMER_W, "still", "d");

  return canvas.split(KEYS) as Record<(typeof KEYS)[number], string>;
}
