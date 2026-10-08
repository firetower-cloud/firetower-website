"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import { Canvas, pad, rng } from "../_lib/ascii";
import { PHONE_HITS, PHONE_COLS, PHONE_ROWS, paintPhoneMap, type PartState } from "./PhoneFailMap";
import { useFrames } from "../_lib/frames";

/* ── Break it yourself ───────────────────────────────────────────────────
   The same stack as the section above, flattened into one map, with a flame
   for a cursor. Point it at a laptop, the server, a machine or an agent and
   click: that part catches fire and goes down, the traffic stops exactly
   where it has to stop, and the map writes out what survived. Click again
   and it comes back.

   Every other resilience claim on a page like this is a sentence you either
   believe or you don't. This one you can check in about four seconds, and
   the thing you learn by checking — that nothing you burn takes the work
   with it — is the whole product.

   A phone gets a narrower map and no flame: see `PhoneFailMap`. The pointer
   is the whole conceit here, and a phone has not got one, so there the
   interaction is simply tapping the thing you want to lose.
   ─────────────────────────────────────────────────────────────────────── */

const MAP = [
  "",
  "       [ laptop ]               [ phone ]              [ desktop ]              04  YOUR DEVICES",
  "            |                       |                       |",
  "            '-----------------------+-----------------------'",
  "                                    |  https",
  "                  .-----------------+----------------.",
  "                  |  firetower                       |",
  "                  |  inbox 2 waiting, logs replayed  |                          03  FIRETOWER SERVER",
  "                  '-----------------+----------------'",
  "                                    |  ssh",
  "            .-----------------------+-----------------------.",
  "            |                       |                       |",
  "   .--------+-------.      .--------+-------.      .--------+-------.",
  "   | Mac Studio     |      | Hetzner VM     |      | homelab        |",
  "   | 192.168.1.57   |      | 5.161.44.9     |      | 10.0.0.12      |           02  WORKERS",
  "   '--------+-------'      '--------+-------'      '--------+-------'",
  "            |                       |                       |",
  "  .---------+--------.    .---------+--------.    .---------+--------.",
  "  | o Claude Code    |    | o Codex          |    | * Claude Code    |",
  "  | westlabs/ledger  |    | westlabs/api     |    | acme/web-app     |          01  AGENTS",
  "  '------------------'    '------------------'    '------------------'",
  "  tmux + its own worktree, on every machine",
];

/** Where traffic runs, device down to agent, one route per column. */
const PATHS: [number, number][][] = [
  [[2, 12], [3, 12], [3, 36], [4, 36], [4, 36], [9, 36], [10, 36], [10, 12], [11, 12], [11, 12], [16, 12], [17, 12]],
  [[2, 36], [3, 36], [3, 36], [4, 36], [4, 36], [9, 36], [10, 36], [10, 36], [11, 36], [11, 36], [16, 36], [17, 36]],
  [[2, 60], [3, 60], [3, 36], [4, 36], [4, 36], [9, 36], [10, 36], [10, 60], [11, 60], [11, 60], [16, 60], [17, 60]],
];

type Kind = "device" | "server" | "worker" | "agent";
type Part = { id: string; name: string; kind: Kind; k: number; r: number; c: number; w: number; h: number };

const PARTS: Part[] = [
  { id: "d0", name: "laptop", kind: "device", k: 0, r: 1, c: 7, w: 10, h: 1 },
  { id: "d1", name: "phone", kind: "device", k: 1, r: 1, c: 32, w: 9, h: 1 },
  { id: "d2", name: "desktop", kind: "device", k: 2, r: 1, c: 55, w: 11, h: 1 },
  { id: "s", name: "Firetower server", kind: "server", k: -1, r: 5, c: 18, w: 36, h: 4 },
  { id: "w0", name: "Mac Studio", kind: "worker", k: 0, r: 12, c: 3, w: 18, h: 4 },
  { id: "w1", name: "Hetzner VM", kind: "worker", k: 1, r: 12, c: 27, w: 18, h: 4 },
  { id: "w2", name: "homelab", kind: "worker", k: 2, r: 12, c: 51, w: 18, h: 4 },
  { id: "a0", name: "Claude Code on westlabs/ledger", kind: "agent", k: 0, r: 17, c: 2, w: 20, h: 4 },
  { id: "a1", name: "Codex on westlabs/api", kind: "agent", k: 1, r: 17, c: 26, w: 20, h: 4 },
  { id: "a2", name: "Claude Code on acme/web-app", kind: "agent", k: 2, r: 17, c: 50, w: 20, h: 4 },
];

const COLS = 100;
const ROWS = MAP.length + 1;
/* s scaffolding · t words · l legend · h hovered · e down · a recovered · p packet */
const KEYS = ["s", "t", "l", "h", "e", "a", "p"] as const;

const FIRE = "^*~&%#(){}";
/** The flame cursor, four frames of it. */
const FLAME_TOP = ["  )  ", "  (  ", " ( ) ", "  )  "];
const FLAME_MID = [" ( ) ", " ) ( ", "(  ) ", " ( ( "];

type Entry = { time: string; text: string; tone: "down" | "back" | "idle" };

function stamp() {
  const d = new Date();
  const z = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
}

function note(part: Part, goingDown: boolean): string {
  if (part.kind === "device") {
    return goingDown
      ? `${part.name} closed. the agents keep running.`
      : `${part.name} back. the session is where you left it.`;
  }
  if (part.kind === "server") {
    return goingDown
      ? "server down. workers keep running and log locally."
      : "server back. caught up from the worker logs.";
  }
  if (part.kind === "worker") {
    return goingDown
      ? `${part.name} down. worktree and branch kept on disk.`
      : `${part.name} restarted. its agent picks up the worktree.`;
  }
  return goingDown
    ? `agent stopped on ${part.name.split(" on ")[1]}. branch and files kept.`
    : "agent restarted on the same worktree.";
}

export function FailPlay() {
  const host = useRef<HTMLElement>(null);
  const { frame, now, reduced } = useFrames(70, { watch: host });
  const [down, setDown] = useState<Record<string, number>>({});
  const [back, setBack] = useState<Record<string, number>>({});
  const [lit, setLit] = useState<Record<string, number>>({});
  const [log, setLog] = useState<Entry[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const [flame, setFlame] = useState<{ x: number; y: number } | null>(null);

  function toggle(part: Part) {
    const goingDown = !down[part.id];
    if (goingDown) {
      setDown((d) => ({ ...d, [part.id]: 1 }));
      setLit((b) => ({ ...b, [part.id]: Date.now() }));
    } else {
      setDown((d) => {
        const next = { ...d };
        delete next[part.id];
        return next;
      });
      setBack((r) => ({ ...r, [part.id]: Date.now() }));
    }
    setLog((l) =>
      [{ time: stamp(), text: note(part, goingDown), tone: goingDown ? "down" : "back" } as Entry, ...l].slice(0, 5),
    );
  }

  function putOut() {
    const burning = Object.keys(down);
    if (!burning.length) return;
    const at = Date.now();
    setBack(Object.fromEntries(burning.map((id) => [id, at])));
    setDown({});
    setLit({});
    setLog((l) =>
      [{ time: stamp(), text: "all fires out. everything back, nothing lost.", tone: "back" } as Entry, ...l].slice(0, 5),
    );
  }

  /** The nearest part to the pointer, if it is within reach of one. */
  function pick(event: MouseEvent<HTMLDivElement>): Part | null {
    const map = event.currentTarget.querySelector("[data-map]");
    if (!map) return null;
    const b = map.getBoundingClientRect();
    const col = (event.clientX - b.left) / (b.width / COLS);
    const row = (event.clientY - b.top) / (b.height / 23);
    let best: Part | null = null;
    let bestD = Infinity;
    for (const part of PARTS) {
      const dx = Math.max(part.c - col, 0, col - (part.c + part.w));
      const dy = Math.max(part.r - row, 0, row - (part.r + part.h));
      const d = Math.sqrt(dx * dx + dy * 2 * (dy * 2));
      if (d < bestD) {
        bestD = d;
        best = part;
      }
    }
    return bestD <= 7 ? best : null;
  }

  /* `now` never advances when motion is reduced, so the windows that make a
     part look like it is catching fire or coming back have to read as long
     over rather than as having just started. */
  const clock = reduced ? Number.MAX_SAFE_INTEGER : now;
  const scene = useMemo(
    () => paint({ frame, now: clock, reduced, down, back, lit, hover }),
    [frame, clock, reduced, down, back, lit, hover],
  );
  const phone = useMemo(() => {
    const stateOf = (id: string): PartState => {
      if (down[id]) return clock - (lit[id] ?? 0) < 750 ? "burning" : "down";
      if (back[id] && clock - back[id] < 1500) return "recovering";
      return "up";
    };
    return paintPhoneMap({ frame, reduced, stateOf, burning: () => 0 });
  }, [frame, clock, reduced, down, back, lit]);

  const hovered = PARTS.find((p) => p.id === hover);
  const tip = hovered
    ? `${scene.upById[hovered.id] ? "burn " : "restart "}${hovered.name.split(" on ")[0]}`
    : "";
  const flick = reduced ? 0 : frame % 4;

  return (
    <section
      ref={host}
      id="try"
      aria-label="Break it yourself"
      className="relative box-border py-16 sm:min-h-screen sm:py-24"
    >
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-8 px-5 sm:grid-cols-[minmax(0,380px)_minmax(0,1fr)] sm:items-center sm:gap-x-12 sm:gap-y-5 sm:px-8">
        {/* The counter and the log mean nothing until you have seen the map,
            so on a phone the map comes between them and the heading. */}
        <div className="order-1 flex flex-col gap-5 sm:col-start-1 sm:row-start-1 sm:self-end">
          <p className="eyebrow text-flare">[ TRY IT ]</p>
          <h2 className="display text-[clamp(34px,3.8vw,54px)]">Each layer can fail on its own.</h2>
          <p className="hidden text-[17px] leading-[1.6] text-dim sm:block">
            Take the flame and set fire to any part of the stack: a laptop, the server, a
            machine, an agent. Click it again to bring it back. Watch what keeps running.
          </p>
          <p className="text-[16px] leading-[1.6] text-dim sm:hidden">
            Tap any part of the stack to set fire to it: a laptop, the server, a machine, an
            agent. Tap it again to bring it back. Watch what keeps running.
          </p>

        </div>

        <div className="order-3 flex flex-col gap-5 sm:col-start-1 sm:row-start-2 sm:self-start">
          <div className="flex items-end gap-4 border-t border-line pt-5 pb-1">
            <p
              className="text-[72px] leading-[0.85] font-semibold tracking-[-0.05em]"
              style={{
                color:
                  scene.running === 3
                    ? "var(--color-bone)"
                    : scene.running === 0
                      ? "var(--color-flare)"
                      : "var(--color-ember)",
              }}
            >
              {scene.running}/3
            </p>
            <div className="flex flex-col gap-1 pb-1">
              <span className="eyebrow">AGENTS STILL WORKING</span>
              <span className="text-[14px] text-dim">
                {scene.running === 3
                  ? Object.keys(down).length
                    ? "nothing you burned stopped them"
                    : "on machines you own"
                  : "the rest lost nothing, restart to resume"}
              </span>
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex min-h-[132px] flex-col gap-1.5 font-mono text-[12px] leading-[1.5]"
          >
            {(log.length
              ? log
              : [{ time: "--:--:--", text: "all systems running. pick something to burn.", tone: "idle" } as Entry]
            ).map((e, i) => (
              <p
                key={`${e.time}-${e.text}`}
                className="flex gap-2.5"
                style={{
                  opacity: (1 - i * 0.17).toFixed(2),
                  color:
                    e.tone === "down"
                      ? "var(--color-flare-soft)"
                      : e.tone === "back"
                        ? "var(--color-ember)"
                        : "var(--color-label)",
                }}
              >
                <span className="flex-none text-mute">{e.time}</span>
                <span>{e.text}</span>
              </p>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={putOut}
              className="min-h-11 cursor-pointer rounded-[3px] border border-rim bg-transparent px-[18px] font-mono text-[13px] tracking-[0.04em] text-bone transition-colors hover:bg-raise"
            >
              PUT OUT ALL FIRES
            </button>
          </div>
        </div>

        {/* The phone map: same stack, half the columns, tapped rather than
            burned with a cursor. */}
        <div className="order-2 w-full [container-type:inline-size] sm:hidden">
          <div className="relative border border-line-soft bg-well px-4 py-5">
            <div
              className="ascii relative mx-auto w-[46ch] text-[8px]"
              style={{
                height: `calc(${PHONE_ROWS} * 1.15em)`,
                fontSize: `min(11px, calc(100cqw / ${PHONE_COLS * 0.62}))`,
              }}
            >
              <pre aria-hidden style={{ color: "#4a4a50" }}>{phone.layers.s}</pre>
              <pre aria-hidden style={{ color: "#dcdce0" }}>{phone.layers.t}</pre>
              <pre aria-hidden style={{ color: "var(--color-label)" }}>{phone.layers.l}</pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-flare)", textShadow: "0 0 8px rgb(255 92 57 / 0.55)" }}
              >
                {phone.layers.e}
              </pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}
              >
                {phone.layers.a}
              </pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}
              >
                {phone.layers.p}
              </pre>

              {PHONE_HITS.map((hit) => {
                const part = PARTS.find((p) => p.id === hit.id)!;
                return (
                  <button
                    key={hit.id}
                    type="button"
                    aria-label={`${down[part.id] ? "Bring back" : "Set fire to"} ${part.name}`}
                    aria-pressed={!down[part.id]}
                    onClick={() => toggle(part)}
                    className="absolute m-0 border-0 bg-transparent p-0"
                    style={{
                      left: `calc(${hit.c} * 1ch - 0.4ch)`,
                      top: `calc(${hit.r} * 1.15em - 0.35em)`,
                      width: `calc(${hit.w} * 1ch + 0.8ch)`,
                      height: `calc(${hit.h} * 1.15em + 0.7em)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="order-4 hidden min-w-0 justify-center sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:flex">
          {/* `w-full`, not shrink-to-fit: the map sizes itself from the box it
              is in, so the box cannot in turn size itself from the map. */}
          <div
            className="relative w-full max-w-[900px] border border-line-soft bg-well px-6 py-7 [container-type:inline-size] [cursor:none] [@media(hover:none)]:cursor-auto"
            onMouseMove={(event) => {
              const b = event.currentTarget.getBoundingClientRect();
              setFlame({
                x: Math.round(event.clientX - b.left),
                y: Math.round(event.clientY - b.top),
              });
              setHover(pick(event)?.id ?? null);
            }}
            onMouseLeave={() => {
              setFlame(null);
              setHover(null);
            }}
            onClick={(event) => {
              const part = pick(event);
              if (part) toggle(part);
            }}
          >
            <div
              data-map
              className="ascii relative mx-auto w-[100ch] text-[8px]"
              style={{ height: "calc(23 * 1.15em)", fontSize: "min(13px, calc(100cqw / 61))" }}
            >
              <pre aria-hidden style={{ color: "#4a4a50" }}>{scene.layers.s}</pre>
              <pre aria-hidden style={{ color: "#dcdce0" }}>{scene.layers.t}</pre>
              <pre aria-hidden style={{ color: "var(--color-label)" }}>{scene.layers.l}</pre>
              <pre aria-hidden style={{ color: "var(--color-ember-soft)" }}>{scene.layers.h}</pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-flare)", textShadow: "0 0 8px rgb(255 92 57 / 0.55)" }}
              >
                {scene.layers.e}
              </pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}
              >
                {scene.layers.a}
              </pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}
              >
                {scene.layers.p}
              </pre>

              {/* The real controls. Invisible, over the drawing, so the thing
                  is operable by keyboard and legible to a screen reader even
                  though a pointer never touches them. */}
              {PARTS.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  aria-label={`${scene.upById[part.id] ? "Set fire to" : "Bring back"} ${part.name}`}
                  aria-pressed={!down[part.id]}
                  onClick={() => toggle(part)}
                  onFocus={() => setHover(part.id)}
                  onBlur={() => setHover((h) => (h === part.id ? null : h))}
                  className="absolute m-0 border-0 bg-transparent p-0 [cursor:none] focus-visible:outline-dashed"
                  style={{
                    left: `calc(${part.c} * 1ch - 0.5ch)`,
                    top: `calc(${part.r} * 1.15em - 0.3em)`,
                    width: `calc(${part.w} * 1ch + 1ch)`,
                    height: `calc(${part.h} * 1.15em + 0.6em)`,
                  }}
                />
              ))}
            </div>

            {flame && (
              <>
                <div
                  aria-hidden
                  className="pointer-events-none absolute flex flex-col items-center"
                  style={{ left: flame.x, top: flame.y, transform: "translate(-50%, -4px)" }}
                >
                  <pre className="m-0 font-mono text-[15px] leading-[0.8] text-ember-bright [text-shadow:0_0_10px_rgb(255_210_122_/_1)]">
                    {"  '  "}
                  </pre>
                  <pre className="m-0 font-mono text-[15px] leading-none text-ember-soft [text-shadow:0_0_10px_rgb(255_178_63_/_0.9)]">
                    {FLAME_TOP[flick]}
                  </pre>
                  <pre className="m-0 font-mono text-[15px] leading-none text-flare [text-shadow:0_0_12px_rgb(255_92_57_/_0.9)]">
                    {`${FLAME_MID[flick]}\n(_^_)`}
                  </pre>
                </div>
                {tip && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute font-mono text-[11.5px] tracking-[0.04em] whitespace-nowrap"
                    style={{
                      left: flame.x,
                      top: flame.y,
                      transform: "translate(18px, 14px)",
                      color:
                        hovered && !scene.upById[hovered.id]
                          ? "var(--color-ember)"
                          : "var(--color-flare-soft)",
                    }}
                  >
                    {tip}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── one frame of the map ───────────────────────────────────────────────── */

type PaintArgs = {
  frame: number;
  now: number;
  reduced: boolean;
  down: Record<string, number>;
  back: Record<string, number>;
  lit: Record<string, number>;
  hover: string | null;
};

function paint({ frame, now, reduced, down, back, lit, hover }: PaintArgs) {
  /** Four states, because a thing that has just caught fire is not yet down. */
  const stateOf = (id: string) => {
    if (down[id]) return now - (lit[id] ?? 0) < 750 ? "burning" : "down";
    if (back[id] && now - back[id] < 1500) return "recovering";
    return "up";
  };
  const isUp = (id: string) => {
    const s = stateOf(id);
    return s === "up" || s === "recovering";
  };
  const serverUp = isUp("s");
  const agentOk = [0, 1, 2].map((k) => isUp(`a${k}`) && isUp(`w${k}`));
  const running = agentOk.filter(Boolean).length;

  const canvas = new Canvas(ROWS, COLS);
  for (let r = 0; r < ROWS; r++) {
    const src = MAP[r] ?? "";
    for (let c = 0; c < COLS; c++) {
      canvas.chars[r][c] = c < src.length ? src.charAt(c) : " ";
    }
  }
  const over = (r: number, c: number, txt: string, k: string) => canvas.text(r, c, txt, k, true);
  const markPart = (part: Part, k: string) =>
    canvas.recolour(part.r, part.c, part.r + part.h - 1, part.c + part.w - 1, k);

  const R = rng(frame * 7919 + 3);

  for (const part of PARTS) {
    const s = stateOf(part.id);
    if (s === "burning") {
      // The moment of catching: flame over the box and a little above it.
      for (let r = part.r - 2; r < part.r + part.h; r++) {
        if (r < 0) continue;
        for (let c = part.c; c < part.c + part.w; c++) {
          const inside = r >= part.r;
          if ((inside && (canvas.chars[r][c] !== " " || R() < 0.35)) || (!inside && R() < 0.22)) {
            canvas.set(r, c, FIRE.charAt(Math.floor(R() * FIRE.length)), R() < 0.55 ? "e" : "a");
          }
        }
      }
      continue;
    }
    if (s === "down") markPart(part, "e");
    else if (s === "recovering") markPart(part, "a");
    else if (hover === part.id) markPart(part, "h");
  }

  // The consequences, written into the map rather than said beside it.
  [0, 1, 2].forEach((k) => {
    const device = PARTS[k];
    const s = stateOf(device.id);
    const centre = device.c + Math.floor(device.w / 2);
    if (s === "down") over(0, centre - 2, "down", "e");
    else if (s === "recovering") over(0, centre - 3, "online", "a");
    else if (!serverUp) over(0, centre - 3, "waiting", "l");
  });
  const server = stateOf("s");
  if (server === "down") over(6, 34, pad("down", 18), "e");
  else if (server === "recovering") over(6, 34, pad("replaying logs", 18), "a");
  [0, 1, 2].forEach((k) => {
    const worker = PARTS[4 + k];
    const ws = stateOf(worker.id);
    const col = worker.c + 2;
    if (ws === "down") over(14, col, pad("down", 14), "e");
    else if (ws === "recovering") over(14, col, pad("restarting", 14), "a");
    else if (!serverUp) over(14, col, pad("logs locally", 14), "a");

    const agent = PARTS[7 + k];
    const as = stateOf(agent.id);
    const acol = agent.c + 2;
    if (as === "down") {
      over(18, acol, "x", "e");
      over(19, acol, pad("branch kept", 16), "e");
    } else if (ws === "down") {
      over(18, acol, "-", "l");
      over(19, acol, pad("worktree kept", 16), "a");
    } else if (as === "recovering" || ws === "recovering") {
      over(19, acol, pad("resuming", 16), "a");
    }
  });
  const caption =
    running === 3
      ? "every agent still working"
      : running === 0
        ? "no agent running. every branch and worktree is still on disk."
        : `${running} of 3 agents working. the stopped ones lost nothing.`;
  over(ROWS - 1, 2, pad(caption, 70), running === 3 ? "l" : running === 0 ? "e" : "a");

  // Traffic. It stops exactly where something is down, which is the point.
  const packets: Record<string, 1> = {};
  if (!reduced) {
    PATHS.forEach((path, k) => {
      const cells: [number, number][] = [];
      for (let w = 0; w < path.length - 1; w++) {
        const [r0, c0] = path[w];
        const [r1, c1] = path[w + 1];
        const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
        for (let u = 0; u < n; u++) {
          cells.push([r0 + Math.sign(r1 - r0) * u, c0 + Math.sign(c1 - c0) * u]);
        }
      }
      cells.push(path[path.length - 1]);
      const blockedAt = (r: number) => {
        if (r <= 3 && !isUp(`d${k}`)) return true;
        if (r <= 10 && !serverUp) return true;
        if (r >= 10 && !isUp(`w${k}`)) return true;
        if (r >= 16 && !isUp(`a${k}`)) return true;
        return false;
      };
      const len = cells.length + 12;
      for (const ph of [0, 0.5]) {
        const at = Math.floor((frame * 0.5 + (k * len) / 3 + ph * len) % len);
        const cell = cells[at];
        // Only on the wires between boxes, never inside one.
        if (cell && !blockedAt(cell[0]) && [2, 3, 4, 9, 10, 11, 16].includes(cell[0])) {
          packets[`${cell[0]},${cell[1]}`] = 1;
        }
      }
    });
  }

  // Resolve every cell to exactly one colour layer.
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = canvas.chars[r][c];
      const k = canvas.keys[r][c];
      const word = /[A-Za-z0-9]/.test(ch);
      const hit = packets[`${r},${c}`];
      if (ch === " " && !hit) canvas.keys[r][c] = "";
      else if (!word && hit && k !== "e") {
        canvas.chars[r][c] = "*";
        canvas.keys[r][c] = "p";
      } else if (!k) canvas.keys[r][c] = c >= 80 ? "l" : word ? "t" : "s";
    }
  }

  return {
    layers: canvas.split(KEYS) as Record<(typeof KEYS)[number], string>,
    running,
    upById: Object.fromEntries(PARTS.map((p) => [p.id, isUp(p.id)])),
  };
}
