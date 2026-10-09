/**
 * The social card.
 *
 * It is the hero, at 1200×630: the ridge drawn in characters, veiled from the
 * left, with the copy over it and the instrument rail along the bottom. The
 * card is the only place the brand is seen by someone who has not arrived
 * yet, so it is built out of the same kit as everything else — `Canvas` from
 * `_lib/ascii`, the palette from `globals.css`, the application's own tower
 * mark — rather than approximated.
 *
 * Satori (what next/og renders with) cannot read WOFF2, and `next/font` only
 * ever leaves WOFF2 on disk, so the two faces are checked in again here as
 * TrueType. They live under `app/` rather than `public/` on purpose: these
 * are read at build time and never served, and anything in `public/` would be
 * copied into `out/` and uploaded to the CDN for nobody.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Canvas, rng } from "./ascii";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "Firetower — run every agent, on every machine, from one tower";

/* The palette, lifted from `globals.css`. Same rule applies: ember is the
   only thing allowed to glow, and it is spent on the lamp, the cabin lights
   and the one chip — never on a label. */
const GROUND = "#0b0b0c";
const BONE = "#ededef";
const DIM = "#a8a8ae";
const LABEL = "#7c7c82";
const MUTE = "#5e5e64";
const LINE = "#1e1e20";
const RIM = "#2e2e31";
const EMBER = "#ffb23f";
const INK = "#1c1405";

/* ── The scene ───────────────────────────────────────────────────────────
   A 154×40 character canvas at exactly the card's size: Geist Mono advances
   0.6em, so 154 columns at 13px is 1201px, and 40 rows at 15.6px is 624px.
   Those numbers are the drawing's canvas, the same way 240×64 is the hero's.

   One lookout on the near summit, three worker cabins on the ridge behind
   it, and the lamp stopped on the far one — the hero's claim, held still.
   ─────────────────────────────────────────────────────────────────────── */

const COLS = 154;
const ROWS = 40;
const FONT_PX = 13;
const LINE_PX = 15.6;

/** Where the lookout stands, and the rows its cab and feet sit on. */
const CX = 128;
const TOP = 4;
const BOT = 32;

/** The cabin the lamp is reading, and what it reported. */
const HOSTS = [92, 108, 145];
const WATCHING = 145;
const REPORT = "homelab · agent running · 6h41m";

const gauss = (c: number, m: number, w: number) => Math.exp(-Math.pow((c - m) / w, 2));

/** The far ridge's profile: a dip under each cabin, plus a little noise. */
const farRow = (c: number) =>
  28 -
  1.5 * gauss(c, 70, 8) -
  3 * gauss(c, HOSTS[0], 6) -
  3.5 * gauss(c, HOSTS[1], 5) -
  3 * gauss(c, HOSTS[2], 5) +
  0.6 * Math.sin(c * 0.35);

/** The near summit: flat under the legs, then falling away off the card. */
const nearRow = (c: number) => {
  const dx = Math.abs(c - CX);
  return dx <= 14 ? BOT + 1 : BOT + 1 + Math.pow(dx - 14, 1.3) * 0.3;
};

/** The cab, the aerial, the lattice, the ridge and everything on it. */
function drawScene() {
  const k = new Canvas(ROWS, COLS);
  const R = rng(11);
  const X0 = CX - 17;

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
  k.block(TOP, X0, cab, "tower");
  for (let r = TOP - 3; r <= TOP + 2; r++) k.set(r, X0 + 9, "|", "tower");
  k.text(TOP - 3, X0 + 8, "- -", "tower", true);

  // The windows. The lamp is every pair except the one the lookout is behind,
  // which is dark — so where it is facing is where the gap is.
  const glass: number[] = [];
  for (const j of [6, 7, 8, 11, 12, 13, 16, 17, 18, 21, 22, 23, 26, 27, 28]) glass.push(X0 + j);
  const facing = WATCHING > CX ? 12 : 1;
  const lampChars = "=:#%8";
  glass.forEach((c, gi) => {
    [TOP + 5, TOP + 6].forEach((r, ri) => {
      if (((gi === facing || gi === facing + 1) && ri === 1) || (gi === facing && ri === 0)) return;
      k.set(r, c, lampChars[Math.floor(R() * lampChars.length)], "lamp");
    });
  });

  // ── the lattice: legs, bracing, ladder and landings ──
  const top = TOP + 10;
  const H = BOT - top;
  const hf = (r: number) => 7 + ((r - top) / H) * 6;
  const hb = (r: number) => 4.5 + ((r - top) / H) * 4;
  for (let r = top; r <= BOT; r++) {
    k.set(r, CX - hb(r), ":", "tower");
    k.set(r, CX + hb(r), ":", "tower");
  }
  const bays = [top, top + 9, BOT];
  for (let b = 0; b < bays.length - 1; b++) {
    const s = bays[b];
    const e = bays[b + 1];
    const ax = (r: number) => CX - hf(s) + (CX + hf(e) - (CX - hf(s))) * ((r - s) / (e - s));
    const bx = (r: number) => CX + hf(s) + (CX - hf(e) - (CX + hf(s))) * ((r - s) / (e - s));
    for (let r = s + 1; r < e; r++) {
      const lo = Math.round(CX - hf(r));
      const hi = Math.round(CX + hf(r));
      // The bay is nine rows across thirteen columns, so a brace that set one
      // character per row would step two columns at a time and read as a
      // dotted line. Each row fills back to where the row above left off.
      for (const [from, to, ch] of [
        [ax(r - 1), ax(r), "\\"],
        [bx(r - 1), bx(r), "/"],
      ] as [number, number, string][]) {
        for (let c = Math.round(Math.min(from, to)); c <= Math.round(Math.max(from, to)); c++) {
          if (c > lo && c < hi) k.set(r, c, k.at(r, c) === "\\" ? "X" : ch, "tower");
        }
      }
    }
  }
  for (let r = top; r <= BOT; r++) {
    const L = Math.round(CX - hf(r));
    const Rr = Math.round(CX + hf(r));
    k.set(r, L, L < Math.round(CX - hf(r - 1)) ? "/" : "|", "tower");
    k.set(r, Rr, Rr > Math.round(CX + hf(r - 1)) ? "\\" : "|", "tower");
    if (bays.indexOf(r) > 0 && r < BOT) for (let c = L + 1; c < Rr; c++) k.set(r, c, "=", "tower");
  }
  for (const x of [CX - hf(BOT), CX + hf(BOT), CX - hb(BOT), CX + hb(BOT)]) {
    k.text(BOT + 1, Math.round(x) - 1, "[#]", "tower", true);
  }

  // ── the far ridge, its dust, and the cabins on it ──
  const hostRow = (c: number) => Math.ceil(farRow(c)) - 1;
  const nearHost = (c: number) => HOSTS.some((h) => Math.abs(c - h) <= 2);
  const dust = ".:'.";
  for (let c = 0; c < COLS; c++) {
    const rf = Math.ceil(farRow(c));
    for (let r = rf; r <= Math.min(rf + 3, ROWS - 1); r++) {
      if (k.at(r, c) === " " && R() < 0.78 - (r - rf) * 0.12) {
        k.set(r, c, dust[Math.floor(R() * dust.length)], "far");
      }
    }
    // The skyline itself, rather than only the haze under it: without a
    // near-continuous row of pines the ridge has no silhouette to read.
    if (!nearHost(c) && R() < 0.78 && k.at(rf - 1, c) === " ") {
      k.set(rf - 1, c, R() < 0.3 ? "." : "^", "far");
    }
  }
  for (const h of HOSTS) {
    const r = hostRow(h);
    // The huts carry their own key: they are the point of the far ridge, and
    // at the colour the rest of it is drawn in they would disappear into it.
    k.text(r - 1, h - 2, "/___\\", "hut", true);
    k.set(r, h - 2, "|", "hut");
    k.set(r, h + 2, "|", "hut");
    // Every cabin keeps its light on, whether or not anybody is watching.
    for (let w = -1; w <= 1; w++) k.set(r, h + w, R() < 0.85 ? "#" : "%", "lamp");
  }

  // ── the near summit, and the pines on it ──
  const dense = "#%&@8*$^#%";
  for (let c = 0; c < COLS; c++) {
    const rr = Math.ceil(nearRow(c));
    if (rr >= ROWS) continue;
    for (let r = rr; r < ROWS; r++) {
      const prob = r - rr < 3 ? 0.78 : 0.78 - (r - rr - 3) * 0.22;
      if (R() < prob && k.at(r, c) === " ") {
        k.set(r, c, r === rr ? (R() < 0.6 ? "^" : "%") : dense[Math.floor(R() * dense.length)], "land");
      }
    }
    if (Math.abs(c - CX) > 14 && c % 5 === 0 && R() < 0.6) {
      for (const [dr, dc, ch] of [
        [-2, 0, "^"],
        [-1, -1, "/"],
        [-1, 0, "|"],
        [-1, 1, "\\"],
      ] as [number, number, string][]) {
        if (k.at(rr + dr, c + dc) === " ") k.set(rr + dr, c + dc, ch, "land");
      }
    }
  }
  const pine = [" /^\\ ", "/^^^\\", " ||| "];
  for (const pc of [CX - 22, CX + 20, CX + 26]) {
    const base = Math.ceil(nearRow(pc)) - 1;
    for (let i = 0; i < pine.length; i++) {
      for (let j = 0; j < 5; j++) {
        const ch = pine[i][j];
        if (ch !== " " && k.at(base - pine.length + 1 + i, pc - 2 + j) === " ") {
          k.set(base - pine.length + 1 + i, pc - 2 + j, ch, "land");
        }
      }
    }
  }

  // ── stars, in whatever sky is left ──
  for (let n = 0; n < 120; n++) {
    const r = Math.floor(R() * 20);
    const c = Math.floor(R() * COLS);
    if (k.at(r, c) === " ") k.set(r, c, R() < 0.2 ? "*" : R() < 0.55 ? "+" : ".", "sky");
  }

  // ── what the lamp is doing: a sight-line out to one cabin, brackets around
  //    it, and what it reported written underneath ──
  // Four corner ticks rather than a box — the frame of a sight, the same mark
  // `.corners` draws everywhere else on the site.
  const wr = hostRow(WATCHING);
  for (const [r, c, ch] of [
    [wr - 2, WATCHING - 4, "+"], [wr - 2, WATCHING - 3, "-"],
    [wr - 2, WATCHING + 3, "-"], [wr - 2, WATCHING + 4, "+"],
    [wr + 1, WATCHING - 4, "+"], [wr + 1, WATCHING - 3, "-"],
    [wr + 1, WATCHING + 3, "-"], [wr + 1, WATCHING + 4, "+"],
    [wr - 1, WATCHING - 4, "|"], [wr - 1, WATCHING + 4, "|"],
  ] as [number, number, string][]) {
    k.set(r, c, ch, "lamp");
  }
  const x0 = CX + 16;
  const y0 = TOP + 6;
  const x1 = WATCHING - 5;
  const y1 = wr - 2;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 0; s <= n; s += 2) {
    k.set(y0 + ((y1 - y0) * s) / n, x0 + ((x1 - x0) * s) / n, ".", "lamp");
  }
  k.text(wr + 3, COLS - REPORT.length - 1, REPORT, "lamp", true);

  return k.split(["sky", "far", "land", "hut", "tower", "lamp"]);
}

/** One colour of the drawing. Stacked congruently, they spell it back out. */
function Layer({ text, color, glow }: { text: string; color: string; glow?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist Mono",
        fontSize: FONT_PX,
        color,
        ...(glow ? { textShadow: `0 0 7px ${EMBER}` } : {}),
      }}
    >
      {text.split("\n").map((line, i) => (
        <div key={i} style={{ display: "flex", height: LINE_PX, lineHeight: `${LINE_PX}px`, whiteSpace: "pre" }}>
          {line}
        </div>
      ))}
    </div>
  );
}

/** The application's own tower mark, unchanged. */
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4.4 19L7 9.6M15.6 19L13 9.6" stroke={BONE} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.1 14.4h7.8" stroke={BONE} strokeWidth="1.1" strokeLinecap="round" opacity=".55" />
      <path d="M6.4 9.4h7.2v-3H6.4z" stroke={BONE} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.8 6.4L10 2.2l5.2 4.2" stroke={BONE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="7.9" r="1.15" fill={EMBER} />
    </svg>
  );
}

const face = (file: string) => readFileSync(join(process.cwd(), "app/_lib/fonts", file));

export function renderOgImage({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const scene = drawScene();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 76px",
          background: GROUND,
          fontFamily: "Geist",
          position: "relative",
        }}
      >
        {/* The ridge, behind everything. */}
        <Layer text={scene.sky} color="#46464b" />
        <Layer text={scene.far} color="#44444a" />
        <Layer text={scene.land} color="#38383d" />
        <Layer text={scene.hut} color="#70707a" />
        <Layer text={scene.tower} color="#d6d6da" />
        <Layer text={scene.lamp} color={EMBER} glow />

        {/* What makes the drawing a backdrop rather than a competitor: the
            ground colour, laid back over the left two thirds of it, and again
            along the bottom so the rail has something to sit on.

            Sized explicitly rather than with `inset: 0` — Satori lays an
            absolute box out from its own content unless it is given both
            dimensions, so an inset-only veil collapses and paints nothing. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: OG_SIZE.width,
            height: OG_SIZE.height,
            background:
              "linear-gradient(90deg, #0b0b0c 0%, rgba(11,11,12,0.94) 30%, rgba(11,11,12,0.45) 50%, rgba(11,11,12,0) 68%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: OG_SIZE.width,
            height: OG_SIZE.height,
            background: "linear-gradient(0deg, #0b0b0c 0%, #0b0b0c 9%, rgba(11,11,12,0) 30%)",
          }}
        />
        {/* Ember on the horizon. A linear band rather than a radial glow:
            Satori renders radial gradients with a visible seam at this size. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 260,
            background:
              "linear-gradient(0deg, rgba(255,178,63,0.13), rgba(255,178,63,0.035) 55%, rgba(255,178,63,0) 100%)",
          }}
        />

        {/* Brand lockup. The mark, and the word pulled in tight next to it —
            the tracked-out voice belongs to the labels now. */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, position: "relative" }}>
          <Mark size={30} />
          <div style={{ display: "flex", fontSize: 25, fontWeight: 600, letterSpacing: "-0.02em", color: BONE }}>
            Firetower
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, position: "relative" }}>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                fontFamily: "Geist Mono",
                fontSize: 17,
                letterSpacing: "0.08em",
                color: LABEL,
              }}
            >
              {`[ ${eyebrow.toUpperCase()} ]`}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 600,
              lineHeight: 1.02,
              color: BONE,
              letterSpacing: "-0.045em",
              maxWidth: 700,
            }}
          >
            {title}
          </div>
          {/* The hero's badge, verbatim. */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 11,
              border: `1px solid ${RIM}`,
              borderRadius: 3,
              padding: "9px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                background: EMBER,
                color: INK,
                borderRadius: 2,
                padding: "1px 7px 3px",
                fontFamily: "Geist Mono",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              AGPL
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Geist Mono",
                fontSize: 15,
                letterSpacing: "0.04em",
                color: DIM,
              }}
            >
              OPEN SOURCE, SELF-HOSTED, WRITTEN IN RUST
            </div>
          </div>
        </div>

        {/* The instrument rail, the way the hero ends. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
          <div style={{ display: "flex", height: 1, width: "100%", background: LINE }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              fontFamily: "Geist Mono",
              fontSize: 16,
              letterSpacing: "0.06em",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: DIM }}>
                <div
                  style={{
                    display: "flex",
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: EMBER,
                    boxShadow: `0 0 8px ${EMBER}`,
                  }}
                />
                3 AGENTS RUNNING
              </div>
              <div style={{ display: "flex", color: MUTE }}>LAPTOP CLOSED 6H 41M AGO</div>
            </div>
            <div style={{ display: "flex", color: MUTE }}>github.com/firetower-cloud/firetower</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: face("geist-400.ttf"), weight: 400, style: "normal" },
        { name: "Geist", data: face("geist-600.ttf"), weight: 600, style: "normal" },
        { name: "Geist Mono", data: face("geist-mono-400.ttf"), weight: 400, style: "normal" },
        { name: "Geist Mono", data: face("geist-mono-600.ttf"), weight: 600, style: "normal" },
      ],
    },
  );
}
