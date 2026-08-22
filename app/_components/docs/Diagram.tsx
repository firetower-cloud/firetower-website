import type { ReactNode } from "react";

/* ── ASCII diagrams for the docs ─────────────────────────────────────────
   Same palette as the one on the landing page, and the same rule: printable
   ASCII only. The box-drawing characters (┌─┐│└┘) are missing from the
   subsetted mono face and come back from a fallback at 1.55× the cell width,
   which bows every border out of true.

   Lines are padded to a common length here rather than by hand, so a trailing
   space or a short line cannot shift a column.
   ─────────────────────────────────────────────────────────────────────── */

/**
 * Which parts of a line are the drawing and which are the words.
 *
 * Not per character: `-` is a frame in `+----+` and a hyphen in
 * "firetower-worker", and `v` is an arrowhead nowhere and a letter in
 * "event". Runs are matched instead — a pipe, a plus, or two or more dashes
 * together — so a label can contain any of them without being repainted.
 */
const FRAME_RUN = /[|+]|-{2,}/g;

function spans(line: string) {
  const out: { text: string; cls: string }[] = [];
  let at = 0;

  const push = (text: string, cls: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.cls === cls) last.text += text;
    else out.push({ text, cls });
  };

  const words = (text: string) => {
    // Capitals are the panel titles, `*` is a bullet, everything else a label.
    for (const ch of text) {
      push(ch, ch === "*" ? "text-ember" : ch >= "A" && ch <= "Z" ? "text-bone" : "text-dim");
    }
  };

  FRAME_RUN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FRAME_RUN.exec(line))) {
    words(line.slice(at, m.index));
    push(m[0], "text-mute/70");
    at = m.index + m[0].length;
  }
  words(line.slice(at));

  return out;
}

function paint(line: string, key: number) {
  return (
    <div key={key}>
      {spans(line).map((r, i) => (
        <span key={i} className={r.cls}>
          {r.text}
        </span>
      ))}
    </div>
  );
}

export function Diagram({ children, caption }: { children: string; caption?: ReactNode }) {
  const raw = String(children).replace(/^\n/, "").replace(/\s+$/, "");
  const lines = raw.split("\n");
  const width = Math.max(...lines.map((l) => l.length));
  const padded = lines.map((l) => l.padEnd(width));

  return (
    <figure className="mt-6">
      <pre
        aria-hidden
        className="overflow-x-auto rounded-[6px] border border-line bg-panel px-4 py-4 font-mono text-[11.5px] leading-[1.65] select-none [scrollbar-width:thin] sm:text-[12.5px]"
      >
        {padded.map(paint)}
      </pre>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}

/**
 * How you can deploy, and what is not ready yet.
 *
 * A list rather than prose so a method can be added without rewriting a
 * paragraph — Terraform templates are coming, and when they do this grows by
 * one entry rather than by a rewrite.
 */
export function Methods({
  items,
}: {
  items: { name: string; state: "ready" | "planned"; body: string; href?: string }[];
}) {
  return (
    <div className="mt-6 grid gap-px overflow-hidden rounded-[6px] border border-line bg-line">
      {items.map((m) => (
        <div key={m.name} className="bg-panel px-4 py-3.5">
          <p className="flex flex-wrap items-center gap-2.5">
            <span className="text-[14.5px] font-medium text-bone">{m.name}</span>
            <span
              className={`rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${
                m.state === "ready"
                  ? "border-sage/40 text-sage"
                  : "border-line text-mute"
              }`}
            >
              {m.state === "ready" ? "Available" : "Planned"}
            </span>
          </p>
          <p className="mt-1.5 text-[13.5px] leading-[1.65] text-dim">
            {m.body}{" "}
            {m.href && (
              <a
                href={m.href}
                className="text-ember underline decoration-ember-deep underline-offset-[3px]"
              >
                Read how →
              </a>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
