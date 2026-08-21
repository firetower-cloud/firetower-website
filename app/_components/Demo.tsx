"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "./Screen";
import { Signal } from "./Mark";
import { SEEDED, DIFF, DIFF_TOTAL, type DemoSession, type SessionStatus } from "./DemoData";

/* ── The product, running ─────────────────────────────────────────────────
   The screen opens on the composer with a few sessions under it, one in each
   of the three states that matter: still going, stopped and waiting on you,
   and finished with a diff to ship.

   Open the working one and it never finishes — a demo that wraps up in eight
   seconds demonstrates a task; this one demonstrates the product, which is
   what you do with the twenty minutes while the task runs. Open the waiting
   one and you can answer it, and it goes back to work. Open the finished one
   and you can push what it wrote.

   Everything is fake and none of it is a recording — at 1250px a video would
   be soft, and the controls being real is the part hardest to describe in a
   sentence.
   ─────────────────────────────────────────────────────────────────────── */

type View = { at: "home" } | { at: "starting" } | { at: "session"; id: string };

const REPOS = ["westlabs/ledger", "westlabs/api", "westlabs/web", "No repository"];
const HOSTS = ["34.79.12.180", "5.161.44.9", "localhost"];

/* Marked rather than hidden, which is what the real composer does: an agent
   missing from the list looks like it does not exist and leaves nowhere to
   learn what is missing. Only one is installed on this machine. */
const AGENTS = [
  { label: "Claude Code", here: true },
  { label: "Codex", here: false },
  { label: "Open Code", here: false },
];
const agentLabel = (a: (typeof AGENTS)[number]) =>
  a.here ? a.label : `${a.label} · unavailable here`;

const PROMPT = "Rate-limit the webhook receiver, 100/min per key";
const MINE = "vesper";

const GLYPH = { repo: "▣", branch: "⑂", host: "⌂", agent: "◈" } as const;

/** The control plane's own step labels, in the order it runs them. */
const STEPS = [
  { label: "Fetching the repository", detail: "1.2 GB" },
  { label: "Creating the worktree", detail: "4 files changed" },
  { label: "Making the workspace", detail: "" },
  { label: "Running setup", detail: "8s" },
  { label: "Starting the agent", detail: "tmux 0:agent" },
];

/** The session screen's tabs, as the application has them. */
const TABS = ["Terminal", "Shell", "Files", "Changes"] as const;

const STATUS_WORD: Record<SessionStatus, string> = {
  Working: "working",
  NeedsYou: "needs you",
  Ended: "done",
};

type Tone = "dim" | "text" | "bone" | "sage" | "ember" | "banner";
type Line = { tone: Tone; body: string };

const TONE: Record<Tone, string> = {
  dim: "text-mute",
  text: "text-text",
  bone: "text-bone",
  sage: "text-sage",
  ember: "text-ember-soft",
  banner: "",
};

const FILES = [
  "src/http/webhooks.rs",
  "src/http/limit.rs",
  "src/http/mod.rs",
  "crates/ft-server/src/routes.rs",
  "crates/ft-core/src/rate.rs",
  "crates/ft-core/src/clock.rs",
  "tests/http_limit.rs",
  "migrations/0007_rate_buckets.sql",
];

/** mulberry32 — the same small PRNG the rest of the site uses. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One unit of work, derived from its index so the stream is endless without
 * being random — the same tick always prints the same thing, which makes it
 * possible to reason about and impossible to drift between renders.
 */
function activity(i: number, seed: number): Line[] {
  const rand = rng((i + seed) * 2654435761 + 11);
  const file = FILES[Math.floor(rand() * FILES.length)];
  const pick = Math.floor(rand() * 12);
  const n = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo));

  if (pick < 4)
    return [
      { tone: "text", body: `⏺ Read(${file})` },
      { tone: "dim", body: `  ⎿  Read ${n(40, 460)} lines` },
    ];
  if (pick < 7)
    return [
      { tone: "text", body: `⏺ Update(${file})` },
      { tone: "dim", body: `  ⎿  Updated with ${n(2, 40)} additions and ${n(0, 12)} removals` },
    ];
  if (pick === 7)
    return [
      { tone: "text", body: `⏺ Write(${file})` },
      { tone: "dim", body: `  ⎿  Wrote ${n(20, 120)} lines` },
    ];
  if (pick === 8)
    return [
      { tone: "text", body: `⏺ Bash(cargo test -p ft-server http::)` },
      { tone: "sage", body: `  ⎿  ${n(12, 48)} passed in ${n(3, 19)}.${n(0, 9)}s` },
    ];
  if (pick === 9)
    return [
      { tone: "text", body: `⏺ Search("rate_limit" in crates/)` },
      { tone: "dim", body: `  ⎿  Found ${n(2, 24)} matches across ${n(2, 9)} files` },
    ];
  if (pick === 10)
    return [
      { tone: "text", body: `⏺ Bash(cargo clippy --all-targets)` },
      { tone: "dim", body: `  ⎿  Finished in ${n(4, 26)}s, no warnings` },
    ];
  return [
    {
      tone: "text",
      body: `⏺ The bucket needs to survive a restart, so it goes in ${file.split("/").pop()}.`,
    },
  ];
}

/** Bounded: a terminal open for an hour is not a memory leak. */
const KEEP = 50;

/** What the branch would be called if you leave it alone. The real thing. */
function suggestion(prompt: string) {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 5)
    .join("-");
  return slug ? `ft/${slug}` : "ft/session";
}

const clock = (s: number) =>
  s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

export function Demo() {
  const [view, setView] = useState<View>({ at: "home" });
  const [sessions, setSessions] = useState<DemoSession[]>(SEEDED);
  const [ticks, setTicks] = useState<Record<string, number>>({});
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [pushed, setPushed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [step, setStep] = useState(0);

  const [text, setText] = useState(PROMPT);
  const [repo, setRepo] = useState(REPOS[0]);
  const [host, setHost] = useState(HOSTS[0]);
  const [agent, setAgent] = useState(AGENTS[0].label);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => clearAll, []);

  /* Everything that is working keeps working, whether or not you are looking
     at it. That is the claim, so the demo had better honour it. */
  const busy = sessions.some((s) => s.status === "Working");
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => {
      setTicks((t) => {
        const next = { ...t };
        for (const s of sessions) if (s.status === "Working") next[s.id] = (next[s.id] ?? 0) + 1;
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, [busy, sessions]);

  const mineRunning = sessions.some((s) => s.id === MINE && s.status === "Working");
  useEffect(() => {
    if (!mineRunning) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [mineRunning]);

  const branch = suggestion(text);

  const launch = () => {
    clearAll();
    setSeconds(0);
    setStep(0);
    setTicks((t) => ({ ...t, [MINE]: 0 }));
    setSessions((list) => [
      {
        id: MINE,
        agent,
        repo: repo === "No repository" ? "—" : repo,
        branch,
        host,
        title: text || PROMPT,
        status: "Working",
        age: "0s",
        seed: 5,
      },
      ...list.filter((s) => s.id !== MINE),
    ]);

    // Reduced motion gets the session already under way rather than five
    // seconds of checklist it did not ask to watch.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(STEPS.length);
      setTicks((t) => ({ ...t, [MINE]: 6 }));
      setView({ at: "session", id: MINE });
      return;
    }

    setView({ at: "starting" });
    // Uneven on purpose: a fetch is slow, a worktree is instant, and a list
    // that ticks like a metronome reads as a loading bar.
    let t = 400;
    [1150, 620, 480, 900, 700].forEach((b, i) => {
      t += b;
      at(t, () => setStep(i + 1));
    });
    at(t + 550, () => setView({ at: "session", id: MINE }));
  };

  const reset = () => {
    clearAll();
    setView({ at: "home" });
    setSessions(SEEDED);
    setTicks({});
    setReplies({});
    setPushed(false);
    setSeconds(0);
    setStep(0);
    setText(PROMPT);
  };

  /** Answering a blocked session is what puts it back to work. */
  const answer = (id: string, reply: string) => {
    setReplies((r) => ({ ...r, [id]: reply }));
    setTicks((t) => ({ ...t, [id]: 0 }));
    setSessions((list) =>
      list.map((s) => (s.id === id ? { ...s, status: "Working", ask: undefined } : s)),
    );
  };

  const open = view.at === "session" ? sessions.find((s) => s.id === view.id) : undefined;
  const pinned = sessions.filter((s) => s.status === "Working").map((s) => s.id);

  return (
    <Shell pinnedNames={pinned}>
      {/* Scrolls when a state is taller than the lid, the way a real screen
          does. The fade marks that there is more; this makes the more
          reachable rather than merely implied. */}
      <div className="flex h-full flex-col overflow-y-auto px-4 py-4 [scrollbar-width:none] sm:px-6 sm:py-5 [&::-webkit-scrollbar]:hidden">
        <div
          className={`mx-auto flex w-full flex-col ${
            open ? "max-w-[1040px]" : "max-w-[880px]"
          }`}
        >
          {view.at === "home" && (
            <Home
              text={text}
              setText={setText}
              repo={repo}
              setRepo={setRepo}
              host={host}
              setHost={setHost}
              agent={agent}
              setAgent={setAgent}
              onLaunch={launch}
              sessions={sessions}
              onOpen={(id) => setView({ at: "session", id })}
              seconds={seconds}
            />
          )}

          {view.at === "starting" && (
            <>
              <SessionHeader
                session={{
                  id: MINE,
                  agent,
                  repo: repo === "No repository" ? "—" : repo,
                  branch,
                  host,
                  title: text || PROMPT,
                  status: "Working",
                  age: clock(seconds),
                  seed: 5,
                }}
                building
                onReset={reset}
              />
              <div className="mt-4">
                <Checklist done={step} host={host} repo={repo} />
              </div>
            </>
          )}

          {open && (
            <>
              <SessionHeader
                session={open}
                age={open.id === MINE ? clock(seconds) : open.age}
                onBack={() => setView({ at: "home" })}
                onReset={reset}
              />
              <div className="mt-3">
                {open.status === "Ended" ? (
                  <Changes pushed={pushed} onPush={() => setPushed(true)} branch={open.branch} />
                ) : (
                  <Live
                    session={open}
                    ticks={ticks[open.id] ?? 0}
                    reply={replies[open.id]}
                    onAnswer={(v) => answer(open.id, v)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}

/* ── Home: the composer, and what is already running ──────────────────── */

function Home({
  text,
  setText,
  repo,
  setRepo,
  host,
  setHost,
  agent,
  setAgent,
  onLaunch,
  sessions,
  onOpen,
  seconds,
}: {
  text: string;
  setText: (v: string) => void;
  repo: string;
  setRepo: (v: string) => void;
  host: string;
  setHost: (v: string) => void;
  agent: string;
  setAgent: (v: string) => void;
  onLaunch: () => void;
  sessions: DemoSession[];
  onOpen: (id: string) => void;
  seconds: number;
}) {
  const waiting = sessions.filter((s) => s.status === "NeedsYou");
  const rest = sessions.filter((s) => s.status !== "NeedsYou");

  return (
    <>
      <p className="eyebrow">New session</p>
      <h3 className="mt-1.5 text-[19px] leading-[1.15] font-semibold tracking-[-0.02em] text-bone sm:text-[21px]">
        What should we work on?
      </h3>

      <div className="mt-3">
        <Composer
          text={text}
          setText={setText}
          repo={repo}
          setRepo={setRepo}
          host={host}
          setHost={setHost}
          agent={agent}
          setAgent={setAgent}
          onLaunch={onLaunch}
        />
      </div>

      {/* What is blocked gets a card of its own, with the question in the
          agent's own words. Without it the row is a coloured dot you have to
          open a terminal to understand, and opening the terminal is most of
          the cost of being interrupted. */}
      {waiting.length > 0 && (
        <>
          <p className="eyebrow mt-4">
            Needs you <span className="text-ember">{waiting.length}</span>
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {waiting.map((s) => (
              <NeedsCard key={s.id} session={s} onOpen={() => onOpen(s.id)} />
            ))}
          </div>
        </>
      )}

      <p className="eyebrow mt-3">
        Sessions <span className="text-dim">{rest.length}</span>
      </p>
      <div className="panel mt-2 divide-y divide-line-soft">
        {rest.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpen(s.id)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-raise"
          >
            <Signal status={s.status === "Ended" ? "HandedBack" : s.status} size={5} />
            <span className="shrink-0 text-[13px] text-bone">{s.id}</span>
            <span className="hidden font-mono text-[11.5px] text-mute sm:inline">{s.repo}</span>
            <span className="hidden min-w-0 flex-1 truncate text-[13px] text-text md:block">
              {s.title}
            </span>
            <span className="min-w-0 flex-1 md:hidden" />
            <span
              className={`shrink-0 font-mono text-[11px] ${
                s.status === "NeedsYou"
                  ? "text-ember"
                  : s.status === "Ended"
                    ? "text-sage"
                    : "text-slate"
              }`}
            >
              {STATUS_WORD[s.status]}
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-[11px] text-dim">
              {s.id === MINE ? clock(seconds) : s.age}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/** A blocked session, in the shape the application gives it. */
function NeedsCard({ session, onOpen }: { session: DemoSession; onOpen: () => void }) {
  return (
    <div className="panel relative overflow-hidden border-ember/25 bg-ember/[0.035]">
      <span className="absolute inset-y-0 left-0 w-[2px] bg-ember" />

      <div className="flex items-start gap-3 px-4 pt-2.5 pb-2.5">
        <div className="pt-0.5">
          <Signal status="NeedsYou" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold text-bone">{session.id}</span>
            <span className="min-w-0 truncate text-[13px] text-dim">{session.title}</span>
          </div>

          <div className="mt-0.5 hidden flex-wrap items-center gap-x-2 font-mono text-[11px] text-mute sm:flex">
            <span>{session.repo}</span>
            <span>·</span>
            <span>{session.agent}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{session.host}</span>
            <span>·</span>
            <span>{session.age} waiting</span>
          </div>

          {/* What it actually wants, in its own words. */}
          {session.ask && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-[1.5] text-text">{session.ask}</p>
          )}

          <button
            onClick={onOpen}
            className="mt-2.5 rounded-[5px] bg-ember px-3 py-1.5 text-[12.5px] font-semibold text-[#1a0c04] transition-opacity hover:opacity-90"
          >
            Open agent
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── The session's header ─────────────────────────────────────────────── */

function SessionHeader({
  session,
  age,
  building,
  onBack,
  onReset,
}: {
  session: DemoSession;
  age?: string;
  building?: boolean;
  onBack?: () => void;
  onReset: () => void;
}) {
  const status: SessionStatus = building ? "Working" : session.status;
  return (
    <header>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        {/* The way out. It is the point of the screen, so it comes first. */}
        <button
          onClick={onBack}
          disabled={!onBack}
          className="shrink-0 rounded-[5px] border border-line px-2 py-1 text-[12px] text-dim transition-colors hover:border-ember-deep hover:text-bone disabled:opacity-40 disabled:hover:border-line disabled:hover:text-dim"
        >
          ← Go back to sessions
        </button>
        <Signal status={status === "Ended" ? "HandedBack" : status} size={6} />
        <span className="text-[14px] text-bone">{session.id}</span>
        {/* Dropped on a phone: the row is already back-link, name, clock and
            the way to start again, and the dot beside the name says this. */}
        <span className="hidden rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-slate sm:inline">
          {building ? "Starting" : STATUS_WORD[session.status]}
        </span>
        <span className="ml-auto font-mono text-[11px] text-mute">{age ?? session.age}</span>
        <Reset onClick={onReset} />
      </div>

      <p className="mt-1.5 truncate text-[13.5px] text-dim">{session.title}</p>

      {/* Dropped on a phone, where it wraps to three lines and costs more
          height than the diff underneath can spare. */}
      <div className="mt-1.5 hidden flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11.5px] text-mute sm:flex">
        <span>{session.repo}</span>
        <span>⑂ {session.branch}</span>
        <span>{session.agent}</span>
        <span>{session.host}</span>
      </div>
    </header>
  );
}

function Tabs({ active }: { active: (typeof TABS)[number] }) {
  return (
    /* Not wired up: they are here to say a session is more than a terminal,
       and a dead tab is more honest than a fake one. */
    <div className="mb-2.5 flex gap-1">
      {TABS.map((t) => (
        <span
          key={t}
          className={`rounded-[5px] px-2.5 py-1 text-[12px] ${
            t === active ? "bg-raise text-bone" : "text-mute"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── A session that is still going, or waiting on you ─────────────────── */

function Live({
  session,
  ticks,
  reply,
  onAnswer,
}: {
  session: DemoSession;
  ticks: number;
  reply?: string;
  onAnswer: (v: string) => void;
}) {
  const waiting = session.status === "NeedsYou";

  const lines: Line[] = [
    { tone: "banner", body: "" },
    { tone: "bone", body: `> ${session.title}` },
  ];
  if (waiting || reply) {
    for (let i = 0; i < 4; i++) lines.push(...activity(i, session.seed));
    if (session.ask) lines.push({ tone: "ember", body: `⏺ ${session.ask}` });
  }
  if (reply) lines.push({ tone: "bone", body: `> ${reply}` });
  for (let i = 0; i < ticks; i++) lines.push(...activity(i + (reply ? 40 : 0), session.seed));

  const visible = lines.length > KEEP ? lines.slice(lines.length - KEEP) : lines;

  return (
    <div className="flex flex-col">
      <Tabs active="Terminal" />

      <div className="panel flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-line bg-raise/40 px-3 py-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              waiting ? "ember-pulse bg-ember" : "breathe bg-ember"
            }`}
          />
          <span className="eyebrow">{waiting ? "Waiting on you" : "Working"}</span>
          <span className="ml-auto font-mono text-[10.5px] text-mute">tmux 0:agent</span>
        </div>

        <Transcript lines={visible} waiting={waiting} />

        {waiting ? (
          <ReplyBox onSend={onAnswer} />
        ) : (
          <div className="border-t border-line bg-raise/40 px-3.5 py-2.5">
            <span className="text-[12.5px] text-dim">
              It will be a while. You do not have to watch it.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Transcript({ lines, waiting }: { lines: Line[]; waiting: boolean }) {
  const pane = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pane.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <div
      ref={pane}
      className={`overflow-y-auto bg-[#0b0a09] px-3.5 py-3 font-mono text-[11.5px] leading-[1.75] [scrollbar-width:none] sm:text-[12px] [&::-webkit-scrollbar]:hidden ${
        waiting ? "h-[160px] sm:h-[212px]" : "h-[196px] sm:h-[276px]"
      }`}
    >
      {lines.map((l, i) =>
        l.tone === "banner" ? (
          <Banner key={i} />
        ) : (
          <p key={i} className={TONE[l.tone]}>
            {l.body}
          </p>
        ),
      )}
      {!waiting && <span className="caret inline-block h-[13px] w-[6px] translate-y-[2px] bg-ember" />}
    </div>
  );
}

/** Answering is the whole interaction the product exists for. */
function ReplyBox({ onSend }: { onSend: (v: string) => void }) {
  const [value, setValue] = useState("");
  const send = () => {
    const v = value.trim();
    if (v) onSend(v);
  };

  return (
    <div className="border-t border-ember-deep/60 bg-ember-deep/10 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[12px] text-ember">❯</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Answer it — anything will do"
          className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-bone placeholder:text-mute focus:outline-none"
        />
        <button
          onClick={send}
          disabled={!value.trim()}
          className="shrink-0 rounded-[5px] bg-ember px-3 py-1 text-[12px] font-semibold text-[#1a0c04] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* ── A session that finished, and what to do with it ──────────────────── */

function Changes({
  pushed,
  onPush,
  branch,
}: {
  pushed: boolean;
  onPush: () => void;
  branch: string;
}) {
  const [selected, setSelected] = useState(DIFF[0].path);
  const file = DIFF.find((f) => f.path === selected) ?? DIFF[0];

  return (
    <div className="flex flex-col">
      <Tabs active="Changes" />

      {/* The rail moves beside the patch as soon as there is room. Left to
          `lg`, everything between a phone and a laptop gets a tall diff and a
          stacked rail, which is the one combination that does not fit. */}
      <div className="grid gap-3 sm:grid-cols-[1fr_204px] lg:grid-cols-[1fr_218px]">
        {/* A list beside a patch rather than one long scroll: the question is
            almost always "what did it touch", and only then "what to this
            one". */}
        <div className="grid h-[168px] grid-cols-[124px_1fr] overflow-hidden rounded-[6px] border border-line sm:h-[300px] sm:grid-cols-[140px_1fr] lg:grid-cols-[168px_1fr]">
          <ul className="min-h-0 overflow-y-auto border-r border-line bg-panel py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DIFF.map((f) => (
              <li key={f.path}>
                <button
                  onClick={() => setSelected(f.path)}
                  className={`flex w-full items-baseline gap-1.5 px-2.5 py-1.5 text-left transition-colors ${
                    f.path === file.path ? "bg-raise" : "hover:bg-raise/60"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-dim">
                    {f.path.split("/").slice(-1)[0]}
                  </span>
                  <span className="shrink-0 font-mono text-[9.5px] text-brick">−{f.removed}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-h-0 overflow-auto bg-[#0f0e0d] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="sticky top-0 border-b border-line bg-[#0f0e0d] px-3 py-1.5">
              <span className="font-mono text-[11px] text-slate">{file.path}</span>
            </div>
            <pre className="px-3 py-2 font-mono text-[11px] leading-[1.6]">
              {file.patch.split("\n").map((line, i) => (
                <div key={i} className={colour(line)}>
                  {line || " "}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <aside className="rounded-[6px] border border-line px-3 py-3">
          <p className="eyebrow mb-2.5">The work</p>

          <p className="flex items-center gap-2 text-[12.5px] text-bone">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${pushed ? "bg-sage" : "bg-ember"}`}
            />
            {pushed ? "Everything is pushed" : "Not everything is saved"}
          </p>
          <p className="mt-1 font-mono text-[11px] text-mute">
            {pushed
              ? `${DIFF.length} files · 0 unpushed`
              : `${DIFF.length} uncommitted · −${DIFF_TOTAL.removed} lines`}
          </p>

          {/* Side by side on a phone, stacked where there is a column for
              them. Two buttons in a row is 60px the patch gets to keep. */}
          <div className="mt-3 flex gap-1.5 sm:flex-col">
            <Action
              label={pushed ? "Pushed" : "Commit and push"}
              hint={pushed ? "Up to date" : `${DIFF.length} files changed`}
              onClick={onPush}
              disabled={pushed}
              className="flex-1 sm:flex-none"
            />
            <Action
              label="Open pull request"
              hint={pushed ? branch : "Push the branch first"}
              disabled={!pushed}
              className="flex-1 sm:flex-none"
            />
            {/* Dropped on a phone: with the rail stacked above the patch, the
                third action is what pushes the diff off the bottom. */}
            <Action
              label="Destroy the workspace"
              hint="Everything is pushed"
              disabled={!pushed}
              className="hidden sm:flex"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function colour(line: string) {
  if (line.startsWith("+++") || line.startsWith("---")) return "text-mute";
  if (line.startsWith("+")) return "bg-sage/[0.07] text-sage";
  if (line.startsWith("-")) return "bg-brick/[0.07] text-brick";
  if (line.startsWith("@@")) return "text-ember/70";
  return "text-dim";
}

function Action({
  label,
  hint,
  onClick,
  disabled,
  className = "",
}: {
  label: string;
  hint?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start rounded-[5px] border border-line px-2.5 py-1.5 text-left transition-colors hover:border-ember/40 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line ${className}`}
    >
      <span className="text-[12.5px] text-bone">{label}</span>
      {hint && <span className="text-[11px] text-mute">{hint}</span>}
    </button>
  );
}

function Reset({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-[5px] border border-line px-2 py-1 font-mono text-[10.5px] text-mute transition-colors hover:border-ember-deep hover:text-ember ${className}`}
    >
      ↻ start over
    </button>
  );
}

/** The welcome box, drawn with a border rather than box-drawing characters. */
function Banner() {
  return (
    <div className="mb-2 rounded-[6px] border border-line px-3 py-2">
      <p className="text-bone">
        <span className="text-ember">✻</span> Welcome to Claude Code!
      </p>
      <p className="mt-1 text-mute">/help for help, /status for your current setup</p>
      <p className="text-mute">cwd: /var/lib/firetower/wt/session</p>
    </div>
  );
}

/* ── The composer ─────────────────────────────────────────────────────── */

function Composer({
  text,
  setText,
  repo,
  setRepo,
  host,
  setHost,
  agent,
  setAgent,
  onLaunch,
}: {
  text: string;
  setText: (v: string) => void;
  repo: string;
  setRepo: (v: string) => void;
  host: string;
  setHost: (v: string) => void;
  agent: string;
  setAgent: (v: string) => void;
  onLaunch: () => void;
}) {
  const none = repo === "No repository";

  return (
    <div className="panel overflow-hidden bg-raise">
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onLaunch();
        }}
        placeholder="What should we work on?"
        className="w-full resize-none bg-transparent px-4 py-3 text-[14px] leading-6 text-bone placeholder:text-mute focus:outline-none"
      />

      <div className="border-t border-line px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip glyph={GLYPH.repo} value={repo} options={REPOS} onChange={setRepo} />
          {!none && (
            <span className="hidden md:contents">
              <Chip
                glyph={GLYPH.branch}
                value={suggestion(text)}
                options={[suggestion(text), "main"]}
              />
            </span>
          )}
          <Chip glyph={GLYPH.host} value={host} options={HOSTS} onChange={setHost} />
          <Chip
            glyph={GLYPH.agent}
            value={agent}
            options={AGENTS.map((a) => ({ label: agentLabel(a), disabled: !a.here }))}
            onChange={setAgent}
          />

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-[10px] text-mute sm:inline">⌘⏎</span>
            <button
              onClick={onLaunch}
              disabled={!text.trim()}
              className="rounded-[5px] bg-ember px-3.5 py-1.5 text-[12.5px] font-semibold text-[#1a0c04] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
            >
              Launch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The composer's chip: a label with a real select laid invisibly over it. */
function Chip({
  glyph,
  value,
  options,
  onChange,
}: {
  glyph: string;
  value: string;
  options: (string | { label: string; disabled?: boolean })[];
  onChange?: (v: string) => void;
}) {
  const list = options.map((o) => (typeof o === "string" ? { label: o, disabled: false } : o));
  return (
    <label className="relative flex items-center gap-1.5 rounded-[5px] border border-line bg-panel py-1 pr-6 pl-2 text-[12px] text-dim transition-colors hover:border-[#3a3631] hover:text-text">
      <span className="text-mute">{glyph}</span>
      <span className="max-w-[150px] truncate">{value}</span>
      <span className="pointer-events-none absolute right-2 text-[9px] text-mute">▾</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={!onChange}
        aria-label={value}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-default"
      >
        {list.map((o) => (
          <option key={o.label} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ── Building the workspace ───────────────────────────────────────────── */

function Checklist({ done, host, repo }: { done: number; host: string; repo: string }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line bg-raise/40 px-4 py-2.5">
        <span className="eyebrow">Building the workspace</span>
        <span className="ml-auto font-mono text-[11px] text-mute">
          {repo === "No repository" ? host : `${repo} · ${host}`}
        </span>
      </div>
      <ol className="divide-y divide-line-soft">
        {STEPS.map((s, i) => {
          const state = i < done ? "done" : i === done ? "running" : "pending";
          return (
            <li key={s.label} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-3.5 shrink-0 text-center">
                {state === "done" ? (
                  <span className="text-sage">✓</span>
                ) : state === "running" ? (
                  <span className="breathe inline-block h-1.5 w-1.5 rounded-full bg-ember align-middle" />
                ) : (
                  <span className="inline-block h-1.5 w-1.5 rounded-full border border-line align-middle" />
                )}
              </span>
              <span
                className={`text-[13px] ${
                  state === "pending" ? "text-mute" : state === "running" ? "text-bone" : "text-dim"
                }`}
              >
                {s.label}
              </span>
              <span className="ml-auto font-mono text-[11px] text-mute">
                {state === "done" ? s.detail : state === "running" ? "…" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
