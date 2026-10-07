"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, pad, repeat, rng } from "../_lib/ascii";
import { useFrames } from "../_lib/frames";
import { TRAIL_COLS, TRAIL_ROWS, paintPhoneTrails } from "./PhoneTrails";

/* ── The skills library ──────────────────────────────────────────────────
   A cabinet with a slot per skill on the left, your teammates' camps on the
   right, and a trail from the selected skill to each of them. Share a skill
   with somebody and their trail lights up and starts carrying traffic — their
   agents can use it now. Upload one and a crate comes down on a line into the
   empty slot.

   The drawing is doing the explaining: the thing that is hard to say in a
   sentence is that a skill is uploaded once and reaches every agent of every
   person it is shared with, and a lit trail with something moving down it
   says that without a sentence.
   ─────────────────────────────────────────────────────────────────────── */

const COLS = 112;
const ROWS = 24;
/* s ground · b cabinet · t words · l quiet · e campfire · a shared · p traffic */
const KEYS = ["s", "b", "t", "l", "e", "a", "p"] as const;

const TEAM = [
  { name: "kevin", agent: "Claude Code" },
  { name: "mara", agent: "Codex" },
  { name: "sam", agent: "Claude Code" },
  { name: "priya", agent: "Kimi" },
];

type Skill = { name: string; ver: string; author: string; desc: string; shared: string[] };

const SEED: Skill[] = [
  {
    name: "/review-pr",
    ver: "v1.4",
    author: "mara",
    desc: "Reviews a pull request against the team checklist before anyone else looks at it.",
    shared: ["kevin", "mara", "sam", "priya"],
  },
  {
    name: "/write-tests",
    ver: "v2.1",
    author: "sam",
    desc: "Writes tests for the files an agent just changed, in the style the repo already uses.",
    shared: ["kevin", "sam"],
  },
  {
    name: "/migrate-db",
    ver: "v0.9",
    author: "kevin",
    desc: "Plans a schema migration on its own branch and checks it against a copy of the data.",
    shared: ["kevin"],
  },
  {
    name: "/changelog",
    ver: "v1.0",
    author: "priya",
    desc: "Drafts the changelog entry from the pull requests merged since the last release.",
    shared: ["kevin", "mara", "sam", "priya"],
  },
  {
    name: "/security-scan",
    ver: "v1.2",
    author: "mara",
    desc: "Checks a diff for leaked secrets and risky calls before it is committed.",
    shared: ["mara", "priya"],
  },
  {
    name: "/deploy-preview",
    ver: "v0.3",
    author: "kevin",
    desc: "Starts a preview of the current worktree and posts the link on the issue.",
    shared: [],
  },
];

/** Which grid row each cabinet slot sits on, and where each camp is pitched. */
const SLOT_ROWS = [4, 6, 8, 10, 12, 14, 16];
const CAMP_ROWS = [1, 6, 11, 16];
const CABINET_W = 40;
const CABINET_X = 2;
const CAMP_X = 80;

export function Skills() {
  const host = useRef<HTMLElement>(null);
  const { frame, now, reduced } = useFrames(90, { watch: host });
  const [skills, setSkills] = useState<Skill[]>(SEED);
  const [sel, setSel] = useState(0);
  const [note, setNote] = useState<{ text: string; lit: boolean }>({ text: "", lit: false });
  const [dropAt, setDropAt] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const current = skills[Math.min(sel, skills.length - 1)];
  const everyone = current.shared.length === TEAM.length;

  function setShared(list: string[], text: string, lit: boolean) {
    setSkills((all) => all.map((s, i) => (i === sel ? { ...s, shared: list } : s)));
    setNote({ text, lit });
  }

  function upload() {
    if (uploaded) return;
    const mine: Skill = {
      name: "/your-skill",
      ver: "v0.1",
      author: "you",
      desc: "Your own SKILL.md, uploaded from your machine. Private until you share it.",
      shared: [],
    };
    setSkills((all) => [...all, mine]);
    setSel(skills.length);
    setDropAt(Date.now());
    setUploaded(true);
    setNote({ text: "/your-skill is in the library. Only you can use it so far.", lit: false });
  }

  /* The crate's fall is the only thing here measured against the wall clock,
     and it is skipped entirely when motion is reduced — where `now` never
     advances anyway. */
  const scene = useMemo(
    () => paint({ frame, now, reduced, skills, sel, dropAt }),
    [frame, now, reduced, skills, sel, dropAt],
  );
  const phone = useMemo(
    () => paintPhoneTrails({ frame, reduced, skill: current, team: TEAM, shared: current.shared }),
    [frame, reduced, current],
  );

  return (
    <section
      ref={host}
      id="skills"
      aria-label="Skills library"
      className="pt-16 pb-16 sm:pt-24 sm:pb-26"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 sm:px-8">
        <div className="flex max-w-[860px] flex-col gap-4">
          <p className="eyebrow">[ SKILLS LIBRARY ]</p>
          <h2 className="display h2">One library of skills for your whole team.</h2>
          <p className="max-w-[600px] text-[17px] leading-[1.6] text-dim">
            Upload your skills once and manage them from Firetower. Share each one with the
            teammates who need it, and every agent they run picks it up.
          </p>
        </div>

        <div className="flex flex-wrap items-stretch gap-5">
          {/* What the cabinet drawing cannot say on a phone — who this skill
              actually reaches — drawn on its own. */}
          <div className="w-full overflow-hidden border border-line-soft bg-sunk px-4 py-5 [container-type:inline-size] sm:hidden">
            <div
              aria-hidden
              className="ascii relative mx-auto w-[46ch] text-[8px]"
              style={{
                height: `calc(${TRAIL_ROWS} * 1.15em)`,
                fontSize: `min(12px, calc(100cqw / ${TRAIL_COLS * 0.62}))`,
              }}
            >
              <pre style={{ color: "#333338" }}>{phone.s}</pre>
              <pre style={{ color: "#5a5a60" }}>{phone.b}</pre>
              <pre style={{ color: "var(--color-text)" }}>{phone.t}</pre>
              <pre style={{ color: "var(--color-label)" }}>{phone.l}</pre>
              <pre
                style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}
              >
                {phone.a}
              </pre>
              <pre
                style={{
                  color: "var(--color-ember-bright)",
                  textShadow: "0 0 8px rgb(255 210 122 / 0.9)",
                }}
              >
                {phone.p}
              </pre>
            </div>
          </div>

          <div className="hidden min-w-0 flex-[1.6_1_620px] justify-center overflow-hidden border border-line-soft bg-sunk px-5 py-6 [container-type:inline-size] sm:flex">
            <div
              className="ascii relative w-[112ch] text-[7px]"
              style={{ height: "calc(24 * 1.15em)", fontSize: "min(12px, calc(100cqw / 68))" }}
            >
              <pre aria-hidden style={{ color: "#333338" }}>{scene.layers.s}</pre>
              <pre aria-hidden style={{ color: "#5a5a60" }}>{scene.layers.b}</pre>
              <pre aria-hidden style={{ color: "var(--color-text)" }}>{scene.layers.t}</pre>
              <pre aria-hidden style={{ color: "var(--color-label)" }}>{scene.layers.l}</pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-flare)", textShadow: "0 0 6px rgb(255 92 57 / 0.5)" }}
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
                style={{
                  color: "var(--color-ember-bright)",
                  textShadow: "0 0 8px rgb(255 210 122 / 0.9)",
                }}
              >
                {scene.layers.p}
              </pre>

              {skills.map((skill, i) => (
                <button
                  key={skill.name}
                  type="button"
                  aria-label={`Select ${skill.name}`}
                  aria-pressed={i === sel}
                  onClick={() => {
                    setSel(i);
                    setNote({ text: "", lit: false });
                  }}
                  className="absolute m-0 cursor-pointer border-0 bg-transparent p-0"
                  style={{
                    left: "calc(3 * 1ch)",
                    top: `calc(${SLOT_ROWS[i]} * 1.15em - 0.2em)`,
                    width: "calc(38 * 1ch)",
                    height: "calc(1.15em + 0.4em)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] border border-line-soft bg-well p-[26px]">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[24px] font-medium tracking-[-0.02em] text-ember">
                {current.name}
              </p>
              <p className="font-mono text-[12.5px] text-label">{current.ver}</p>
            </div>
            <p className="text-[15px] leading-[1.55] text-text">{current.desc}</p>
            <p className="text-[13.5px] text-soft">
              Uploaded by <span className="text-bone">{current.author}</span>
            </p>

            <div className="flex flex-col gap-2.5 border-t border-line pt-1.5">
              <p className="eyebrow pt-3">SHARED WITH</p>
              <div className="flex flex-wrap gap-2">
                {TEAM.map((person) => {
                  const on = current.shared.includes(person.name);
                  return (
                    <button
                      key={person.name}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setShared(
                          on
                            ? current.shared.filter((n) => n !== person.name)
                            : [...current.shared, person.name],
                          on
                            ? `${current.name} removed from ${person.name}'s agents.`
                            : `${person.name}'s agents can use ${current.name} now.`,
                          !on,
                        )
                      }
                      className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[3px] border px-3 text-[14px] transition-colors"
                      style={{
                        borderColor: on ? "var(--color-ember)" : "var(--color-rim)",
                        background: on ? "rgb(255 178 63 / 0.08)" : "transparent",
                        color: on ? "var(--color-bone)" : "var(--color-soft)",
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: on ? "var(--color-ember)" : "var(--color-faint)",
                          boxShadow: on ? "0 0 8px var(--color-ember)" : "none",
                        }}
                      />
                      {person.name}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  setShared(
                    everyone ? [] : TEAM.map((p) => p.name),
                    everyone
                      ? `${current.name} is private again.`
                      : `Every agent on the team can use ${current.name} now.`,
                    !everyone,
                  )
                }
                className="min-h-10 self-start cursor-pointer rounded-[3px] border border-rim bg-transparent px-3.5 font-mono text-[12.5px] tracking-[0.04em] text-bone transition-colors hover:bg-raise"
              >
                {everyone ? "STOP SHARING WITH EVERYONE" : "SHARE WITH THE WHOLE TEAM"}
              </button>
            </div>

            <p
              aria-live="polite"
              className="min-h-[22px] font-mono text-[12.5px]"
              style={{ color: note.lit ? "var(--color-ember)" : "var(--color-soft)" }}
            >
              {note.text}
            </p>

            <div className="mt-auto flex flex-col gap-2.5 border-t border-line pt-4">
              <button
                type="button"
                onClick={upload}
                aria-disabled={uploaded}
                className="min-h-[46px] cursor-pointer rounded-[3px] border-0 font-mono text-[13.5px] font-semibold tracking-[0.04em]"
                style={{
                  background: uploaded ? "var(--color-raise)" : "var(--color-ember)",
                  color: uploaded ? "var(--color-label)" : "var(--color-ink)",
                }}
              >
                {uploaded ? "SKILL UPLOADED" : "UPLOAD A SKILL"}
              </button>
              <p className="font-mono text-[11px] text-mute">Example skills and teammates.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── one frame ──────────────────────────────────────────────────────────── */

type PaintArgs = {
  frame: number;
  now: number;
  reduced: boolean;
  skills: Skill[];
  sel: number;
  dropAt: number;
};

function paint({ frame, now, reduced, skills, sel, dropAt }: PaintArgs) {
  const canvas = new Canvas(ROWS, COLS);
  const put = (r: number, c: number, s: string, k: string, solid = false) =>
    canvas.text(r, c, s, k, solid);
  const R = rng(reduced ? 3 : frame * 97 + 5);
  const current = skills[Math.min(sel, skills.length - 1)];

  // ── the cabinet: one slot per skill, plus an empty one to upload into ──
  const rule = (l: string, m: string, r: string) => l + repeat(m, CABINET_W - 2) + r;
  put(1, CABINET_X, rule(".", "-", "."), "b");
  put(2, CABINET_X, `|${pad("   S K I L L S   L I B R A R Y", CABINET_W - 2)}|`, "b", true);
  put(3, CABINET_X, rule("|", "=", "|"), "b");

  const dropping = dropAt > 0 && now - dropAt < 1100 && !reduced;
  SLOT_ROWS.forEach((r, i) => {
    put(r, CABINET_X, "|", "b");
    put(r, CABINET_X + CABINET_W - 1, "|", "b");
    if (r < 16) put(r + 1, CABINET_X, rule("|", "-", "|"), "b");
    const skill = skills[i];
    // The newest slot stays empty until the crate lands in it.
    if (skill && !(dropping && i === skills.length - 1)) {
      const on = i === sel;
      const line = `${on ? ">" : " "}[#] ${pad(skill.name, 18)} ${pad(skill.ver, 5)} ${pad(
        `${skill.shared.length}/4`,
        4,
      )}`;
      put(r, CABINET_X + 1, pad(line, CABINET_W - 3), on ? "a" : "t", true);
      if (!on) put(r, CABINET_X + 2, "[#]", "l");
    } else {
      put(r, CABINET_X + 1, pad(" [ ] + upload a skill", CABINET_W - 3), "l", true);
    }
  });
  put(17, CABINET_X, rule("'", "-", "'"), "b");
  put(18, CABINET_X + 2, "||", "b");
  put(18, CABINET_X + CABINET_W - 4, "||", "b");
  for (let x = 0; x < COLS; x++) put(19, x, R() < 0.06 ? "," : "_", "s");

  // ── the crate, winched down into the empty slot after an upload ──
  if (dropping) {
    const k = Math.min(1, (now - dropAt) / 1000);
    const eased = 1 - Math.pow(1 - k, 3);
    const target = SLOT_ROWS[skills.length - 1];
    const y = Math.round(-3 + (target - 1 + 3) * eased);
    for (let r = -1; r < y; r++) put(r, 21, "|", "b");
    put(y, 17, ".-------.", "a");
    put(y + 1, 17, "| SKILL |", "a");
    put(y + 2, 17, "'-------'", "a");
  }

  // ── the camps: a tent, a campfire, and the agent that person runs ──
  TEAM.forEach((person, i) => {
    const r = CAMP_ROWS[i];
    const has = current.shared.includes(person.name);
    const tone = has ? "a" : "t";
    put(r, CAMP_X + 2, "/\\", tone);
    put(r + 1, CAMP_X + 1, "/  \\", tone);
    put(r + 2, CAMP_X, "/_||_\\", tone);
    put(r + 2, CAMP_X - 3, `${"'*,"[Math.floor(R() * 3)]}${R() < 0.5 ? "^" : "*"}`, "e");
    put(r, CAMP_X + 9, person.name, tone);
    put(r + 1, CAMP_X + 9, person.agent, "l");
    const count = skills.filter((s) => s.shared.includes(person.name)).length;
    put(r + 2, CAMP_X + 9, has ? `+ ${current.name}` : `${count} skills`, has ? "a" : "l");
  });

  // ── the trails, one per teammate. A shared one is lit and carries traffic ──
  const fromR = SLOT_ROWS[sel];
  const fromC = CABINET_X + CABINET_W;
  TEAM.forEach((person, i) => {
    const toR = CAMP_ROWS[i] + 1;
    const toC = CAMP_X - 5;
    const has = current.shared.includes(person.name);
    const points: [number, number][] = [];
    for (let c = fromC; c <= 50; c++) points.push([fromR, c]);
    const n = Math.max(toC - 50, Math.abs(toR - fromR) * 2);
    for (let s = 1; s <= n; s++) {
      points.push([Math.round(fromR + ((toR - fromR) * s) / n), Math.round(50 + ((toC - 50) * s) / n)]);
    }
    points.forEach((pt, j) => {
      if (j % 2) return;
      const owner = canvas.keys[pt[0]]?.[pt[1]];
      // Never draw over a label or an already-lit camp.
      if (owner === "t" || owner === "a") return;
      put(pt[0], pt[1], has ? "-" : ".", has ? "a" : "s");
    });
    if (has && !reduced) {
      for (const ph of [0, 0.5]) {
        const at = Math.floor((((frame * 0.9 + i * 7) % points.length) + ph * points.length) % points.length);
        const pt = points[at];
        put(pt[0], pt[1], "*", "p");
      }
    }
  });

  return { layers: canvas.split(KEYS) as Record<(typeof KEYS)[number], string> };
}
