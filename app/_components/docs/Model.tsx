import type { ReactNode } from "react";

/* ── Drawings that are not ASCII ─────────────────────────────────────────
   The ASCII `Diagram` is right for a shape you could sketch on a napkin: a
   box, an arrow, a machine under an ssh line. It is wrong for a model, where
   the thing being shown is a relationship with words on it, and every label
   has to fit a monospace grid that then decides the layout.

   The model itself is drawn here, in boxes the browser lays out.
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

/* ── What is inside one thing, and what each part belongs to ─────────── */

type Fact = { term: string; text: string };

export type Anatomy = {
  /** The directory above it, and what the arrow down says. */
  above?: { path: string; lead: string; link: string };
  /** The thing being opened up. */
  box: { kind: string; name: string; lead: string; facts?: Fact[] };
  /** What the parts are, said once above them. */
  partsLead?: string;
  /** The parts inside it. */
  parts: { kind: string; name: string; facts: Fact[] }[];
  note?: ReactNode;
};

/**
 * One container, what it holds, and who each piece answers to.
 *
 * Drawn because a workspace is the one resource with two different things
 * inside it, and the sentence that explains it has to be read twice. The
 * picture says it once: the outer box is filed somewhere and shared with
 * whoever can reach there; each inner box is somebody's and is not.
 */
export function Inside({ anatomy, caption }: { anatomy: Anatomy; caption?: ReactNode }) {
  const { above, box, partsLead, parts, note } = anatomy;
  return (
    <figure className="mt-6">
      {above && (
        <>
          <div className="rounded-[6px] border border-line bg-panel px-3.5 py-2.5">
            <p className="font-mono text-[12.5px] text-bone">{above.path}</p>
            <p className="mt-0.5 text-[12px] leading-[1.5] text-mute">{above.lead}</p>
          </div>
          <p className="flex items-center gap-2 py-2 pl-1 text-[11.5px] text-mute">
            <span aria-hidden className="font-mono text-ember-deep">
              ↓
            </span>
            {above.link}
          </p>
        </>
      )}

      <div className="overflow-hidden rounded-[6px] border border-line bg-panel">
        <div className="border-b border-line px-3.5 py-3">
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="font-narrow text-[10px] font-semibold tracking-[0.16em] text-mute uppercase">
              {box.kind}
            </span>
            <span className="font-mono text-[13px] text-bone">{box.name}</span>
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.6] text-dim">{box.lead}</p>
          {box.facts && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {box.facts.map((f) => (
                <li
                  key={f.term}
                  className="rounded-[4px] border border-line bg-raise px-2 py-1 text-[11.5px] text-dim"
                >
                  <span className="text-text">{f.term}</span> {f.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-ground/40 px-3.5 py-3">
          {partsLead && (
            <p className="mb-2.5 flex items-center gap-2 text-[11.5px] text-mute">
              <span aria-hidden className="font-mono text-ember-deep">
                ↳
              </span>
              {partsLead}
            </p>
          )}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {parts.map((s) => (
              <div key={s.name} className="rounded-[6px] border border-line bg-panel px-3 py-2.5">
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className="font-narrow text-[10px] font-semibold tracking-[0.16em] text-mute uppercase">
                    {s.kind}
                  </span>
                  <span className="font-mono text-[12.5px] text-bone">{s.name}</span>
                </p>
                <dl className="mt-1.5 space-y-1">
                  {s.facts.map((f) => (
                    <div key={f.term} className="flex gap-2 text-[12px] leading-[1.5]">
                      <dt className="shrink-0 text-ember-soft">{f.term}</dt>
                      <dd className="min-w-0 text-dim">{f.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          {note && (
            <p className="mt-2.5 border-t border-line-soft pt-2.5 text-[11.5px] leading-[1.55] text-mute">
              {note}
            </p>
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}

/* ── Before and after one decision ───────────────────────────────────── */

export type Side = { when: string; path: string; holds: string[]; verdict: ReactNode };

/**
 * The same thing either side of a choice, with the verdict under each.
 *
 * Two columns rather than a sentence with "whereas" in it: the whole question
 * is what changed, and a reader comparing two lists finds that in one look.
 */
export function Shift({
  before,
  after,
  caption,
}: {
  before: Side;
  after: Side;
  caption?: ReactNode;
}) {
  return (
    <figure className="mt-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {[before, after].map((s, i) => (
          <div
            key={s.when}
            className={`overflow-hidden rounded-[6px] border bg-panel ${
              i === 1 ? "border-ember-deep" : "border-line"
            }`}
          >
            <p
              className={`border-b px-3.5 py-2 font-narrow text-[10px] font-semibold tracking-[0.16em] uppercase ${
                i === 1 ? "border-ember-deep/60 text-ember" : "border-line text-mute"
              }`}
            >
              {s.when}
            </p>
            <div className="px-3.5 py-3">
              <p className="font-mono text-[12.5px] text-bone">{s.path}</p>
              <ul className="mt-1.5 space-y-1">
                {s.holds.map((h) => (
                  <li key={h} className="flex gap-2 text-[12.5px] leading-[1.5] text-dim">
                    <span aria-hidden className="text-ember-deep">
                      ·
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <p className="border-t border-line bg-ground/50 px-3.5 py-2.5 text-[12px] leading-[1.55] text-dim">
              {s.verdict}
            </p>
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}
