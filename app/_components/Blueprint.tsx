/* ── The hero diagram ─────────────────────────────────────────────────────
   Two apps you look at, one Firetower you run, two machines you own, and the
   sessions drawn inside the machines they actually run on. Same three tiers
   as the architecture drawing in the docs, and in the same order.

   The shape carries the argument, so it is worth saying what it is arguing
   against. Panels of equal weight in a row read as peers, so an earlier
   version — INBOX | FIRETOWER | YOUR HOSTS — claimed there was a system
   called Inbox sitting beside Firetower, and folded three separate machines
   into one box. Both are the opposite of the truth: the inbox is a screen in
   the app, and the hosts are the whole point. Hence a hub with two spokes,
   an `ssh` label on each, and the agents listed under the host that runs
   them.

   The clients are on top for a related reason. Without them the Firetower
   had to be both the server and the thing in your hands, which it said out
   loud — "runs on your laptop" — and that is the one place it does not run.
   Naming the desktop and mobile apps separately puts the laptop back where
   it belongs, on the viewing end of an https connection.

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

/* The clients, which are the only things here you look at.

   They were missing, and their absence was doing real damage: with nothing
   above it, the Firetower box had to stand for both the thing you run and
   the thing you hold, and the only way to say that in one panel was "runs on
   your laptop" — which is the one arrangement the architecture does not
   have. Naming the apps separately lets the Firetower be what it is, a
   server, and matches the drawing in the docs. */
const CLIENTS: Panel[] = [
  { title: "Desktop", rows: [text("macOS / Windows")] },
  { title: "Mobile", rows: [text("iOS / Android")] },
];

/* The Firetower is deliberately the only thing that is neither a client nor
   a machine that runs agents. Its rows say what it owns, and nothing it owns
   is an agent. */
const APP: Panel = {
  title: "FIRETOWER",
  rows: [
    { kind: "stat", label: "inbox", mark: true, value: "2 waiting on you" },
    gap(),
    text("one compose file, on a server"),
    text("you already own"),
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

/** The same four, stacked and trimmed, for a narrow screen.

    The two clients become one panel here rather than two side by side: at
    36 columns a pair of boxes leaves eleven characters of room each, and
    "macOS / Windows" does not fit in eleven. One panel with a line apiece
    says the same thing and stays legible. */
const CLIENTS_N: Panel = {
  title: "The apps",
  rows: [text("Desktop . macOS / Windows"), text("Mobile  . iOS / Android")],
};
const APP_N: Panel = {
  title: "FIRETOWER",
  rows: [
    { kind: "stat", label: "inbox", mark: true, value: "2 waiting" },
    gap(),
    text("one compose file, on a"),
    text("server you already own"),
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

/** Two blocks of known width set side by side, short one padded out. */
function beside(a: Seg[][], wa: number, b: Seg[][], wb: number, gapW: number): Seg[][] {
  const h = Math.max(a.length, b.length);
  return Array.from({ length: h }, (_, i) => [
    ...(a[i] ?? [pad(wa)]),
    pad(gapW),
    ...(b[i] ?? [pad(wb)]),
  ]);
}

/**
 * The clients above the Firetower, and the wire that joins them.
 *
 * Both apps talk to the same address, so they meet at a junction before the
 * drop rather than arriving on two separate wires — two wires would say the
 * Firetower has a desktop door and a phone door, and it has one.
 *
 * The label sits beside the trunk rather than on it, which is what the
 * stacked variant already does with `ssh`, and leaves the column free for a
 * spark to travel down.
 */
function clients(panels: Panel[], w: number) {
  const each = Math.floor((w - 2) / 2);
  const top = beside(box(panels[0], each), each, box(panels[1], each), each, w - each * 2);

  // Centre of each box, and the junction midway between them.
  const c1 = Math.floor(each / 2);
  const c2 = each + (w - each * 2) + Math.floor(each / 2);
  const j = Math.floor((c1 + c2) / 2);

  const wire: Seg[][] = [
    [pad(c1), ["|", "frame"], pad(c2 - c1 - 1), ["|", "frame"], pad(w - c2 - 1)],
    [
      pad(c1),
      ["+", "frame"],
      ["-".repeat(j - c1 - 1), "dot"],
      ["+", "frame"],
      ["-".repeat(c2 - j - 1), "dot"],
      ["+", "frame"],
      pad(w - c2 - 1),
    ],
    [pad(j), ["|", "frame"], pad(w - j - 1)],
    [pad(j), ["|", "frame"], pad(2), ["https", "sage"], pad(w - j - 8)],
    [pad(j), ["|", "frame"], pad(w - j - 1)],
  ];

  return { lines: [...top, ...wire], drop: { col: j, row: top.length + 2 } };
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
function hub(left: Seg[][], trunkRow: number, hosts: Panel[], w: number) {
  const right: Seg[][] = [];
  const raw: number[] = [];
  hosts.forEach((h, i) => {
    if (i) right.push([pad(w)]);
    const b = box(h, w);
    raw.push(right.length + Math.floor(b.length / 2));
    right.push(...b);
  });

  /* Line the machines up against the Firetower box, not against the left
     column as a whole. The column is taller than the panel the ssh wire
     actually leaves from — everything above it is clients — so centring on
     it would drag the trunk up out of the Firetower and make the wire look
     like it starts at the phone. */
  const mid = Math.floor((Math.min(...raw) + Math.max(...raw)) / 2);
  const leftLift = Math.max(0, mid - trunkRow);
  const rightLift = Math.max(0, trunkRow - mid);

  const branches = raw.map((b) => b + rightLift);
  const height = Math.max(left.length + leftLift, right.length + rightLift);
  const top = Math.min(...branches);
  const bottom = Math.max(...branches);

  // Strictly between the branches, so the vertical they share is unbroken.
  const trunk = Math.min(bottom - 1, Math.max(top + 1, leftLift + trunkRow));

  const sparks: Spark[] = [];
  const lines: Seg[][] = [];

  for (let r = 0; r < height; r++) {
    const i = r - leftLift;
    const j = r - rightLift;
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

    lines.push([...l, ...g, ...(j >= 0 && j < right.length ? right[j] : [pad(w)])]);
  }

  return { lines, sparks, leftLift };
}

/**
 * Everything stacked, with a short vertical wire between, for narrow screens.
 *
 * `wires[i]` labels the link between panel `i` and panel `i + 1`. They are
 * not all the same protocol any more — the apps reach the Firetower over
 * https and the Firetower reaches the machines over ssh — and a diagram that
 * labelled both "ssh" would be telling you the phone holds a host key.
 */
function column(panels: Panel[], w: number, wires: string[]) {
  const lines: Seg[][] = [];
  const sparks: Spark[] = [];
  const mid = Math.floor(w / 2);

  panels.forEach((p, i) => {
    if (i > 0) {
      sparks.push({ col: mid, row: lines.length, down: true });
      lines.push([pad(mid), [":", "dot"]]);
      lines.push([pad(mid), [":", "dot"], pad(2), [wires[i - 1] ?? "ssh", "sage"]]);
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

/* The left column, top to bottom: the two apps, the wire they share, and the
   Firetower they both talk to. The ssh trunk leaves from the middle of that
   last box, which is why its offset is measured rather than guessed. */
const head = clients(CLIENTS, 44);
const appBox = box(APP, 44);
const left = [...head.lines, ...appBox];
const wide = hub(left, head.lines.length + Math.floor(appBox.length / 2), HOSTS, 44);
wide.sparks.push({ col: head.drop.col, row: head.drop.row + wide.leftLift, down: true });

const tall = column([CLIENTS_N, APP_N, ...HOSTS_N], 36, ["https", "ssh", "ssh"]);

export function Blueprint() {
  return (
    <div className="relative">
      <Block lines={wide.lines} sparks={wide.sparks} className="hidden lg:block" />
      <Block lines={tall.lines} sparks={tall.sparks} className="blueprint-tall lg:hidden" />
    </div>
  );
}
