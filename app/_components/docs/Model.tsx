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

/* ── Boxes with things in them ───────────────────────────────────────── */

export type Space = {
  /** `u/kevin`, `d/shared`. */
  path: string;
  /** What this space is, in a few words. */
  lead?: string;
  /** What is filed in it. */
  holds: string[];
  /** Who reaches it. Absent for a personal space, which is the point of one. */
  access?: string;
  /** Drawn in ember rather than in the quiet border. */
  shared?: boolean;
};

/**
 * A row of spaces, each with its contents listed.
 *
 * The flat version of the picture: no arrows, because at this size there is
 * nothing to point at. One box per root, and whether it is somebody's own or a
 * directory is the border colour.
 */
export function Spaces({ spaces, caption }: { spaces: Space[]; caption?: ReactNode }) {
  return (
    <figure className="mt-6">
      <div className={`grid gap-3 ${spaces.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {spaces.map((s) => (
          <div
            key={s.path}
            className={`flex flex-col overflow-hidden rounded-[6px] border bg-panel ${
              s.shared ? "border-ember-deep" : "border-line"
            }`}
          >
            <div className={`border-b px-3.5 py-2.5 ${s.shared ? "border-ember-deep/50" : "border-line"}`}>
              <p className={`font-mono text-[12.5px] ${s.shared ? "text-ember" : "text-bone"}`}>
                {s.path}
              </p>
              {s.lead && <p className="mt-0.5 text-[11.5px] leading-[1.5] text-mute">{s.lead}</p>}
            </div>
            <ul className="flex-1 space-y-1 px-3.5 py-2.5">
              {s.holds.map((h) => (
                <li key={h} className="flex gap-2 font-mono text-[11.5px] leading-[1.6] text-dim">
                  <span aria-hidden className="text-ember-deep">
                    ·
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            {s.access && (
              <p className="border-t border-line bg-ground/50 px-3.5 py-2 text-[11.5px] text-dim">
                {s.access}
              </p>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}

/* ── Teams on the left, what they reach on the right ─────────────────── */

export type Wiring = {
  teams: { name: string; note?: string }[];
  dirs: { path: string; holds: string[] }[];
  /** Team index to directory index. */
  links: [number, number][];
};

/**
 * The many-to-many, drawn.
 *
 * SVG with a fixed grid rather than measured HTML, because the whole content
 * of this picture is which box connects to which — and a connector drawn after
 * layout needs JavaScript, which a page that has to work as a static file does
 * not get. The viewBox scales; the text in it is real text.
 */
export function Wires({ wiring, caption }: { wiring: Wiring; caption?: ReactNode }) {
  const { teams, dirs, links } = wiring;

  const W = 620;
  const PAD = 10;
  const TEAM_W = 150;
  const TEAM_H = 46;
  const TEAM_GAP = 26;
  const DIR_X = 290;
  const DIR_W = W - DIR_X - PAD;
  const ROW = 16;
  const HEAD = 30;
  const DIR_GAP = 14;

  const dirH = dirs.map((d) => HEAD + d.holds.length * ROW + 10);
  const dirY: number[] = [];
  let y = PAD;
  for (const h of dirH) {
    dirY.push(y);
    y += h + DIR_GAP;
  }
  const dirsH = y - DIR_GAP - PAD;

  const teamsH = teams.length * TEAM_H + (teams.length - 1) * TEAM_GAP;
  const teamTop = PAD + Math.max(0, (dirsH - teamsH) / 2);
  const teamY = teams.map((_, i) => teamTop + i * (TEAM_H + TEAM_GAP));

  const H = Math.max(dirsH, teamsH) + PAD * 2;

  return (
    <figure className="mt-6">
      <div className="overflow-hidden rounded-[6px] border border-line bg-panel px-3 py-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={links
            .map(([t, d]) => `${teams[t].name} is an editor on ${dirs[d].path}`)
            .join(". ")}
        >
          <defs>
            <marker id="wire-end" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-ember-deep)" />
            </marker>
          </defs>

          {links.map(([t, d]) => {
            const x1 = PAD + TEAM_W;
            const y1 = teamY[t] + TEAM_H / 2;
            const x2 = DIR_X - 8;
            const y2 = dirY[d] + HEAD / 2 + 3;
            const mid = (x1 + x2) / 2;
            return (
              <path
                key={`${t}-${d}`}
                d={`M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`}
                fill="none"
                stroke="var(--color-ember-deep)"
                strokeWidth="1.25"
                markerEnd="url(#wire-end)"
              />
            );
          })}

          {teams.map((t, i) => (
            <g key={t.name}>
              <rect
                x={PAD}
                y={teamY[i]}
                width={TEAM_W}
                height={TEAM_H}
                rx="6"
                fill="var(--color-raise)"
                stroke="var(--color-line)"
              />
              <text x={PAD + 12} y={teamY[i] + (t.note ? 20 : 27)} className="font-sans fill-bone text-[12px]">
                {t.name}
              </text>
              {t.note && (
                <text x={PAD + 12} y={teamY[i] + 34} className="font-sans fill-mute text-[10px]">
                  {t.note}
                </text>
              )}
            </g>
          ))}

          {dirs.map((d, j) => (
            <g key={d.path}>
              <rect
                x={DIR_X}
                y={dirY[j]}
                width={DIR_W}
                height={dirH[j]}
                rx="6"
                fill="var(--color-ground)"
                stroke="var(--color-ember-deep)"
              />
              <text x={DIR_X + 12} y={dirY[j] + 19} className="font-mono fill-ember text-[11.5px]">
                {d.path}
              </text>
              <line
                x1={DIR_X}
                x2={DIR_X + DIR_W}
                y1={dirY[j] + HEAD - 2}
                y2={dirY[j] + HEAD - 2}
                stroke="var(--color-line)"
              />
              {d.holds.map((h, k) => (
                <text
                  key={h}
                  x={DIR_X + 12}
                  y={dirY[j] + HEAD + 11 + k * ROW}
                  className="font-mono fill-dim text-[10.5px]"
                >
                  {h}
                </text>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] text-mute">{caption}</figcaption>
      )}
    </figure>
  );
}
