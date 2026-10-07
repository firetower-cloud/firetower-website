"use client";

import { Canvas, pad, repeat } from "../_lib/ascii";

/* ── The skills library, on a phone ──────────────────────────────────────
   The desktop drawing is a cabinet on the left and four camps on the right
   with trails between them. The cabinet is the part a phone already has —
   it is the list in the panel underneath — so what is left to draw is the
   part the list cannot say: who this skill actually reaches.

   One row per teammate. A solid trail with something moving down it means
   their agents can use it; a dotted one means they cannot.
   ─────────────────────────────────────────────────────────────────────── */

export const TRAIL_COLS = 46;
export const TRAIL_ROWS = 11;
/* s unlit · b spine · t name · l quiet · a lit · p traffic */
const KEYS = ["s", "b", "t", "l", "a", "p"] as const;

/** Where the trail runs, where the tent stands, where the name starts. */
const TRAIL_FROM = 3;
const TRAIL_TO = 22;
const TENT_X = 24;
const NAME_X = 31;

export function paintPhoneTrails({
  frame,
  reduced,
  skill,
  team,
  shared,
}: {
  frame: number;
  reduced: boolean;
  skill: { name: string; ver: string };
  team: { name: string; agent: string }[];
  shared: string[];
}) {
  const canvas = new Canvas(TRAIL_ROWS, TRAIL_COLS);

  canvas.text(0, 0, `[#] ${skill.name}`, "t");
  canvas.text(0, TRAIL_COLS - skill.ver.length, skill.ver, "l");
  canvas.set(1, 1, "|", "b");

  team.forEach((person, i) => {
    const top = 2 + i * 2;
    const has = shared.includes(person.name);
    const last = i === team.length - 1;
    canvas.set(top, 1, last ? "'" : "+", "b");
    if (!last) canvas.set(top + 1, 1, "|", "b");

    for (let c = TRAIL_FROM; c <= TRAIL_TO; c++) {
      canvas.set(top, c, has ? "-" : ".", has ? "a" : "s");
    }
    // Something travelling the trail is what "their agents can use it" looks
    // like; an unlit trail is just a path nobody is on.
    if (has && !reduced) {
      const span = TRAIL_TO - TRAIL_FROM;
      const at = TRAIL_FROM + Math.floor((frame * 0.7 + i * 5) % (span + 6));
      if (at <= TRAIL_TO) canvas.set(top, at, "*", "p");
    }

    canvas.text(top, TENT_X + 1, "/\\", has ? "a" : "s");
    canvas.text(top + 1, TENT_X, "/__\\", has ? "a" : "s");
    canvas.text(top, NAME_X, person.name, has ? "a" : "t");
    canvas.text(top + 1, NAME_X, person.agent, "l");
  });

  const count = shared.length;
  canvas.text(
    TRAIL_ROWS - 1,
    0,
    pad(
      count === team.length
        ? `${repeat("", 0)}the whole team can use it`
        : count === 0
          ? "nobody else can use it yet"
          : `${count} of ${team.length} teammates can use it`,
      TRAIL_COLS,
    ),
    count ? "l" : "s",
  );

  return canvas.split(KEYS) as Record<(typeof KEYS)[number], string>;
}
