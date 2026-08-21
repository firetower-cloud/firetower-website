"use client";

import { useEffect, useRef } from "react";

/* ── The field the tower watches ──────────────────────────────────────────
   A grid of ones, zeroes and grit behind the hero. Two things happen in it:
   a handful of glyphs bloom in ember on their own long cycles, and the
   pointer drags a pool of light across the grid — the lookout's beam,
   pointed by whoever is reading.

   It is a canvas, and that is the whole point of the file. The obvious build
   is a few thousand spans with CSS on them, but an inline element cannot be
   composited on its own, so lighting one under the cursor repaints the whole
   text layer beneath it. Here the static field is painted once and every
   frame afterwards touches only the cells that changed: the ones under the
   pointer, and the ones that left it.

   It is aria-hidden decoration, so having no server-rendered markup costs
   nothing; the page's content is prerendered as before.
   ─────────────────────────────────────────────────────────────────────── */

/** mulberry32 — small, fast, and good enough for deciding what a pixel is. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 0x1f7e;

const FONT_PX = 12;
const ROW_PITCH = 26;
const TRACK = 5; // letter-spacing, in pixels, added to the glyph advance
const REACH = 215; // how far the pointer's light carries, in pixels

/* Weighted so the field reads as data with noise in it, not as noise.
   Space dominates; ones and zeroes carry the meaning; the rest is grit. */
const GLYPHS = "01" + "01" + "01" + "-*:.";

const DIM = "148,140,131"; // --color-mute
const BONE = "244,240,233";
const EMBER = "255,107,44";

type Cell = {
  ch: string;
  x: number;
  y: number; // baseline
  top: number;
  fade: number; // how much of the field reaches this cell at rest
  alpha: number; // resting alpha, fade already applied; 0 for blanks
  bone: boolean; // one of the brighter glyphs in the resting field
  blank: boolean; // empty at rest — the light is what reveals it
  phase: number; // non-zero only for the glyphs that bloom on their own
  period: number;
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The field thins out towards the left, where the headline sits, and towards
 * the bottom, where the horizon does. Baked into each glyph's alpha rather
 * than applied as a CSS mask: a mask over a canvas is another composited
 * layer to blend every frame, and this is free.
 *
 * On a narrow screen the copy runs the full width, so there is no empty
 * right-hand side to put the field in. It retreats into the far corner and
 * dims by half rather than sitting behind the words.
 */
function falloff(fx: number, fy: number, narrow: boolean) {
  const left = clamp((fx - (narrow ? 0.46 : 0.06)) / (narrow ? 0.46 : 0.62));
  // Gone well before the horizon band: stems and ridgelines need clean
  // ground under them, and a digit sitting on a ridgeline reads as dirt.
  const bottom = clamp(((narrow ? 0.46 : 0.64) - fy) / 0.38);
  return left * left * bottom * bottom * (narrow ? 0.5 : 1);
}

export function BinaryField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A pointer that cannot hover has no resting position, so there is
    // nothing sensible for the light to follow. Touch gets the still field.
    const hoverable = window.matchMedia("(hover: hover)").matches;

    /** grid[row][col] — every position, including the ones blank at rest. */
    let grid: Cell[][] = [];
    let live: Cell[] = [];
    let advance = FONT_PX * 0.6 + TRACK;
    let cols = 0;
    let rows = 0;

    let rect = canvas.getBoundingClientRect();
    let px = -1e4;
    let py = -1e4;
    let lit = false; // is the pointer currently over the field
    let prev: { c0: number; c1: number; r0: number; r1: number } | null = null;
    let raf = 0;
    let lastBloom = 0;
    let lastMove = 0;

    /**
     * Read the resolved family off the element rather than the custom
     * property. `getPropertyValue("--font-mono")` hands back the literal
     * text `var(--font-jetbrains), …`, and assigning that to ctx.font is
     * invalid — the canvas silently keeps 10px sans-serif and the field
     * renders in the wrong face. `fontFamily` is substituted.
     */
    const setFont = () => {
      ctx.font = `${FONT_PX}px ${getComputedStyle(canvas).fontFamily || "monospace"}`;
      ctx.textBaseline = "middle";
    };

    /** One glyph, at whatever brightness it should be right now. */
    const draw = (cell: Cell, now: number) => {
      ctx.clearRect(cell.x - 1, cell.top, advance + 2, ROW_PITCH);

      if (!cell.blank) {
        ctx.fillStyle = `rgba(${cell.bone ? BONE : DIM},${cell.alpha})`;
        ctx.fillText(cell.ch, cell.x, cell.y);

        // Its own slow bloom, for the glyphs that have one.
        if (cell.period) {
          const t = ((now + cell.phase) % cell.period) / cell.period;
          const b = t > 0.62 && t < 0.94 ? Math.sin(((t - 0.62) / 0.32) * Math.PI) : 0;
          if (b > 0.01) {
            ctx.fillStyle = `rgba(${EMBER},${b * 0.8 * cell.fade})`;
            ctx.fillText(cell.ch, cell.x, cell.y);
          }
        }
      }

      if (!lit) return;

      const dx = cell.x + advance / 2 - px;
      const dy = cell.y - py;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d >= REACH) return;

      const k = 1 - d / REACH;
      // Scaled by the cell's own falloff, so the light obeys the same mask
      // the field does. Without this, running the pointer over the headline
      // lights up the glyphs hiding behind the words.
      const near = k * k * cell.fade;
      if (near < 0.012) return;

      // A blank cell is not empty, only unlit — the light is what puts it on
      // the grid, which is what makes the pool read as a beam rather than a
      // brightness control.
      if (cell.blank) {
        ctx.fillStyle = `rgba(${DIM},${near * 0.34})`;
        ctx.fillText(cell.ch, cell.x, cell.y);
        return;
      }

      // Laid over the resting glyph so the two add up.
      ctx.fillStyle = `rgba(${BONE},${near * 0.62})`;
      ctx.fillText(cell.ch, cell.x, cell.y);
      if (near > 0.14) {
        ctx.fillStyle = `rgba(${EMBER},${(near - 0.14) * 1.3})`;
        ctx.fillText(cell.ch, cell.x, cell.y);
      }
    };

    /** Repaint a rectangle of the grid. Bounded by the pointer, not the page. */
    const region = (
      box: { c0: number; c1: number; r0: number; r1: number },
      now: number,
    ) => {
      for (let r = Math.max(0, box.r0); r <= Math.min(rows - 1, box.r1); r++) {
        const line = grid[r];
        if (!line) continue;
        for (let c = Math.max(0, box.c0); c <= Math.min(cols - 1, box.c1); c++) {
          draw(line[c], now);
        }
      }
    };

    const boxAround = (x: number, y: number) => ({
      c0: Math.floor((x - REACH) / advance) - 1,
      c1: Math.ceil((x + REACH) / advance) + 1,
      r0: Math.floor((y - REACH) / ROW_PITCH) - 1,
      r1: Math.ceil((y + REACH) / ROW_PITCH) + 1,
    });

    /** Build the field and paint all of it. Mount, resize, font load. */
    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont();
      advance = ctx.measureText("0").width + TRACK;
      rect = canvas.getBoundingClientRect();

      cols = Math.ceil(w / advance);
      rows = Math.ceil(h / ROW_PITCH);
      const narrow = w < 760;
      const rand = rng(SEED);

      ctx.clearRect(0, 0, w, h);
      grid = [];
      live = [];
      prev = null;

      for (let r = 0; r < rows; r++) {
        const line: Cell[] = [];
        for (let c = 0; c < cols; c++) {
          // Just over half the grid stays blank at rest — that gap is what
          // makes it look typed rather than filled. Every cell still gets a
          // glyph, because the pointer's light can reveal the blank ones.
          const blank = rand() < 0.54;
          const ch = GLYPHS[Math.floor(rand() * GLYPHS.length)];
          const roll = rand();
          const a = rand();
          const b = rand();

          const x = c * advance;
          const top = r * ROW_PITCH;
          const fade = falloff(x / w, (top + ROW_PITCH / 2) / h, narrow);

          const bone = !blank && roll < 0.08;
          const blooms = !blank && roll >= 0.08 && roll < 0.086 && fade > 0.05 && !reduced;
          const cell: Cell = {
            ch,
            x,
            y: top + ROW_PITCH / 2,
            top,
            fade,
            alpha: blank ? 0 : (bone ? 0.4 : 0.22) * fade,
            bone,
            blank,
            // Long, unequal cycles so no two lit glyphs settle into a rhythm.
            phase: blooms ? a * 11000 : 0,
            period: blooms ? 4200 + b * 5200 : 0,
          };
          line.push(cell);
          if (blooms) live.push(cell);
        }
        grid.push(line);
      }

      const now = performance.now();
      for (const line of grid) for (const cell of line) draw(cell, now);
    };

    /**
     * Repaint wherever the pointer was and wherever it is now. Everything
     * else on the canvas is already correct and is left alone, which is what
     * keeps the cost proportional to the light rather than to the field.
     */
    const trackPointer = (now: number) => {
      const box = lit ? boxAround(px, py) : null;
      if (prev) region(prev, now);
      if (box) region(box, now);
      prev = box;
    };

    /** The ambient blooms, and only those. They tick far slower. */
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - lastBloom < 90) return;
      lastBloom = now;
      // draw() folds in the pointer's light, so a cell under the cursor
      // stays lit when its own bloom repaints it.
      for (const cell of live) draw(cell, now);
    };

    /**
     * The pointer draws itself rather than setting a flag for the next
     * animation frame. It is bounded work on a 16ms throttle, so coalescing
     * buys nothing — and a redraw that only happens inside requestAnimation-
     * Frame is a redraw that silently stops in a background tab.
     */
    const onMove = (e: PointerEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      px = x;
      py = y;
      lit = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

      const now = performance.now();
      if (now - lastMove < 16) return;
      lastMove = now;
      trackPointer(now);
    };
    const onOut = () => {
      lit = false;
      trackPointer(performance.now());
    };
    const onGeometry = () => {
      rect = canvas.getBoundingClientRect();
    };

    paint();

    const ro = new ResizeObserver(paint);
    ro.observe(canvas);

    // The measured advance depends on the pixel face, which arrives after
    // first paint. Repaint once it has, or the grid is laid out on a
    // fallback's metrics.
    document.fonts?.ready.then(paint).catch(() => {});

    if (!reduced) {
      if (live.length) raf = requestAnimationFrame(frame);
      window.addEventListener("scroll", onGeometry, { passive: true });
      window.addEventListener("resize", onGeometry);
      if (hoverable) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerleave", onOut);
        document.addEventListener("mouseleave", onOut);
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onGeometry);
      window.removeEventListener("resize", onGeometry);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onOut);
      document.removeEventListener("mouseleave", onOut);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // font-mono here is not cosmetic: the family is read back off this
      // element, so the canvas and the rest of the page cannot drift apart.
      className="pointer-events-none absolute inset-0 h-full w-full font-mono select-none"
    />
  );
}
