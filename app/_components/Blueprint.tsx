/* ── The hero diagram ─────────────────────────────────────────────────────
   One app, two machines you own, and the sessions drawn inside the machines
   they actually run on.

   The shape carries the argument, so it is worth saying what it is arguing
   against. Panels of equal weight in a row read as peers, so an earlier
   version — INBOX | FIRETOWER | YOUR HOSTS — claimed there was a system
   called Inbox sitting beside Firetower, and folded three separate machines
   into one box. Both are the opposite of the truth: the inbox is a screen in
   the app, and the hosts are the whole point. Hence a hub with two spokes,
   an `ssh` label on each, and the agents listed under the host that runs
   them.

   Two rules keep it from falling apart, both learned the hard way:

   1. **Pure ASCII.** The obvious frame is ┌─┐│└┘, and in this stack those
      glyphs are missing from the subsetted mono face and come back from a
      fallback at 1.55× the width — which bows every border out of true. The
      printable ASCII range is the only set guaranteed to be exactly one cell
      wide in any monospace font, so that is the whole palette here. Measure
      before adding a character.

   2. **Structure, not characters.** Rows are described by what they are and
      rendered to text with the padding computed. Hand-drawn boxes drift a
      column the moment someone edits a label, and colouring by character
      would tint the "o" in "grove-01" the same as a status mark.

   Every line in a block must come out the same length. To check:
   `[...new Set(lines.map(l => l.length))]` should have exactly one entry.
   ─────────────────────────────────────────────────────────────────────── */

type Tone = "frame" | "dot" | "bone" | "dim" | "mute" | "ember" | "slate" | "sage";
type Seg = [string, Tone];

const CLASS: Record<Tone, string> = {
  // The frame has to read as a drawn line, which --color-line (a hairline
  // meant to sit under solid panels) is far too dark to manage at 13px.
  frame: "text-mute/65",
  dot: "text-mute/45",
  bone: "text-bone",
  dim: "text-dim",
  mute: "text-mute/70",
  ember: "text-ember",
  slate: "text-slate",
  sage: "text-sage",
};

type Row =
  | { kind: "session"; waiting: boolean; agent: string; repo: string; age: string }
  | { kind: "stat"; label: string; mark: boolean; value: string }
  | { kind: "text"; text: string }
  | { kind: "gap" };

type Panel = { title: string; rows: Row[] };

const PAD = 2; // spaces inside the frame, each side
const DOTS = 8; // dashes in a branch, and so the number of steps in its spark
const FORK = 7; // column of the fork's vertical, measured into the gap
/** fork column + the vertical + the dashes + the arrowhead */
const GAP = FORK + 1 + DOTS + 1;

const sess = (waiting: boolean, agent: string, repo: string, age: string): Row => ({
  kind: "session",
  waiting,
  agent,
  repo,
  age,
});
const text = (t: string): Row => ({ kind: "text", text: t });
const gap = (): Row => ({ kind: "gap" });

/* The app is deliberately the only thing that is not a machine. Its rows say
   what it owns, and nothing it owns is an agent. */
const APP: Panel = {
  title: "FIRETOWER",
  rows: [
    { kind: "stat", label: "inbox", mark: true, value: "2 waiting on you" },
    gap(),
    text("runs on your laptop, or on a"),
    text("server you already own"),
  ],
};

/* Named by what they are and where they are. "grove-01" told you nothing;
   a provider and an address say "this is a machine, and it is yours". */
const HOSTS: Panel[] = [
  {
    title: "GCP VM . 34.79.12.180",
    rows: [
      text("worker . tmux . git"),
      sess(true, "Claude Code", "westlabs/ledger", "2h48m"),
      sess(false, "Codex", "westlabs/api", "3h34m"),
    ],
  },
  {
    title: "Hetzner VM . 5.161.44.9",
    rows: [
      text("worker . tmux . git"),
      sess(false, "Claude Code", "westlabs/web", "2h01m"),
    ],
  },
];

/** The same three, stacked and trimmed, for a narrow screen. */
const APP_N: Panel = {
  title: "FIRETOWER",
  rows: [
    { kind: "stat", label: "inbox", mark: true, value: "2 waiting" },
    gap(),
    text("runs on your laptop,"),
    text("or a server you own"),
  ],
};
const HOSTS_N: Panel[] = [
  {
    title: "GCP VM . 34.79.12.180",
    rows: [
      text("worker . tmux . git"),
      sess(true, "Claude Code", "westlabs/ledger", ""),
      sess(false, "Codex", "westlabs/api", ""),
    ],
  },
  {
    title: "Hetzner VM . 5.161.44.9",
    rows: [text("worker . tmux . git"), sess(false, "Claude Code", "westlabs/web", "")],
  },
];

const pad = (n: number): Seg => [" ".repeat(Math.max(0, n)), "frame"];

/**
 * A label longer than its panel does not overflow — it pushes every column to
 * its right out of alignment for that one row, which looks like a rendering
 * bug rather than a copy problem. Clamp so the failure is a truncated word
 * instead of a bent diagram.
 */
const fit = (t: string, room: number) => (t.length <= room ? t : t.slice(0, room));

/** One row's content, padded to the panel's inner width. */
function renderRow(row: Row, inner: number, compact: boolean): Seg[] {
  const room = inner - PAD * 2;

  if (row.kind === "gap") return [pad(inner)];

  if (row.kind === "stat") {
    const label: Seg = [row.label, "dim"];
    const mark: Seg = [row.mark ? "*" : " ", "ember"];
    const value: Seg = [row.value, "bone"];
    const lead = Math.max(1, 13 - row.label.length);
    const used = row.label.length + lead + 2 + row.value.length;
    return [pad(PAD), label, pad(lead), mark, [" ", "frame"], value, pad(room - used), pad(PAD)];
  }

  if (row.kind === "session") {
    // Which agent, on which repository, for how long. Columns sized from the
    // room available so the same row fits the wide and the narrow block.
    const ageW = compact ? 0 : 6;
    const agentW = compact ? 12 : 13;
    const repoW = room - 2 - agentW - ageW;

    const mark: Seg = [row.waiting ? "*" : "o", row.waiting ? "ember" : "slate"];
    const agent: Seg = [fit(row.agent, agentW).padEnd(agentW), row.waiting ? "bone" : "dim"];
    const repo: Seg = [fit(row.repo, repoW).padEnd(repoW), "mute"];
    const age: Seg = [row.age.padStart(ageW), "mute"];

    return [pad(PAD), mark, [" ", "frame"], agent, repo, age, pad(PAD)];
  }

  const t = fit(row.text, room);
  return [pad(PAD), [t, "dim"], pad(room - t.length), pad(PAD)];
}

/** A panel: header rule, rows, closing rule. The legend lives outside. */
function box(p: Panel, w: number, compact = false): Seg[][] {
  const inner = w - 2;
  const head = `-[x]- ${p.title} `;
  const rule = "-".repeat(Math.max(0, inner - head.length));

  return [
    [
      ["+", "frame"],
      ["-[x]- ", "frame"],
      [p.title, "bone"],
      [" ", "frame"],
      [rule, "frame"],
      ["+", "frame"],
    ],
    ...p.rows.map((r) => [["|", "frame"] as Seg, ...renderRow(r, inner, compact), ["|", "frame"] as Seg]),
    [["+", "frame"], ["-".repeat(inner), "frame"], ["+", "frame"]],
  ];
}

type Spark = { col: number; row: number; back?: boolean; down?: boolean };

/**
 * The app on the left, the machines stacked on the right, and one trunk that
 * forks to reach both.
 *
 * Two separate wires would be simpler, but they only work while the app panel
 * is tall enough to have something at each machine's height — and it is not,
 * once the app stops listing its internals. A fork does not care: the trunk
 * leaves the app at its own middle, and the branches find the machines
 * wherever they are. It is also the truer picture, since one app reaching two
 * machines is exactly what a fork means.
 */
function hub(app: Panel, hosts: Panel[], w: number) {
  const left = box(app, w);

  const right: Seg[][] = [];
  const branches: number[] = [];
  hosts.forEach((h, i) => {
    if (i) right.push([pad(w)]);
    const b = box(h, w);
    branches.push(right.length + Math.floor(b.length / 2));
    right.push(...b);
  });

  const height = Math.max(left.length, right.length);
  const top = Math.min(...branches);
  const bottom = Math.max(...branches);

  // Centre the app against the machines. One short panel top-aligned beside
  // two tall ones leaves the trunk hanging out of the top corner and the
  // whole drawing weighted to one side.
  const lift = Math.max(0, Math.floor((height - left.length) / 2));

  // Strictly between the branches, so the vertical they share is unbroken.
  const trunk = Math.min(
    bottom - 1,
    Math.max(top + 1, lift + Math.floor(left.length / 2)),
  );

  const sparks: Spark[] = [];
  const lines: Seg[][] = [];

  for (let r = 0; r < height; r++) {
    const i = r - lift;
    const l = i >= 0 && i < left.length ? left[i] : [pad(w)];
    let g: Seg[];

    if (branches.includes(r)) {
      sparks.push({ col: w + FORK + 1, row: r });
      g = [pad(FORK), ["+", "frame"], ["-".repeat(DOTS), "dot"], [">", "sage"]];
    } else if (r === trunk) {
      g = [["--", "frame"], ["ssh", "sage"], ["--", "frame"], ["+", "frame"], pad(DOTS + 1)];
    } else if (r > top && r < bottom) {
      g = [pad(FORK), ["|", "frame"], pad(DOTS + 1)];
    } else {
      g = [pad(GAP)];
    }

    lines.push([...l, ...g, ...(right[r] ?? [pad(w)])]);
  }

  return { lines, sparks };
}

/** Everything stacked, with a short vertical wire between, for narrow screens. */
function column(panels: Panel[], w: number) {
  const lines: Seg[][] = [];
  const sparks: Spark[] = [];
  const mid = Math.floor(w / 2);

  panels.forEach((p, i) => {
    if (i > 0) {
      sparks.push({ col: mid, row: lines.length, down: true });
      lines.push([pad(mid), [":", "dot"]]);
      lines.push([pad(mid), [":", "dot"], pad(2), ["ssh", "sage"]]);
    }
    lines.push(...box(p, w, true));
  });

  return { lines, sparks };
}

function Sparks({ sparks }: { sparks: Spark[] }) {
  return (
    <>
      {sparks.map((s, i) => (
        <span
          key={i}
          className={`spark ${s.down ? "spark-down" : ""}`}
          style={{
            left: `calc(${s.col} * 1ch)`,
            top: `calc(${s.row} * var(--bp-lh))`,
            animationDelay: `${-i * 0.9}s`,
          }}
        >
          *
        </span>
      ))}
    </>
  );
}

function Block({
  lines,
  sparks,
  className,
}: {
  lines: Seg[][];
  sparks: Spark[];
  className: string;
}) {
  return (
    <pre className={`blueprint ${className}`} aria-hidden>
      <Sparks sparks={sparks} />
      {lines.map((line, r) => (
        <div key={r}>
          {line.map(([t, tone], i) => (
            <span key={i} className={CLASS[tone]}>
              {t}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}

const wide = hub(APP, HOSTS, 44);
const tall = column([APP_N, ...HOSTS_N], 36);

export function Blueprint() {
  return (
    <div className="relative">
      <Block lines={wide.lines} sparks={wide.sparks} className="hidden lg:block" />
      <Block lines={tall.lines} sparks={tall.sparks} className="blueprint-tall lg:hidden" />
    </div>
  );
}
