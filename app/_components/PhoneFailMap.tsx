"use client";

import { Canvas, box, pad, rng } from "../_lib/ascii";

/* ── Break it yourself, on a phone ───────────────────────────────────────
   The desktop map is a hundred columns of wiring with a flame for a cursor.
   Neither travels: a hundred columns is five pixels on a phone, and a
   cursor is a thing a phone does not have.

   So the same stack is redrawn at forty-six columns — three machines wide
   instead of three machines plus their addresses — and the interaction
   becomes what a phone actually offers: tap a box, it catches fire.
   ─────────────────────────────────────────────────────────────────────── */

export const PHONE_COLS = 46;
export const PHONE_ROWS = 23;
/* s wiring · t name · l label · e down · a recovered/kept · p packet */
const KEYS = ["s", "t", "l", "e", "a", "p"] as const;

/** Where the three columns of machines run, and the trunk they hang off. */
const LANES = [6, 22, 38];
const TRUNK = 22;
/** Box left edges, 14 columns wide, centred under each lane. */
const BOX_X = [0, 16, 32];
const BOX_W = 14;

const FIRE = "^*~&%#(){}";

export type PartState = "up" | "down" | "burning" | "recovering";

/** Where every tappable part sits on the grid, for the buttons laid over it. */
export const PHONE_HITS: { id: string; r: number; c: number; w: number; h: number }[] = [
  { id: "d0", r: 1, c: 0, w: 12, h: 1 },
  { id: "d1", r: 1, c: 17, w: 11, h: 1 },
  { id: "d2", r: 1, c: 33, w: 12, h: 1 },
  { id: "s", r: 5, c: 4, w: 38, h: 4 },
  ...[0, 1, 2].map((k) => ({ id: `w${k}`, r: 12, c: BOX_X[k], w: BOX_W, h: 4 })),
  ...[0, 1, 2].map((k) => ({ id: `a${k}`, r: 17, c: BOX_X[k], w: BOX_W, h: 4 })),
];

const DEVICES = ["[ laptop ]", "[ phone ]", "[desktop]"];
const WORKERS = ["Mac Studio", "Hetzner VM", "homelab"];
const AGENTS = [
  ["o claude", "ledger"],
  ["o codex", "api"],
  ["* claude", "web-app"],
];

export function paintPhoneMap({
  frame,
  reduced,
  stateOf,
  burning,
}: {
  frame: number;
  reduced: boolean;
  stateOf: (id: string) => PartState;
  /** How long ago each burning part caught, 0–1, so the flame can settle. */
  burning: (id: string) => number;
}) {
  const canvas = new Canvas(PHONE_ROWS, PHONE_COLS);
  const R = rng(frame * 7919 + 3);
  const isUp = (id: string) => ["up", "recovering"].includes(stateOf(id));
  const serverUp = isUp("s");
  const running = [0, 1, 2].filter((k) => isUp(`a${k}`) && isUp(`w${k}`)).length;

  /** Which colour a part's own characters take. */
  const tone = (id: string, fallback = "t") => {
    const s = stateOf(id);
    return s === "down" ? "e" : s === "recovering" ? "a" : fallback;
  };

  // ── the devices, and the bus they share ──
  DEVICES.forEach((label, k) => {
    canvas.text(1, BOX_X[k] + (k === 1 ? 1 : 0), label, tone(`d${k}`));
    const status = stateOf(`d${k}`);
    if (status === "down") canvas.text(0, LANES[k] - 2, "down", "e");
    else if (status === "recovering") canvas.text(0, LANES[k] - 3, "online", "a");
    else if (!serverUp) canvas.text(0, LANES[k] - 3, "waiting", "l");
    canvas.set(2, LANES[k], "|", "s");
  });
  canvas.set(3, LANES[0], "'", "s");
  canvas.set(3, LANES[2], "'", "s");
  for (let c = LANES[0] + 1; c < LANES[2]; c++) canvas.set(3, c, "-", "s");
  canvas.set(3, TRUNK, "+", "s");
  canvas.set(4, TRUNK, "|", "s");
  canvas.text(4, TRUNK + 3, "https", "l");

  // ── the server ──
  const serverState = stateOf("s");
  const serverLines = box(38, [
    "firetower",
    serverState === "down"
      ? "down"
      : serverState === "recovering"
        ? "replaying logs"
        : "inbox 2 waiting, logs replayed",
  ]);
  canvas.block(5, 4, serverLines, tone("s", "s"), true);
  canvas.text(6, 6, "firetower", tone("s"));
  canvas.text(
    7,
    6,
    serverState === "down"
      ? "down"
      : serverState === "recovering"
        ? "replaying logs"
        : "inbox 2 waiting, logs replayed",
    serverState === "up" ? "l" : tone("s"),
  );

  canvas.set(9, TRUNK, "|", "s");
  canvas.text(9, TRUNK + 3, "ssh", "l");
  canvas.set(10, LANES[0], ".", "s");
  canvas.set(10, LANES[2], ".", "s");
  for (let c = LANES[0] + 1; c < LANES[2]; c++) canvas.set(10, c, "-", "s");
  canvas.set(10, TRUNK, "+", "s");
  LANES.forEach((lane) => canvas.set(11, lane, "|", "s"));

  // ── the workers, and the agents under them ──
  [0, 1, 2].forEach((k) => {
    const worker = stateOf(`w${k}`);
    const agent = stateOf(`a${k}`);

    canvas.block(12, BOX_X[k], box(BOX_W, [WORKERS[k], ""]), "s", true);
    canvas.text(13, BOX_X[k] + 2, WORKERS[k], tone(`w${k}`));
    canvas.text(
      14,
      BOX_X[k] + 2,
      worker === "down"
        ? "down"
        : worker === "recovering"
          ? "restarting"
          : serverUp
            ? "up"
            : "logs local",
      worker === "up" ? "l" : tone(`w${k}`, "a"),
    );
    canvas.set(16, LANES[k], "|", worker === "down" ? "e" : "s");

    canvas.block(17, BOX_X[k], box(BOX_W, [AGENTS[k][0], ""]), "s", true);
    canvas.text(18, BOX_X[k] + 2, AGENTS[k][0], tone(`a${k}`, k === 2 ? "a" : "t"));
    canvas.text(
      19,
      BOX_X[k] + 2,
      agent === "down"
        ? "branch kept"
        : worker === "down"
          ? "tree kept"
          : agent === "recovering" || worker === "recovering"
            ? "resuming"
            : AGENTS[k][1],
      agent === "down" ? "e" : worker === "down" || agent === "recovering" ? "a" : "l",
    );
  });

  // ── fire, over whatever is still catching ──
  for (const hit of PHONE_HITS) {
    if (stateOf(hit.id) !== "burning") continue;
    for (let r = hit.r - 1; r < hit.r + hit.h; r++) {
      for (let c = hit.c; c < hit.c + hit.w; c++) {
        const inside = r >= hit.r;
        if ((inside && (canvas.at(r, c) !== " " || R() < 0.3)) || (!inside && R() < 0.2)) {
          canvas.set(r, c, FIRE.charAt(Math.floor(R() * FIRE.length)), R() < 0.55 ? "e" : "a");
        }
      }
    }
  }
  void burning;

  // ── traffic, stopping wherever something is down ──
  if (!reduced) {
    [0, 1, 2].forEach((k) => {
      const rows = [2, 3, 4, 9, 10, 11, 16];
      const at = rows[Math.floor(frame * 0.4 + k * 2.3) % rows.length];
      const blocked =
        (at <= 4 && !isUp(`d${k}`)) ||
        (at <= 10 && !serverUp) ||
        (at >= 10 && !isUp(`w${k}`)) ||
        (at >= 16 && !isUp(`a${k}`));
      if (blocked) return;
      const col = at === 3 || at === 10 ? TRUNK + ((frame % 7) - 3) * 2 : LANES[k];
      if (at === 4 || at === 9) canvas.set(at, TRUNK, "*", "p");
      else canvas.set(at, Math.max(LANES[0], Math.min(LANES[2], col)), "*", "p");
    });
  }

  const caption =
    running === 3
      ? "every agent still working"
      : running === 0
        ? "nothing running. every branch is on disk."
        : `${running} of 3 working. the rest lost nothing.`;
  canvas.text(PHONE_ROWS - 1, 0, pad(caption, PHONE_COLS), running === 3 ? "l" : running === 0 ? "e" : "a");

  return { layers: canvas.split(KEYS) as Record<(typeof KEYS)[number], string>, running };
}
