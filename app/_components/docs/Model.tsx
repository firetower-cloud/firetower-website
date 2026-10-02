import type { ReactNode } from "react";

/* ── Drawings that are not ASCII ─────────────────────────────────────────
   The ASCII `Diagram` is right for a shape you could sketch on a napkin: a
   box, an arrow, a machine under an ssh line. It is wrong for a model, where
   the thing being shown is a relationship with words on it, and every label
   has to fit a monospace grid that then decides the layout.

   These two are the permissions model, drawn in boxes the browser lays out.
   ─────────────────────────────────────────────────────────────────────── */

type Line = { term: string; text: string };

export type Layer = {
  /** PEOPLE, TEAMS, DIRECTORIES, RESOURCES. */
  name: string;
  /** One sentence: what this layer is. */
  lead: string;
  /** The things inside it, as term and meaning. */
  lines?: Line[];
  /** The things inside it, when they have no meaning to spell out. */
  chips?: string[];
  /** The last word on this layer, in a quieter voice. */
  note?: ReactNode;
  /** What the arrow to the next layer says. */
  through?: string;
};

/**
 * The model as a stack, read downwards, with the relationships on the arrows.
 *
 * One rail down the left so the four layers are visibly one chain rather than
 * four cards that happen to be near each other.
 */
export function Layers({ layers, caption }: { layers: Layer[]; caption?: ReactNode }) {
  return (
    <figure className="mt-6">
      <div className="relative rounded-[6px] border border-line bg-panel px-4 py-5 sm:px-6">
        <div className="relative pl-7">
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-[7px] w-px bg-gradient-to-b from-ember-deep via-line to-line"
          />
          {layers.map((l, i) => {
            return (
              <div key={l.name}>
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute top-[15px] -left-7 grid h-[15px] w-[15px] place-items-center rounded-full border border-ember-deep bg-ground font-mono text-[8.5px] text-ember"
                  >
                    {i + 1}
                  </span>
                  <div className="rounded-[6px] border border-line bg-ground/60 px-3.5 py-3">
                    <p className="font-narrow text-[11px] font-semibold tracking-[0.16em] text-bone uppercase">
                      {l.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-dim">{l.lead}</p>

                    {l.lines && (
                      <dl className="mt-2.5 grid gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(0,110px)_1fr]">
                        {l.lines.map((r) => (
                          <div key={r.term} className="contents">
                            <dt className="font-mono text-[11.5px] text-ember-soft">{r.term}</dt>
                            <dd className="mb-1 text-[12.5px] leading-[1.55] text-dim sm:mb-0">
                              {r.text}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {l.chips && (
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {l.chips.map((c) => (
                          <li
                            key={c}
                            className="rounded-[4px] border border-line bg-raise px-2 py-1 text-[11.5px] text-text"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}

                    {l.note && (
                      <p className="mt-2.5 border-t border-line-soft pt-2.5 text-[11.5px] leading-[1.55] text-mute">
                        {l.note}
                      </p>
                    )}
                  </div>
                </div>

                {l.through && (
                  <p className="relative flex items-center gap-2 py-2.5 text-[11.5px] text-mute">
                    <span aria-hidden className="font-mono text-ember-deep">
                      ↓
                    </span>
                    {l.through}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}

export type Place = {
  /** The directory's path, as it is written. */
  path: string;
  /** What it is for, in a few words. */
  lead: string;
  /** What is filed in it. */
  holds: string[];
  /** Who reaches it, and at what level. */
  access: { who: string; level: "Viewer" | "Editor" | "Admin" | "No access" }[];
};

const LEVEL: Record<string, string> = {
  Viewer: "border-slate/40 text-slate",
  Editor: "border-sage/40 text-sage",
  Admin: "border-ember-deep text-ember",
  "No access": "border-line text-mute",
};

/**
 * A set of directories, what is in each, and who reaches it.
 *
 * Three facts per directory and they are not the same shape, so this is three
 * bands in a card rather than a table: a table makes "what is in it" and "who
 * reaches it" look like the same kind of answer, and the whole point of a
 * directory is that they are not.
 */
export function Places({ places, caption }: { places: Place[]; caption?: ReactNode }) {
  return (
    <figure className="mt-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {places.map((p) => (
          <div
            key={p.path}
            className="flex flex-col overflow-hidden rounded-[6px] border border-line bg-panel"
          >
            <div className="border-b border-line px-3.5 py-2.5">
              <p className="font-mono text-[12.5px] text-bone">{p.path}</p>
              <p className="mt-0.5 text-[11.5px] leading-[1.5] text-mute">{p.lead}</p>
            </div>
            <ul className="flex-1 space-y-1.5 px-3.5 py-3">
              {p.holds.map((h) => (
                <li key={h} className="flex gap-2 text-[12.5px] leading-[1.5] text-dim">
                  <span aria-hidden className="text-ember-deep">
                    ·
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-line bg-ground/50 px-3.5 py-2.5">
              {p.access.map((a) => (
                <p key={a.who + a.level} className="flex items-start gap-2 text-[12px]">
                  <span
                    className={`mt-px shrink-0 rounded-[3px] border px-1.5 py-px font-mono text-[10px] tracking-wide whitespace-nowrap uppercase ${LEVEL[a.level]}`}
                  >
                    {a.level}
                  </span>
                  <span className="min-w-0 leading-[1.5] text-dim">{a.who}</span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}
