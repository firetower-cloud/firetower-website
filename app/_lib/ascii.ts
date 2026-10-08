/* ───────────────────────────────────────────────────────────────────────────
   The drawing kit every ASCII scene on the site is built from.

   A scene is a character grid plus, for each cell, which colour layer owns
   it. Painting means writing characters into `chars` and a one-letter key
   into `keys`; `split` then turns the pair into one string per key, which the
   component hands to one `<pre>` each. Stacked congruently, those spell the
   drawing back out in colour.

   Doing it this way rather than per-character `<span>`s is what keeps the
   scenes cheap: a frame is a handful of long strings, so React diffs text
   nodes instead of tens of thousands of elements.
   ─────────────────────────────────────────────────────────────────────── */

/** mulberry32. Seeded, so a scene is the same drawing on every render. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Canvas {
  readonly rows: number;
  readonly cols: number;
  /** What is at each cell. A space means nothing was drawn there. */
  readonly chars: string[][];
  /** Which colour layer owns each cell. Empty means "no layer", i.e. blank. */
  readonly keys: string[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.chars = [];
    this.keys = [];
    for (let r = 0; r < rows; r++) {
      this.chars.push(new Array<string>(cols).fill(" "));
      this.keys.push(new Array<string>(cols).fill(""));
    }
  }

  inside(r: number, c: number) {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  /** One character. Rounds, because most callers are interpolating a line. */
  set(r: number, c: number, ch: string, key: string) {
    r = Math.round(r);
    c = Math.round(c);
    if (!this.inside(r, c)) return;
    this.chars[r][c] = ch;
    this.keys[r][c] = key;
  }

  at(r: number, c: number) {
    r = Math.round(r);
    c = Math.round(c);
    return this.inside(r, c) ? this.chars[r][c] : " ";
  }

  /**
   * A string, starting at `col`. Spaces are skipped unless `solid`, so text
   * can be laid over a drawing without punching holes in it.
   */
  text(r: number, c: number, str: string, key: string, solid = false) {
    for (let i = 0; i < str.length; i++) {
      const ch = str.charAt(i);
      if (ch === " " && !solid) continue;
      this.set(r, c + i, ch, key);
    }
  }

  /** Lines of a block, top-left at (r, c). */
  block(r: number, c: number, lines: readonly string[], key: string, solid = false) {
    lines.forEach((line, i) => this.text(r + i, c, line, key, solid));
  }

  /** Recolour whatever is already drawn inside a rectangle. */
  recolour(r0: number, c0: number, r1: number, c1: number, key: string) {
    for (let r = Math.max(0, r0); r <= Math.min(this.rows - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(this.cols - 1, c1); c++) {
        if (this.chars[r][c] !== " ") this.keys[r][c] = key;
      }
    }
  }

  /**
   * One string per colour layer. Every layer is the full grid with the cells
   * it does not own blanked, which is what lets them stack congruently.
   */
  split(layerKeys: readonly string[]): Record<string, string> {
    const out: Record<string, string[]> = {};
    for (const k of layerKeys) out[k] = [];
    for (let r = 0; r < this.rows; r++) {
      const line: Record<string, string> = {};
      for (const k of layerKeys) line[k] = "";
      for (let c = 0; c < this.cols; c++) {
        const owner = this.keys[r][c];
        const ch = this.chars[r][c];
        for (const k of layerKeys) line[k] += k === owner ? ch : " ";
      }
      for (const k of layerKeys) out[k].push(line[k]);
    }
    const joined: Record<string, string> = {};
    for (const k of layerKeys) joined[k] = out[k].join("\n");
    return joined;
  }
}

/** Right-pad or clip to exactly `n` columns. */
export function pad(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

export function repeat(ch: string, n: number) {
  return n > 0 ? ch.repeat(n) : "";
}

/** A box-drawn panel, `w` columns wide, with its lines already inside it. */
export function box(w: number, lines: readonly string[]): string[] {
  const out = [`.${repeat("-", w - 2)}.`];
  for (const l of lines) out.push(`| ${pad(l, w - 4)} |`);
  out.push(`'${repeat("-", w - 2)}'`);
  return out;
}

/** Blocks side by side, `gap` columns apart, indented by `left`. */
export function beside(blocks: readonly string[][], gap: number, left: number): string[] {
  const height = blocks.reduce((h, b) => Math.max(h, b.length), 0);
  const out: string[] = [];
  for (let i = 0; i < height; i++) {
    out.push(
      repeat(" ", left) +
        blocks.map((b) => b[i] ?? repeat(" ", b[0].length)).join(repeat(" ", gap)),
    );
  }
  return out;
}

/** Smoothstep between two thresholds. The easing every scene uses. */
export function smooth(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Every cell a segment passes through, Bresenham-ish but good enough. */
export function along(r0: number, c0: number, r1: number, c1: number): [number, number][] {
  const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  const cells: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    cells.push([r0 + Math.sign(r1 - r0) * i, c0 + Math.sign(c1 - c0) * i]);
  }
  return cells;
}

/** Hours and minutes and seconds, from seconds. */
export function duration(x: number) {
  x = Math.floor(x);
  const h = Math.floor(x / 3600);
  const m = Math.floor((x % 3600) / 60);
  const s = x % 60;
  return `${h}h ${m < 10 ? "0" : ""}${m}m ${s < 10 ? "0" : ""}${s}s`;
}

/** Token counts, the way a dashboard writes them. */
export function compact(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(Math.round(n));
}
