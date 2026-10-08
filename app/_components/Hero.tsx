"use client";

import { useEffect, useMemo, useState } from "react";
import { REPO_URL } from "../_lib/site";
import { duration, rng } from "../_lib/ascii";
import { useReducedMotion } from "../_lib/frames";
import { INSTALL, InstallCommand } from "./InstallCommand";
import styles from "./Hero.module.css";

/* ── The ridge, drawn in characters ──────────────────────────────────────
   One fire lookout on a near summit, three worker cabins on the ridge
   behind it, and the lookout's lamp sweeping between them — stopping on
   each cabin long enough to read out what the agent there is doing.

   It is the product's whole claim as a picture: the thing you are looking
   at is not where the work happens. The work is on the ridge, in the
   cabins, with their lights on, whether or not anybody is watching.

   The canvas is 240×64 cells. The static parts — the tower, the summit,
   the far ridge, the pines — are built once and never recomputed; only the
   five moving layers (sky, code, headline, grass, lamp) are redrawn each
   frame, at 14fps, which is slow enough to read as a flicker rather than a
   smooth animation and cheap enough to leave the main thread alone.
   ─────────────────────────────────────────────────────────────────────── */

const COLS = 240;
const ROWS = 64;
/** Where the lookout stands. */
const CX = 200;
/** The cab's top row, and the row the legs land on. */
const TOP = 10;
const BOT = 50;
/** How far along the ridge the lamp sweeps. */
const XMIN = 132;
const XMAX = 234;

type Host = { c: number; label: string; at: "below" | "belowLeft" | "belowRight" };

const HOSTS: Host[] = [
  { c: 148, label: "hetzner-01 · agent running · 6h41m", at: "below" },
  { c: 172, label: "mac-mini · PR #212 opened", at: "belowLeft" },
  { c: 226, label: "homelab · reconnected", at: "belowRight" },
];

/** The code that scrolls past in the dark, one line at a time. */
const SNIPPETS: { r: number; c: number; text: string; per: number; off: number }[] = [
  { r: 44, c: 52, text: "ssh hetzner-01", per: 0, off: 0 },
  { r: 49, c: 140, text: "tmux new -d -s eng-142", per: 0, off: 0 },
  { r: 50, c: 96, text: "worker: connected", per: 0, off: 0 },
  { r: 52, c: 116, text: "git worktree add ../eng-142 -b eng-142", per: 0, off: 0 },
  { r: 54, c: 88, text: "linear: ENG-142 -> in progress", per: 0, off: 0 },
  { r: 55, c: 150, text: "tmux attach -t eng-142", per: 0, off: 0 },
  { r: 57, c: 104, text: "gh pr create --fill", per: 0, off: 0 },
  { r: 59, c: 126, text: "worker: reconnected after 3m12s", per: 0, off: 0 },
  { r: 61, c: 90, text: "agent: still running", per: 0, off: 0 },
  { r: 62, c: 150, text: "cargo build --release", per: 0, off: 0 },
  { r: 63, c: 100, text: INSTALL, per: 0, off: 0 },
];

const HEADLINE = { r: 47, c: 92, text: "# laptop closed. agents still running." };

type Grid = string[][];

function blank(fill = " "): Grid {
  const g: Grid = [];
  for (let r = 0; r < ROWS; r++) g.push(new Array<string>(COLS).fill(fill));
  return g;
}

function put(g: Grid, r: number, c: number, ch: string) {
  r = Math.round(r);
  c = Math.round(c);
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) g[r][c] = ch;
}

function get(g: Grid, r: number, c: number) {
  r = Math.round(r);
  c = Math.round(c);
  return r >= 0 && r < ROWS && c >= 0 && c < COLS ? g[r][c] : " ";
}

const str = (g: Grid) => g.map((row) => row.join("")).join("\n");

const gauss = (c: number, m: number, w: number) => Math.exp(-Math.pow((c - m) / w, 2));

/** The far ridge's profile: three dips, one per cabin, plus a little noise. */
const farRow = (c: number) =>
  46 -
  2 * gauss(c, 118, 9) -
  4 * gauss(c, 148, 7) -
  5 * gauss(c, 172, 6) -
  4.5 * gauss(c, 226, 6) +
  0.8 * Math.sin(c * 0.35);

/** The near summit the tower stands on: flat under the legs, then falling. */
const nearRow = (c: number) => {
  const dx = Math.abs(c - CX);
  return dx <= 18 ? BOT + 1 : BOT + 1 + Math.pow(dx - 18, 1.35) * 0.32;
};

type Scene = {
  tower: Grid;
  towerText: string;
  land: Grid;
  landText: string;
  far: Grid;
  farText: string;
  occupied: boolean[][];
  stars: { r: number; c: number; phase: number; speed: number }[];
  glass: number[];
  glassRows: number[];
  hosts: (Host & { r: number })[];
  grassCols: number[];
};

/** Everything that never moves. Built once, on first render. */
function buildScene(): Scene {
  const R = rng(11);
  const mask: boolean[][] = [];
  for (let r = 0; r < ROWS; r++) mask.push(new Array<boolean>(COLS).fill(false));
  const tower = blank();
  const land = blank();
  const far = blank();
  const X0 = CX - 17;
  const T = TOP;

  // Code keeps clear of nothing, so the terrain has to keep clear of it.
  for (const s of SNIPPETS) {
    s.per = 120 + Math.floor(R() * 160);
    s.off = Math.floor(R() * 300);
  }
  for (const s of [...SNIPPETS, HEADLINE]) {
    for (let i = -1; i <= s.text.length + 1; i++) {
      if (s.r >= 0 && s.r < ROWS && s.c + i >= 0 && s.c + i < COLS) mask[s.r][s.c + i] = true;
    }
  }

  // ── the cab, and the aerial on top of it ──
  const cab = [
    "                .^.                ",
    "            _.-' | '-._            ",
    "        _.-'     |     '-._        ",
    "    _.-'         |         '-._    ",
    " /_______________________________\\ ",
    "    |[   ][   ][   ][   ][   ]|    ",
    "    |[   ][   ][   ][   ][   ]|    ",
    "  +=============================+  ",
    "  | | | | | | | | | | | | | | | |  ",
    " [===============================] ",
    "      \\                     /      ",
    "        \\                 /        ",
  ];
  for (let i = 0; i < cab.length; i++) {
    for (let j = 0; j < cab[i].length; j++) {
      if (cab[i][j] !== " ") put(tower, T + i, X0 + j, cab[i][j]);
    }
  }
  for (let ar = T - 4; ar <= T + 2; ar++) put(tower, ar, X0 + 9, "|");
  put(tower, T - 4, X0 + 8, "-");
  put(tower, T - 4, X0 + 10, "-");
  put(tower, T - 4, X0 + 11, "-");
  put(tower, T - 5, X0 + 11, "|");
  put(tower, T, X0 + 24, "#");
  put(tower, T + 1, X0 + 24, "#");

  // The windows, left to right. The lamp is whichever pair is dark.
  const glass: number[] = [];
  for (const j of [6, 7, 8, 11, 12, 13, 16, 17, 18, 21, 22, 23, 26, 27, 28]) glass.push(X0 + j);

  // ── the lattice: legs, bracing, ladder and landings ──
  const top = T + 10;
  const bot = BOT;
  const H = bot - top;
  const hf = (r: number) => 8 + ((r - top) / H) * 7;
  const hb = (r: number) => 5 + ((r - top) / H) * 5;
  for (let r = top; r <= bot; r++) {
    put(tower, r, CX - hb(r), ":");
    put(tower, r, CX + hb(r), ":");
  }
  const bays: number[] = [];
  for (let bb = top; bb < bot; bb += 10) bays.push(bb);
  if (bot - bays[bays.length - 1] < 5) bays[bays.length - 1] = bot;
  else bays.push(bot);
  for (let b = 0; b < bays.length - 1; b++) {
    const s = bays[b];
    const e = bays[b + 1];
    for (let r = s + 1; r < e; r++) {
      const f = (r - s) / (e - s);
      const xa = CX - hf(s) + (CX + hf(e) - (CX - hf(s))) * f;
      const xb = CX + hf(s) + (CX - hf(e) - (CX + hf(s))) * f;
      const lo = Math.round(CX - hf(r));
      const hi = Math.round(CX + hf(r));
      const ca = Math.round(xa);
      const cb = Math.round(xb);
      if (ca > lo && ca < hi) put(tower, r, ca, "\\");
      if (cb > lo && cb < hi) put(tower, r, cb, ca === cb ? "X" : "/");
    }
    // The ladder zig-zags, a flight per bay, with a landing at the turn.
    const fs = s + 2;
    const fe = e - 2;
    const goRight = b % 2 === 0;
    for (let r = fs; r <= fe; r++) {
      const g = (r - fs) / Math.max(1, fe - fs);
      const x = goRight ? CX - 5 + g * 10 : CX + 5 - g * 10;
      if (goRight) {
        put(tower, r, x - 1, "_");
        put(tower, r, x, "\\");
      } else {
        put(tower, r, x, "/");
        put(tower, r, x + 1, "_");
      }
    }
    const landX = goRight ? CX + 5 : CX - 5;
    for (let lx = -2; lx <= 2; lx++) put(tower, fe + 1, landX + lx, "=");
  }
  for (let r = top; r <= bot; r++) {
    const L = Math.round(CX - hf(r));
    const Rr = Math.round(CX + hf(r));
    const pL = Math.round(CX - hf(r - 1));
    const pR = Math.round(CX + hf(r - 1));
    put(tower, r, L, L < pL ? "/" : "|");
    put(tower, r, Rr, Rr > pR ? "\\" : "|");
    if (bays.indexOf(r) > 0 && r < bot) for (let c = L + 1; c < Rr; c++) put(tower, r, c, "=");
  }
  for (const x of [CX - hf(bot), CX + hf(bot), CX - hb(bot), CX + hb(bot)]) {
    put(tower, bot + 1, x - 1, "[");
    put(tower, bot + 1, x, "#");
    put(tower, bot + 1, x + 1, "]");
  }

  // ── the near summit, and the pines on it ──
  const dense = "#%&@8*$^#%";
  for (let c = 0; c < COLS; c++) {
    const dx = Math.abs(c - CX);
    const rr = Math.ceil(nearRow(c));
    if (rr >= ROWS) continue;
    for (let r = rr; r < ROWS; r++) {
      const depth = r - rr;
      const prob = depth < 9 ? 0.9 : 0.9 - (depth - 9) * 0.16;
      if (R() < prob && !mask[r][c] && tower[r][c] === " ") {
        put(land, r, c, depth === 0 ? (R() < 0.6 ? "^" : "%") : dense[Math.floor(R() * dense.length)]);
      }
    }
    if (dx > 18 && c % 3 === 0 && R() < 0.7) {
      for (const [dr, dc, ch] of [
        [-2, 0, "^"],
        [-1, -1, "/"],
        [-1, 0, "|"],
        [-1, 1, "\\"],
      ] as [number, number, string][]) {
        if (!mask[Math.min(ROWS - 1, Math.max(0, rr + dr))]?.[c + dc]) put(land, rr + dr, c + dc, ch);
      }
    }
  }
  const pine = ["   ^   ", "  /^\\  ", " /^^^\\ ", "  /^\\  ", " /^^^\\ ", "/^^^^^\\", "  |||  "];
  for (const [pc, scale] of [
    [CX - 27, 1],
    [CX - 35, 0.7],
    [CX + 24, 1],
    [CX + 32, 0.7],
  ] as [number, number][]) {
    const base = Math.ceil(nearRow(pc)) - 1;
    const rows = scale < 1 ? pine.slice(2) : pine;
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < 7; j++) {
        const ch = rows[i][j];
        const rr = base - rows.length + 1 + i;
        const cc = pc - 3 + j;
        const masked = rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS ? mask[rr][cc] : false;
        if (ch !== " " && !masked && get(tower, rr, cc) === " ") put(land, rr, cc, ch);
      }
    }
  }

  // ── the far ridge, and the cabins on it ──
  const hosts = HOSTS.map((h) => ({ ...h, r: Math.ceil(farRow(h.c)) - 1 }));
  const nearHost = (c: number) => hosts.some((h) => Math.abs(c - h.c) <= 2);
  const dust = ".:'.";
  for (let c = 40; c < COLS; c++) {
    const rf = Math.ceil(farRow(c));
    for (let r = rf; r <= Math.min(rf + 4, ROWS - 1); r++) {
      if (
        r >= 0 &&
        land[r][c] === " " &&
        tower[r][c] === " " &&
        !mask[r][c] &&
        R() < 0.66 - (r - rf) * 0.12
      ) {
        put(far, r, c, dust[Math.floor(R() * dust.length)]);
      }
    }
    if (
      c % 2 === 0 &&
      !nearHost(c) &&
      R() < 0.55 &&
      rf - 1 >= 0 &&
      !mask[rf - 1][c] &&
      land[rf - 1][c] === " " &&
      tower[rf - 1][c] === " "
    ) {
      put(far, rf - 1, c, "^");
    }
  }
  for (const h of hosts) {
    put(far, h.r - 1, h.c - 2, "/");
    put(far, h.r - 1, h.c - 1, "_");
    put(far, h.r - 1, h.c, "_");
    put(far, h.r - 1, h.c + 1, "_");
    put(far, h.r - 1, h.c + 2, "\\");
    put(far, h.r, h.c - 2, "|");
    put(far, h.r, h.c + 2, "|");
  }
  // Guy wires, from the cab down past the legs.
  for (const [x0, dir] of [
    [X0 + 1, -1],
    [X0 + 33, 1],
  ] as [number, number][]) {
    const r0 = T + 9;
    const r1 = BOT;
    const x1 = x0 + dir * 17;
    for (let r = r0 + 1; r <= r1; r += 2) {
      const x = x0 + ((x1 - x0) * (r - r0)) / (r1 - r0);
      if (get(tower, r, x) === " " && get(land, r, x) === " ") put(far, r, x, dir < 0 ? "/" : "\\");
    }
  }

  const occupied: boolean[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row = new Array<boolean>(COLS).fill(false);
    for (let c = 0; c < COLS; c++) {
      row[c] = tower[r][c] !== " " || land[r][c] !== " " || far[r][c] !== " ";
    }
    occupied.push(row);
  }

  const stars: Scene["stars"] = [];
  for (let n = 0; n < 300; n++) {
    const r = Math.floor(R() * 40);
    const c = Math.floor(R() * COLS);
    if (occupied[r][c]) continue;
    stars.push({ r, c, phase: R() * 6.283, speed: 0.5 + R() });
  }

  const grassCols: number[] = [];
  for (let c = CX - 18; c <= CX + 18; c++) if (tower[BOT][c] === " ") grassCols.push(c);

  return {
    tower,
    towerText: str(tower),
    land,
    landText: str(land),
    far,
    farText: str(far),
    occupied,
    stars,
    glass,
    glassRows: [T + 5, T + 6],
    hosts,
    grassCols,
  };
}

/** The lamp's sweep. Walks the ridge, stops on a cabin, reports, moves on. */
type Sweep = { t: number; x: number; dir: number; lockUntil: number; host: number; last: number };

const FIRST: Sweep = { t: 0, x: XMIN, dir: 1, lockUntil: -1, host: -1, last: -1 };
/** The pose a still scene holds: far enough in that everything is drawn. */
const STILL: Sweep = { ...FIRST, t: 220 };

export function Hero() {
  const scene = useMemo(() => buildScene(), []);
  const reduced = useReducedMotion();
  const [live, setLive] = useState<Sweep>(FIRST);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setLive((s) => {
        const t = s.t + 1;
        let { x, dir, lockUntil, host, last } = s;
        if (t >= lockUntil) {
          x += dir * 0.42;
          if (x > XMAX) {
            x = XMAX;
            dir = -1;
          }
          if (x < XMIN) {
            x = XMIN;
            dir = 1;
          }
          for (let i = 0; i < HOSTS.length; i++) {
            if (i !== last && Math.abs(x - HOSTS[i].c) < 0.8) {
              x = HOSTS[i].c;
              lockUntil = t + 58;
              host = i;
              last = i;
              break;
            }
          }
        }
        return { t, x, dir, lockUntil, host, last };
      });
    }, 70);
    return () => window.clearInterval(id);
  }, [reduced]);

  const sweep = reduced ? STILL : live;
  const frame = useMemo(() => paint(scene, sweep, reduced), [scene, sweep, reduced]);

  return (
    <section aria-label="Introduction" className={styles.hero}>
      <div className={styles.scene} aria-hidden>
        <div className={styles.glow} style={{ opacity: frame.glow }} />
        <pre className={`${styles.layer} hero-layer`} style={{ color: "#6b6b70" }}>{frame.sky}</pre>
        <pre className="hero-layer" style={{ color: "#2e2e31" }}>{scene.farText}</pre>
        <pre className="hero-layer" style={{ color: "#29292c" }}>{frame.code}</pre>
        <pre className="hero-layer" style={{ color: "#5a5a60" }}>{scene.landText}</pre>
        <pre className="hero-layer" style={{ color: "#5a5a60" }}>{frame.grass}</pre>
        <pre className="hero-layer" style={{ color: "#d6d6da" }}>{scene.towerText}</pre>
        <pre className="hero-layer" style={{ color: "#ededef" }}>{frame.bright}</pre>
        <pre
          className="hero-layer"
          style={{ color: "var(--color-ember)", textShadow: "0 0 7px var(--color-ember)" }}
        >
          {frame.lamp}
        </pre>
      </div>

      <div className={styles.veil} aria-hidden />

      <div className={styles.inner}>
        <div className="flex max-w-[620px] flex-col items-start gap-7">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2.5 rounded-[3px] border border-rim bg-ground/70 px-3.5 py-2 font-mono text-[12.5px] tracking-[0.04em] text-dim transition-colors hover:text-bone"
          >
            <span className="rounded-[2px] bg-ember px-1.5 py-0.5 font-semibold text-ink">AGPL</span>
            OPEN SOURCE, SELF-HOSTED, WRITTEN IN RUST
          </a>

          <h1 className="display text-[clamp(38px,6.2vw,64px)] leading-[0.98] [text-shadow:0_2px_30px_var(--color-ground)]">
            Run every agent, on every machine, from one tower.
          </h1>

          <p className="max-w-[540px] text-[clamp(16px,2vw,18px)] leading-[1.6] text-dim [text-shadow:0_1px_16px_var(--color-ground)]">
            Firetower is a control plane for coding agents, on a server you own. It
            installs a worker on every machine you can SSH into, decides where each agent
            runs, gives it its own branch and worktree, and supervises all of them until
            one needs a human.
          </p>

          <div className="flex flex-wrap gap-2.5 font-mono text-[14px] tracking-[0.04em]">
            <a
              href="/docs/getting-started"
              className="rounded-[3px] bg-ember px-[22px] py-[15px] font-semibold text-ink transition-opacity hover:opacity-90"
            >
              SELF-HOST IN 5 MIN &gt;
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-[3px] border border-rim bg-ground/70 px-[22px] py-[15px] text-bone transition-colors hover:bg-raise"
            >
              VIEW ON GITHUB
            </a>
          </div>

          <InstallCommand className="w-full max-w-[540px]" />
        </div>
      </div>

      <div
        className={`${styles.status} flex flex-wrap items-center gap-x-[22px] gap-y-2 font-mono text-[12px] tracking-[0.06em]`}
      >
        <span className="flex items-center gap-2.5 text-dim">
          <span className="h-[7px] w-[7px] rounded-full bg-ember shadow-[0_0_8px_var(--color-ember)]" />
          3 AGENTS RUNNING
        </span>
        <span className="text-mute">LAPTOP CLOSED {frame.closedFor} AGO</span>
      </div>
    </section>
  );
}

/* ── one frame ──────────────────────────────────────────────────────────── */

function paint(S: Scene, sweep: Sweep, still: boolean) {
  const { t, x, lockUntil } = sweep;
  const R = rng(t * 9301 + 17);
  const lamp = blank();
  const sky = blank();
  const code = blank();
  const bright = blank();
  const grass = blank();
  const locked = t < lockUntil;
  const H = sweep.host >= 0 ? S.hosts[sweep.host] : null;

  // The lamp-lit cab. The lookout turns toward whichever cabin it is reading,
  // so the dark pair of windows is where it is facing.
  const idx = locked && H ? (H.c < CX ? 1 : 12) : Math.round(6.5 + 6 * Math.sin(t * 0.012));
  const lampChars = "=:#%8";
  S.glass.forEach((c, gi) => {
    S.glassRows.forEach((r, ri) => {
      if (((gi === idx || gi === idx + 1) && ri === 1) || (gi === idx && ri === 0)) return;
      put(lamp, r, c, lampChars[Math.floor(R() * lampChars.length)]);
    });
  });

  // Every cabin keeps its light on, with a thread of chimney smoke.
  S.hosts.forEach((h, hi) => {
    for (let w = -1; w <= 1; w++) put(lamp, h.r, h.c + w, R() < 0.85 ? "#" : "%");
    for (let i = 1; i <= 4; i++) {
      if (R() < 0.85 - i * 0.12) {
        put(
          sky,
          h.r - 1 - i,
          h.c + 1 + Math.round(Math.sin(t * 0.1 + hi * 2 - i * 0.8) * i * 0.3),
          "'.~("[(i + (t >> 2)) % 4],
        );
      }
    }
  });

  // The gaze itself: whatever the far ridge has at the lamp's column, lit.
  const scx = Math.round(x);
  for (let c = scx - 2; c <= scx + 2; c++) {
    for (let r = 30; r < 56; r++) {
      const fc = get(S.far, r, c);
      if (fc !== " " && get(S.tower, r, c) === " ") put(lamp, r, c, fc);
    }
  }
  if (!locked && Math.abs(scx - CX) > 22) {
    const rr = Math.ceil(farRow(scx)) - 4;
    put(lamp, rr, scx - 3, "(");
    put(lamp, rr, scx + 3, ")");
    put(lamp, rr - 1, scx, "'");
    put(lamp, rr + 1, scx, ".");
  }

  // Checking in on a cabin: brackets around it, a sight-line to it, and what
  // it reported written out underneath.
  if (H && t < lockUntil + 22) {
    const age = 58 - (lockUntil - t);
    const on = locked ? ((t >> 2) & 1) === 0 || age < 12 : ((t >> 1) & 1) === 0;
    if (on) {
      const r0 = H.r - 3;
      const r1 = H.r + 2;
      const c0 = H.c - 4;
      const c1 = H.c + 4;
      for (const [r, c, ch] of [
        [r0, c0, "+"], [r0, c0 + 1, "-"], [r0, c1 - 1, "-"], [r0, c1, "+"],
        [r1, c0, "+"], [r1, c0 + 1, "-"], [r1, c1 - 1, "-"], [r1, c1, "+"],
        [r0 + 1, c0, "|"], [r1 - 1, c0, "|"], [r0 + 1, c1, "|"], [r1 - 1, c1, "|"],
      ] as [number, number, string][]) {
        put(lamp, r, c, ch);
      }
    }
    let lc =
      H.at === "belowLeft"
        ? H.c + 4 - H.label.length
        : H.at === "belowRight"
          ? Math.min(COLS - H.label.length - 1, H.c - 4)
          : H.c - Math.floor(H.label.length / 2);
    if (H.at === "belowRight") lc = COLS - H.label.length - 1;
    for (let li = 0; li < H.label.length; li++) put(lamp, H.r + 4, lc + li, H.label[li]);
    if (locked) {
      const left = H.c < CX;
      const x0 = left ? CX - 19 : CX + 19;
      const y0 = S.glassRows[1];
      const x1 = left ? H.c + 5 : H.c - 5;
      const y1 = H.r - 3;
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      const shown = Math.min(n, age * 2);
      for (let s = 0; s <= shown; s += 2) {
        put(lamp, y0 + ((y1 - y0) * s) / n, x0 + ((x1 - x0) * s) / n, ".");
      }
    }
  }

  for (const s of S.stars) {
    const v = Math.sin(t * 0.07 * s.speed + s.phase);
    const ch = v > 0.9 ? "*" : v > 0.5 ? "+" : v > -0.4 ? "." : " ";
    if (ch !== " " && lamp[s.r][s.c] === " ") sky[s.r][s.c] = ch;
  }

  for (const c of S.grassCols) {
    const v = Math.sin(c * 0.45 - t * 0.22) + 0.4 * Math.sin(c * 1.3 + t * 0.05);
    const ch = v > 0.8 ? "/" : v > 0.1 ? "," : v > -0.6 ? "'" : "|";
    if (!S.occupied[BOT]?.[c]) put(grass, BOT, c, ch);
  }

  // The code: each line types itself in, holds, and wipes, on its own clock.
  const glitch = "#%&*=/";
  for (const sn of SNIPPETS) {
    const n = sn.text.length;
    const phase = ((t + sn.off) % sn.per) / sn.per;
    const len =
      phase < 0.35
        ? Math.floor((phase / 0.35) * n)
        : phase < 0.8
          ? n
          : Math.floor((1 - (phase - 0.8) / 0.2) * n);
    for (let ci = 0; ci < len; ci++) {
      let ch = sn.text[ci];
      if (R() < 0.03) ch = glitch[Math.floor(R() * glitch.length)];
      put(code, sn.r, sn.c + ci, ch);
    }
  }
  for (let bi = 0; bi < HEADLINE.text.length; bi++) {
    put(bright, HEADLINE.r, HEADLINE.c + bi, HEADLINE.text[bi]);
  }
  if (((t >> 3) & 1) === 0) put(bright, HEADLINE.r, HEADLINE.c + HEADLINE.text.length + 1, "_");

  return {
    sky: str(sky),
    code: str(code),
    bright: str(bright),
    grass: str(grass),
    lamp: str(lamp),
    glow: (0.3 + 0.05 * Math.sin(t * 0.09) + 0.04 * Math.sin(t * 0.37)).toFixed(3),
    // One minute of uptime per tick, so the number is always moving.
    closedFor: duration(24065 + (still ? 0 : t * 0.07)).toUpperCase(),
  };
}
