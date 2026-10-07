"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { beside, box, pad, repeat, smooth } from "../_lib/ascii";
import { useReducedMotion } from "../_lib/frames";
import { PhoneStack } from "./PhoneStack";
import styles from "./Layers.module.css";

/* ── Four layers, taken apart ────────────────────────────────────────────
   The architecture, as four slabs floating one above another, rendered by
   ray-marching a character grid against them — so the stack can be tilted,
   zoomed and pulled apart while the text written on each slab's top face
   stays exactly as readable as a terminal.

   Scrolling drives it. There are five stops: the whole stack, then each layer
   on its own from the devices down to the agents. Each stop is a fixed pose;
   crossing into one plays a single eased move to it, whatever speed the
   reader is scrolling at, so the thing never feels scrubbed.

   It ends on the agents rather than pulling back out to an overview, because
   the next section is that overview — and one you can set fire to.

   Why a drawing and not a diagram component: the claim is that these are
   four separable things, and nothing says separable like watching them come
   apart and still work.

   None of this fits below about 1100px — the grid is two hundred columns,
   which is six pixels a character on a tablet. Narrower than that reads
   `PhoneStack` instead, the same four layers as a plain vertical stack you
   scroll past. Which of the two is on screen is decided in CSS rather than
   in JS, so it is right before any of this has loaded.
   ─────────────────────────────────────────────────────────────────────── */

/* The grid the scene is drawn on, and the slabs' dimensions in world units. */
const COLS = 200;
const ROWS = 70;
const SLAB_W = 40;
const SLAB_D = 24;
const SLAB_T = 1.3;
/** The text written on a slab: 100 columns by 12 rows of it. */
const TEX_W = 100;
const TEX_H = 12;
/** A character cell is about twice as tall as it is wide. */
const ASPECT = 1.92;
const DIST = 110;

/** The five stops, as poses. */
const KEYS = [0, 0.375, 0.525, 0.675, 0.825];
const STOPS = KEYS.length;
/** Where each stop's stretch of scrolling ends, in screens. The last runs off
    the end of the track, so the agents hold until the section unpins. */
const ENDS = [0.55, 1.3, 2.05, 2.8, 9];

const COPY: Record<string, [string, string, string]> = {
  intro: [
    "[ HOW IT WORKS ]",
    "Four-layer architecture",
    "Scroll to take the stack apart, one layer at a time.",
  ],
  "3": [
    "LAYER 04",
    "Your Devices",
    "Mac, Windows, iPhone, Android. Start a session on one, pick it up on another. Closing any of them stops nothing.",
  ],
  "2": [
    "LAYER 03",
    "Firetower Server",
    "The control plane, about 200 MB. It tracks every workspace, and if it goes down it catches up by replay.",
  ],
  "1": [
    "LAYER 02",
    "Workers",
    "One per machine you own, reached over SSH. A worker never opens a port and writes its own log before reporting.",
  ],
  "0": [
    "LAYER 01",
    "Agents",
    "Any coding agent, in tmux, on its own git worktree and branch. This is where the work happens.",
  ],
};

/* ── what is written on each slab ───────────────────────────────────────── */

function headline(left: string, right: string) {
  return `   ${left}${repeat(" ", TEX_W - 6 - left.length - right.length)}${right}   `;
}

function fit(rows: string[]) {
  const out = rows.map((r) => pad(r, TEX_W));
  while (out.length < TEX_H) out.push(repeat(" ", TEX_W));
  return out.slice(0, TEX_H);
}

/** Bottom slab first, so an index here is the same index as in the stack. */
const TEXTURES: string[][] = [
  fit([
    "",
    headline("LAYER 01  AGENTS", "one worktree each"),
    "",
    "      o   Claude Code     westlabs/ledger     agent/ledger-export        working",
    "",
    "      o   Codex           westlabs/api        agent/rate-limit           working",
    "",
    "      *   Claude Code     acme/web-app        agent/invite-link          needs you",
    "",
    "      o   Codex           acme/web-app        agent/dark-mode            working",
    "",
    "   any coding agent, in tmux, on its own branch",
  ]),
  fit([
    "",
    headline("LAYER 02  WORKERS", "ssh only, no open ports"),
    "",
    ...beside(
      [
        box(28, ["Mac Studio", "192.168.1.57", "worker . tmux . git"]),
        box(28, ["Hetzner VM", "5.161.44.9", "worker . tmux . git"]),
        box(28, ["homelab", "10.0.0.12", "worker . tmux . git"]),
      ],
      4,
      3,
    ),
    "",
    "   each worker logs first, reports second",
  ]),
  fit([
    "",
    headline("LAYER 03  FIRETOWER SERVER", "control plane  200 MB"),
    "",
    ...box(86, [
      "inbox          2 waiting",
      "workspaces     acme/web-app   westlabs/ledger   westlabs/api",
      "log replay     up to date",
      "",
    ]).map((l) => `      ${l}`),
    "",
    "   one compose file, on a server you already own",
  ]),
  fit([
    "",
    headline("LAYER 04  YOUR DEVICES", "macOS  Windows  iOS  Android"),
    "",
    ...beside(
      [
        box(28, ["laptop", "closed 6h 41m ago", ""]),
        box(24, ["phone", "9:41", "picked up"]),
        box(28, ["desktop", "idle", ""]),
      ],
      5,
      4,
    ),
    "",
    "   close any of them. nothing stops.",
  ]),
];

/** Where the connectors run: from a cell on one slab's underside to another's top. */
const LINKS: [number, number, number, number, number, number][] = [
  [3, 18, 7, 2, 50, 3],
  [3, 47, 7, 2, 50, 3],
  [3, 77, 7, 2, 50, 3],
  [2, 30, 8, 1, 17, 3],
  [2, 50, 8, 1, 49, 3],
  [2, 70, 8, 1, 81, 3],
  [1, 17, 7, 0, 4, 3],
  [1, 49, 7, 0, 4, 5],
  [1, 81, 7, 0, 4, 9],
];

const LAYER_KEYS = ["0s", "0t", "1s", "1t", "2s", "2t", "3s", "3t"] as const;

const BLANK_ROW = " ".repeat(COLS);

/** One row of the grid with `ch` at the given columns and nothing anywhere else. */
function row(cols: Set<number>, ch: string) {
  if (!cols.size) return BLANK_ROW;
  const sorted = [...cols].sort((a, b) => a - b);
  let out = "";
  let at = 0;
  for (const c of sorted) {
    if (c < at) continue;
    out += " ".repeat(c - at) + ch;
    at = c + 1;
  }
  return out + " ".repeat(COLS - at);
}

type Wire = { c: number; f: number; link: number };

type Pose = {
  /** One string per slab surface and slab text. */
  faces: Record<string, string>;
  /** The connector cells, by row, so a frame only touches rows that have any. */
  wires: Map<number, Wire[]>;
  stage: number;
};

/* ── the renderer ───────────────────────────────────────────────────────── */

function raytrace(p: number): Pose {
  const open = smooth(0.05, 0.3, p);
  const gap = 2.1 + 17 * open;
  const yaw = -0.14 + 0.24 * p;
  const pitch = 0.7 - 0.2 * p;
  const stage = p < 0.3 ? -1 : p < 0.45 ? 3 : p < 0.6 ? 2 : p < 0.75 ? 1 : 0;
  /* Where each layer is the one being explained. */
  const centres = [0.825, 0.675, 0.525, 0.375];

  // The slab being read lifts clear of the others and slides back a little.
  const L = centres.map((centre, i) => {
    const w = Math.max(0, 1 - Math.abs(p - centre) / 0.09);
    const lift = 1.8 * smooth(0, 1, w);
    return { y: (i - 1.5) * gap + lift, x: (i - 1.5) * 2.6 * (0.5 - p) * 2, z: -lift * 0.6 };
  });

  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const F: [number, number, number] = [sy * cp, -sp, cy * cp];
  const Rt: [number, number, number] = [cy, 0, -sy];
  const U: [number, number, number] = [sy * sp, cp, cy * sp];
  const hw = SLAB_W / 2;
  const hd = SLAB_D / 2;

  // The camera follows whichever slab is being explained, so the stack
  // scrolls past it rather than the reader chasing it up the page.
  const track: [number, number][] = [
    [0, 0], [0.22, 0], [0.375, L[3].y], [0.525, L[2].y],
    [0.675, L[1].y], [0.825, L[0].y], [0.9, 0], [1, 0],
  ];
  let focusY = 0;
  for (let k = 0; k < track.length - 1; k++) {
    if (p >= track[k][0] && p <= track[k + 1][0]) {
      const f = smooth(track[k][0], track[k + 1][0], p);
      focusY = track[k][1] + (track[k + 1][1] - track[k][1]) * f;
    }
  }
  const C: [number, number, number] = [-F[0] * DIST, focusY - F[1] * DIST, -F[2] * DIST];

  const flat = (P: [number, number, number]) => {
    const q = [P[0] - C[0], P[1] - C[1], P[2] - C[2]];
    const d = q[0] * F[0] + q[1] * F[1] + q[2] * F[2];
    return {
      x: (q[0] * Rt[0] + q[1] * Rt[1] + q[2] * Rt[2]) / d,
      y: (q[0] * U[0] + q[1] * U[1] + q[2] * U[2]) / d,
    };
  };

  // Zoom: close enough to read one slab while exploring, pulled back far
  // enough to hold the whole stack at the start and the end.
  const focus = stage >= 0 ? stage : 3;
  const bl = flat([L[focus].x - hw, L[focus].y, L[focus].z + hd]);
  const br = flat([L[focus].x + hw, L[focus].y, L[focus].z + hd]);
  const topB = flat([0, L[3].y, L[3].z + hd]);
  const lowF = flat([0, L[0].y - SLAB_T, L[0].z - hd]);
  const readable = 106 / (br.x - bl.x);
  const whole = Math.min((62 * ASPECT) / Math.max(0.01, topB.y - lowF.y), 128 / (br.x - bl.x));
  const zoom = smooth(0.24, 0.34, p);
  const scale = whole + (Math.max(whole, readable) - whole) * zoom;
  const cx = 104;
  const cyPix = 35 + ((topB.y + lowF.y) / 2) * (scale / ASPECT) * (1 - zoom) + 4 * zoom;

  const N = COLS * ROWS;
  const depth = new Float64Array(N);
  const owner = new Int8Array(N).fill(-1);
  const isText = new Uint8Array(N);
  const chars: string[] = new Array(N).fill(" ");
  const topFace = new Int8Array(N).fill(-1);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const a = (c + 0.5 - cx) / scale;
      const b = (-(r + 0.5 - cyPix) * ASPECT) / scale;
      const dx = F[0] + Rt[0] * a + U[0] * b;
      const dy = F[1] + Rt[1] * a + U[1] * b;
      const dz = F[2] + Rt[2] * a + U[2] * b;
      let best = 1e9;
      let hit = -1;
      let ch = " ";
      let top = -1;
      for (let li = 0; li < 4; li++) {
        const h = L[li].y;
        const x0 = L[li].x;
        const z0 = L[li].z;
        // The top face, which is the one carrying text.
        if (dy < 0) {
          const t = (h - C[1]) / dy;
          if (t > 0 && t < best) {
            const px = C[0] + t * dx - x0;
            const pz = C[2] + t * dz - z0;
            if (px >= -hw && px <= hw && pz >= -hd && pz <= hd) {
              best = t;
              hit = li;
              top = -1;
              const col = Math.floor(((px + hw) / SLAB_W) * 66);
              const row = Math.floor(((hd - pz) / SLAB_D) * 12);
              const edgeX = hw - Math.abs(px) < 0.4;
              const edgeZ = hd - Math.abs(pz) < 0.6;
              if (edgeX && edgeZ) ch = "+";
              else if (edgeZ) ch = "-";
              else if (edgeX) ch = "|";
              else {
                top = li;
                ch = col % 3 === 0 && row % 2 === 0 ? "." : " ";
              }
            }
          }
        }
        // The front edge, so a slab has thickness.
        if (dz > 0) {
          const t = (z0 - hd - C[2]) / dz;
          if (t > 0 && t < best) {
            const fx = C[0] + t * dx - x0;
            const fy = C[1] + t * dy;
            if (fx >= -hw && fx <= hw && fy <= h && fy >= h - SLAB_T) {
              best = t;
              hit = li;
              ch = "=";
              top = -1;
            }
          }
        }
        // Whichever side the camera is on.
        const sx = C[0] > x0 + hw ? x0 + hw : C[0] < x0 - hw ? x0 - hw : null;
        if (sx !== null && dx !== 0) {
          const t = (sx - C[0]) / dx;
          if (t > 0 && t < best) {
            const sz = C[2] + t * dz - z0;
            const syy = C[1] + t * dy;
            if (sz >= -hd && sz <= hd && syy <= h && syy >= h - SLAB_T) {
              best = t;
              hit = li;
              ch = ":";
              top = -1;
            }
          }
        }
      }
      const idx = r * COLS + c;
      depth[idx] = best;
      owner[idx] = hit;
      chars[idx] = ch;
      topFace[idx] = top;
    }
  }

  // Paint each slab's text onto its visible top face, a character per cell,
  // so it stays as crisp as the terminal it was copied out of.
  const project = (P: [number, number, number]) => {
    const q = [P[0] - C[0], P[1] - C[1], P[2] - C[2]];
    const d = q[0] * F[0] + q[1] * F[1] + q[2] * F[2];
    const xc = q[0] * Rt[0] + q[1] * Rt[1] + q[2] * Rt[2];
    const yc = q[0] * U[0] + q[1] * U[1] + q[2] * U[2];
    return { c: cx + (xc / d) * scale, r: cyPix - (yc / d) * (scale / ASPECT), d };
  };

  for (let tl = 0; tl < 4; tl++) {
    for (let tr = 0; tr < TEX_H; tr++) {
      const row = TEXTURES[tl][tr];
      if (!row.trim()) continue;
      const zz = L[tl].z + hd - ((tr + 0.5) / TEX_H) * SLAB_D;
      const a0 = project([L[tl].x - hw, L[tl].y, zz]);
      const a1 = project([L[tl].x + hw, L[tl].y, zz]);
      const mid = (a0.c + a1.c) / 2;
      const rowY = Math.floor((a0.r + a1.r) / 2);
      const start = Math.round(mid - TEX_W / 2);
      if (rowY < 0 || rowY >= ROWS) continue;
      for (let j = 0; j < TEX_W; j++) {
        const ch = row.charAt(j);
        const col = start + j;
        if (ch === " " || col < 0 || col >= COLS) continue;
        const idx = rowY * COLS + col;
        if (topFace[idx] === tl) {
          isText[idx] = 1;
          chars[idx] = ch;
        }
      }
    }
  }

  // The connectors. Collected rather than drawn, so the packets travelling
  // down them can move without re-tracing the whole scene.
  const wires: Pose["wires"] = new Map();
  if (open > 0.25) {
    const world = (li: number, col: number, row: number, top: boolean): [number, number, number] => [
      L[li].x + ((col + 0.5) / TEX_W) * SLAB_W - hw,
      top ? L[li].y : L[li].y - SLAB_T,
      L[li].z + hd - ((row + 0.5) / TEX_H) * SLAB_D,
    ];
    LINKS.forEach((lk, k) => {
      const P0 = world(lk[0], lk[1], lk[2], false);
      const P1 = world(lk[3], lk[4], lk[5], true);
      const n = 90;
      for (let s = 0; s <= n; s++) {
        const f = s / n;
        const q = project([
          P0[0] + (P1[0] - P0[0]) * f,
          P0[1] + (P1[1] - P0[1]) * f,
          P0[2] + (P1[2] - P0[2]) * f,
        ]);
        const col = Math.floor(q.c);
        const row = Math.floor(q.r);
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) continue;
        const idx = row * COLS + col;
        if (q.d < depth[idx] - 0.05 && !isText[idx]) {
          const bucket = wires.get(row);
          if (bucket) bucket.push({ c: col, f, link: k });
          else wires.set(row, [{ c: col, f, link: k }]);
        }
      }
    });
  }

  // One string per surface, so each gets its own colour without a span per cell.
  const rows: Record<string, string[]> = {};
  for (const k of LAYER_KEYS) rows[k] = [];
  for (let r = 0; r < ROWS; r++) {
    const line: Record<string, string> = {};
    for (const k of LAYER_KEYS) line[k] = "";
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const o = owner[idx];
      const key = o >= 0 ? `${o}${isText[idx] ? "t" : "s"}` : "";
      for (const k of LAYER_KEYS) line[k] += k === key ? chars[idx] : " ";
    }
    for (const k of LAYER_KEYS) rows[k].push(line[k]);
  }
  const faces: Record<string, string> = {};
  for (const k of LAYER_KEYS) faces[k] = rows[k].join("\n");

  return { faces, wires, stage };
}

/* ── the section ────────────────────────────────────────────────────────── */

/** The sticky header's height, which the scene has to centre underneath. */
const NAV = 69;

export function Layers() {
  const track = useRef<HTMLDivElement>(null);
  const anim = useRef({ step: 0, animStep: 0, from: 0, to: 0, t0: 0, dur: 0, prev: 0 });
  const reduced = useReducedMotion();
  const [state, setState] = useState({ frame: 0, p: 0, step: 0, move: 1, prev: 0 });

  useEffect(() => {
    const id = window.setInterval(() => {
      const el = track.current;
      const a = anim.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 900;
        const stop = Math.min(vh, 900);
        // No width means `display: none` — the phone is reading `PhoneStack`
        // instead, and an all-zero rect otherwise looks like "on screen".
        if (!rect.width) return;
        if (rect.bottom < -50 || rect.top > vh + 50) return;
        // How far the section has scrolled since it pinned, in screens. Each
        // stop holds for a stretch; crossing the end of one (plus a little
        // slack, so a nudge at the boundary does not flip back and forth)
        // moves to the next straight away.
        const raw = -rect.top / stop;
        const slack = 0.08;
        let cur = a.step;
        while (cur < STOPS - 1 && raw > ENDS[cur] + slack) cur++;
        while (cur > 0 && raw < ENDS[cur - 1] - slack) cur--;
        a.step = cur;
      }
      const now = Date.now();
      setState((s) => {
        const frame = s.frame + 1;
        if (a.step !== a.animStep) {
          a.from = s.p;
          a.to = KEYS[a.step];
          a.t0 = now;
          a.dur = reduced ? 0 : Math.min(1800, 950 + 300 * (Math.abs(a.step - a.animStep) - 1));
          a.prev = a.animStep;
          a.animStep = a.step;
        }
        const k = a.dur ? Math.min(1, (now - a.t0) / a.dur) : 1;
        const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const p = a.from + (a.to - a.from) * eased;
        return { frame, p, step: a.step, move: k, prev: a.prev };
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [reduced]);

  // Quantised, so a settled pose is not re-traced every frame just because
  // the easing left a rounding error behind.
  const poseKey = Math.round(state.p * 1000);
  const pose = useMemo(() => raytrace(poseKey / 1000), [poseKey]);

  const wires = useMemo(() => {
    const lineRows: string[] = [];
    const packRows: string[] = [];
    // Where each link's packet is this frame. One lookup per link rather than
    // per cell, because a link contributes ninety cells.
    const heads = LINKS.map((_, k) => (reduced ? -1 : (state.frame * 0.0225 + k * 0.37) % 1));
    for (let r = 0; r < ROWS; r++) {
      const bucket = pose.wires.get(r);
      if (!bucket) {
        lineRows.push(BLANK_ROW);
        packRows.push(BLANK_ROW);
        continue;
      }
      const lineCols = new Set<number>();
      const packCols = new Set<number>();
      for (const w of bucket) {
        const head = heads[w.link];
        if (head >= 0 && Math.abs(w.f - head) < 0.012) packCols.add(w.c);
        else lineCols.add(w.c);
      }
      // A cell carrying a packet is a packet, not a wire with a dot on it.
      for (const c of packCols) lineCols.delete(c);
      lineRows.push(row(lineCols, ":"));
      packRows.push(row(packCols, "*"));
    }
    return { lines: lineRows.join("\n"), packets: packRows.join("\n") };
  }, [pose, state.frame, reduced]);

  // The panel's words swap halfway through a move: out, change, back in.
  const move = state.move;
  const shownStep = move < 0.5 ? state.prev : state.step;
  const panelOpacity =
    move >= 1 ? 1 : move < 0.5 ? Math.max(0, 1 - move / 0.3) : Math.max(0, Math.min(1, (move - 0.6) / 0.3));
  const panelShift =
    move >= 1 ? 0 : move < 0.5 ? -10 * Math.min(1, move / 0.3) : 10 * (1 - Math.max(0, Math.min(1, (move - 0.6) / 0.3)));
  const copy = COPY[["intro", "3", "2", "1", "0"][shownStep]];
  const shownStage = [-1, 3, 2, 1, 0][shownStep];

  const goTo = (step: number) => {
    const el = track.current;
    if (!el) return;
    const stop = Math.min(window.innerHeight || 900, 900);
    const starts = [0, ...ENDS.slice(0, STOPS - 1)];
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top + (starts[step] + 0.15) * stop,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const stage = pose.stage;
  const surface = (i: number) => (stage === i ? "#8a6224" : "#38383c");
  const words = (i: number) => {
    if (stage === i) return "var(--color-ember)";
    // Before the stack opens, the top slab is the only one legible enough to
    // be worth reading; the rest are still edge-on.
    if (stage === -1) return i === 3 ? "#a8a8ae" : "#5e5e64";
    return "#5e5e64";
  };
  const halo = (i: number) => (stage === i ? "0 0 8px rgb(255 178 63 / 0.45)" : "none");

  return (
    <div id="how">
      <div className="lg:hidden">
        <PhoneStack />
      </div>
      <div ref={track} className={`hidden lg:block ${styles.track}`}>
      <div className={styles.pin}>
        <div className={styles.grid} aria-hidden style={{ top: `calc(50% + ${NAV / 2}px)` }}>
          {([3, 2, 1, 0] as const).map((i) => (
            <pre key={`s${i}`} style={{ color: surface(i) }}>{pose.faces[`${i}s`]}</pre>
          ))}
          <pre style={{ color: "#4a4a50" }}>{wires.lines}</pre>
          {([3, 2, 1, 0] as const).map((i) => (
            <pre key={`t${i}`} style={{ color: words(i), textShadow: halo(i) }}>
              {pose.faces[`${i}t`]}
            </pre>
          ))}
          <pre style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}>
            {wires.packets}
          </pre>
        </div>

        <div className={styles.veil} aria-hidden />

        <div
          className={styles.panel}
          style={{
            top: `calc(50% + ${NAV / 2}px)`,
            opacity: panelOpacity.toFixed(3),
            marginTop: `${panelShift.toFixed(1)}px`,
          }}
        >
          <p
            className="eyebrow"
            style={{ color: shownStage >= 0 ? "var(--color-ember)" : undefined }}
          >
            {copy[0]}
          </p>
          <h2 className="display text-[clamp(34px,3.6vw,52px)]">{copy[1]}</h2>
          <p className="max-w-[380px] text-[17px] leading-[1.6] text-dim">{copy[2]}</p>
          <nav aria-label="Layers" className="flex gap-1.5 pt-2.5">
            {[3, 2, 1, 0].map((i) => {
              const on = shownStage === i;
              const done = shownStage >= 0 && shownStage < i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to layer 0${i + 1}`}
                  aria-current={on ? "step" : "false"}
                  onClick={() => goTo(4 - i)}
                  className="flex min-h-11 w-16 cursor-pointer flex-col gap-2 border-0 bg-transparent pt-2.5 text-left"
                >
                  <span
                    className="block h-0.5 w-full"
                    style={{ background: on ? "var(--color-ember)" : done ? "#5e5e64" : "#2e2e31" }}
                  />
                  <span
                    className="font-mono text-[11.5px] tracking-[0.06em]"
                    style={{ color: on ? "var(--color-ember)" : done ? "#8c8c92" : "#5e5e64" }}
                  >
                    0{i + 1}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {state.step === 0 && state.p < 0.03 && (
          <p className="eyebrow absolute inset-x-0 bottom-7 text-center">
            SCROLL TO TAKE THE STACK APART v
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
