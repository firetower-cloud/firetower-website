"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUp, Bot, Check, ChevronDown, ChevronLeft, ChevronRight, CornerDownLeft, Cpu, ExternalLink,
  FileDiff, FolderTree, GitBranch, GitPullRequest, Globe, LayoutList, ListTodo, Loader2, MessageSquare,
  MessageSquarePlus, Monitor, Paperclip, PanelRight, PanelRightClose, Pencil, Plus, RefreshCw, RotateCw,
  Search, Send, Server, Settings2, Ship, Smartphone, SquareTerminal, Tablet, Ticket, Trash2, X,
  BatteryFull, Inbox, MoreHorizontal, Mic, Signal as SignalBars, User, Wifi,
} from "lucide-react";
import styles from "./Workflow.module.css";

/* ───────────────────────────────────────────────────────────────────────────
   The walkthrough: the Mac app, drawn in markup, doing four things.

   Every screen here is the desktop client's own — `desktop/src/ui` in the
   product repo: the title bar and server strip, the rail with its two-line
   workspace rows, TasksPage, the NewWorkspace sheet, the bring-up list in the
   conversation, the "Waiting on you" card, the preview tab with its notes
   column, the inspector's Commit tab. Same vocabulary, same marks, same
   colours; nothing invented. What is added is motion: a cursor doing what
   you would do, so each step is watched rather than read.

   Each scene is a fixed choreography in CSS keyframes, timed from the moment
   it mounts. `duration` is how long the timeline rail takes to fill and when
   the tour moves on, so the two cannot drift. Picking a step by hand pauses
   the tour on that scene's end state.
   ─────────────────────────────────────────────────────────────────────── */

type Step = { label: string; duration: number };

const steps: Step[] = [
  { label: "Start from your Issues and Linear tickets", duration: 15800 },
  { label: "Your agent runs your worktrees", duration: 10800 },
  { label: "Preview and annotate", duration: 9800 },
  { label: "Commit and open a PR", duration: 9800 },
];

/* Timing helpers: every animated thing reads its moment off a custom property. */
type V = CSSProperties;
const at = (t: number): V => ({ "--t": `${t}s` } as V);
const io = (t: number, out: number): V => ({ "--t": `${t}s`, "--out": `${out}s` } as V);
const sw = (t: number): V => ({ "--sw": `${t}s` } as V);

/** Below 720px the section draws the phone client instead of the Mac one. */
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

export function Workflow() {
  const phone = usePhone();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  // Bumped on every step change so a re-selected scene restarts from zero.
  const [run, setRun] = useState(0);
  const root = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setPlaying(true);
      setRun((r) => r + 1);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Advance when the scene has finished — and only if someone can see it.
  useEffect(() => {
    if (!playing) return;
    const section = root.current;
    const timer = window.setTimeout(() => {
      const box = section?.getBoundingClientRect();
      const onScreen = !!box && box.bottom > 0 && box.top < window.innerHeight;
      if (document.hidden || !onScreen) { setRun((r) => r + 1); return; }
      setWorkspaceOpen(false);
      setActive((value) => (value + 1) % steps.length);
      setRun((r) => r + 1);
    }, steps[active].duration);
    return () => window.clearTimeout(timer);
  }, [playing, active, run]);

  // The Tasks cursor presses Start; the workspace screen then takes over the
  // same tab for the rest of its preparation sequence.
  useEffect(() => {
    if (!playing || active !== 0 || workspaceOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setWorkspaceOpen(true), 2700);
    return () => window.clearTimeout(timer);
  }, [playing, active, run, workspaceOpen]);

  function select(index: number) {
    setPlaying(false);
    setActive(index);
    setWorkspaceOpen(false);
    setRun((r) => r + 1);
  }

  return (
    <section id="workflow" ref={root} className={styles.section} aria-labelledby="workflow-heading" data-playing={playing}>
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">From issue to shipped</p>
          <h2 id="workflow-heading" className="display">Your entire workflow, in one place.</h2>
        </div>
      </div>

      <div className={styles.steps} role="tablist" aria-label="Development workflow">
        {steps.map((s, index) => (
          <button
            key={s.label}
            ref={(node) => { buttons.current[index] = node; }}
            type="button"
            role="tab"
            id={`workflow-tab-${index}`}
            aria-controls="workflow-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            className={styles.step}
            data-state={index < active ? "done" : index === active ? "active" : "todo"}
            style={{ "--duration": `${s.duration}ms` } as V}
            onClick={() => select(index)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === "ArrowRight") next = (index + 1) % steps.length;
              else if (event.key === "ArrowLeft") next = (index + steps.length - 1) % steps.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = steps.length - 1;
              else return;
              event.preventDefault();
              select(next);
              buttons.current[next]?.focus();
            }}
          >
            <span className={styles.stepNo}>0{index + 1}</span>
            <span className={styles.stepLabel}>{s.label}</span>
            <span className={styles.rail} aria-hidden="true"><i key={run} /></span>
          </button>
        ))}
      </div>

      <div id="workflow-panel" role="tabpanel" aria-labelledby={`workflow-tab-${active}`} className={styles.panel}>
        <div className={styles.stage}>
          <div key={`scene-${active}-${run}-${workspaceOpen}-${phone}`} className={styles.window} data-step={active} data-phone={phone || undefined} aria-hidden="true">
            {active === 0 && (workspaceOpen ? (phone ? <PhoneWorkspace /> : <WorkspaceScene />) : (phone ? <PhoneTasks /> : <TasksScene />))}
            {active === 1 && (phone ? <PhoneAgent /> : <AgentScene />)}
            {active === 2 && (phone ? <PhoneRepo tab="diff" /> : <PreviewScene />)}
            {active === 3 && (phone ? <PhoneRepo tab="ship" /> : <ShipScene />)}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p><span className={styles.online} />Runs remotely. Keeps going when you close your laptop.</p>
        <button type="button" onClick={() => { setPlaying(!playing); setRun((r) => r + 1); }} aria-pressed={playing}>
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>{playing ? "Pause" : "Play tour"}
        </button>
      </div>
    </section>
  );
}

/* ── the window: title bar, server strip, rail ──────────────────────────── */

function Chrome({ waiting, rail, children }: { waiting?: V; rail: RailProps; children: ReactNode }) {
  return (
    <>
      <div className={styles.titlebar}>
        <span className={styles.lights}><i /><i /><i /></span>
        <span className={styles.org}><b>acme</b><i>/</i>kevin</span>
        {waiting && <span className={`${styles.waitPill} ${styles.in} ${styles.out}`} style={waiting}>1</span>}
        <span className={styles.cmdk}>⌘K</span>
      </div>
      <div className={styles.body}>
        <div className={styles.strip}>
          <span className={`${styles.stripMark} ${styles.on}`}>⌂</span>
          <i className={styles.stripRule} />
          <span className={styles.stripMark}>AC</span>
        </div>
        <Rail {...rail} />
        <div className={styles.main}>{children}</div>
      </div>
    </>
  );
}

type RailProps = { nav: "tasks" | "dashboard"; dark?: "off" | { at: number } | "on"; darkBeat?: "working" | "blocked" | "done"; blockedAt?: V };

function Rail({ nav, dark = "off", darkBeat = "working", blockedAt }: RailProps) {
  const darkRow = (
    <span className={`${styles.wsRow} ${styles.on}`}>
      <span className={styles.wsLine}>
        <span className={styles.beatStack}>
          <Blocks beat={darkBeat} />
          {blockedAt && <Blocks beat="blocked" className={`${styles.in} ${styles.out}`} style={blockedAt} />}
        </span>
        <b>dark-mode</b><small>1m</small>
      </span>
      <span className={styles.wsLine2}><code>agent/dark-mode</code><AgentMark size={9} /><Monitor size={9} strokeWidth={1.75} /></span>
    </span>
  );
  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav}>
        <span className={`${styles.navItem} ${nav === "dashboard" ? styles.on : ""}`}><LayoutList size={12} strokeWidth={1.75} />Dashboard</span>
        <span className={`${styles.navItem} ${nav === "tasks" ? styles.on : ""}`}><ListTodo size={12} strokeWidth={1.75} />Tasks</span>
      </nav>
      <div className={styles.railHead}><span className={styles.eyebrow}>Workspaces</span><Plus size={11} strokeWidth={2} /></div>
      <div className={styles.repoGroup}>
        <span className={styles.repoName}><GithubMark size={10} />acme/web-app<small>{dark === "off" ? 1 : 2}</small></span>
        {dark === "on" && darkRow}
        {typeof dark === "object" && <span className={styles.in} style={at(dark.at)}>{darkRow}</span>}
        <span className={styles.wsRow}>
          <span className={styles.wsLine}><Blocks beat="working" /><b>invite-link</b><small>2h</small></span>
          <span className={styles.wsLine2}><code>agent/invite-link</code><AgentMark size={9} /><Monitor size={9} strokeWidth={1.75} /></span>
        </span>
      </div>
      <div className={styles.railFoot}>
        <span className={styles.navItem}><Settings2 size={12} strokeWidth={1.75} />Configuration</span>
        <span className={styles.who}><b>kevin</b><small>acme</small></span>
      </div>
    </div>
  );
}

/* ── the workbench: toolbar, tab strip, status bar ──────────────────────── */

function Workbench({ tab, status, uncommitted, right, inspector, children }: {
  tab: "chat" | "preview";
  status: "starting" | "working" | "done";
  uncommitted?: V | number;
  right?: ReactNode;
  inspector?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.workbench}>
      <div className={styles.wbHead}>
        <span className={styles.wbName}>dark-mode<Pencil size={9} strokeWidth={1.75} /></span>
        <span className={`${styles.control} ${styles.wbRepo}`}><GithubMark size={10} /><code>acme/web-app</code></span>
        <span className={styles.wbAgent}><AgentMark size={10} /><Signal status={status} /></span>
        <span className={styles.wbPlus}>+</span>
        <span className={styles.wbTools}>
          <i className={styles.control}><SquareTerminal size={12} strokeWidth={1.75} /></i>
          <i className={styles.control}><Trash2 size={12} strokeWidth={1.75} /></i>
          <i className={styles.control}><Globe size={12} strokeWidth={1.75} /></i>
          <i className={`${styles.control} ${inspector ? styles.on : ""}`}><PanelRight size={12} strokeWidth={1.75} /></i>
        </span>
      </div>
      <div className={styles.wbBody}>
        <div className={styles.wbMain}>
          <div className={styles.tabStrip}>
            <span className={`${styles.tab} ${tab === "chat" ? styles.on : ""}`}><MessageSquare size={11} strokeWidth={1.75} />Conversation</span>
            {tab === "preview" && <span className={`${styles.tab} ${styles.on}`}><Globe size={11} strokeWidth={1.75} /><code>:3000</code></span>}
          </div>
          <div className={styles.pane}>{children}</div>
          <div className={styles.statusBar}>
            <span><GitBranch size={9} strokeWidth={1.75} />agent/dark-mode
              {typeof uncommitted === "number" && <em>· {uncommitted} uncommitted</em>}
              {uncommitted && typeof uncommitted === "object" && <em className={styles.out} style={uncommitted}>· 3 uncommitted</em>}
            </span>
            <span className={styles.statusMachine}><Monitor size={9} strokeWidth={1.75} /><b>Mac mini office · on the machine · 10 cores · 24 GB</b></span>
            {right && <span className={styles.statusRight}>{right}</span>}
          </div>
        </div>
        {inspector}
      </div>
    </div>
  );
}

function Composer({ placeholder, style }: { placeholder: string; style?: V }) {
  return (
    <div className={`${styles.composerWrap} ${styles.in}`} style={style}>
      <div className={styles.composer}>
        <div className={styles.composerText}>{placeholder}</div>
        <div className={styles.composerBar}>
          <i className={styles.control}><Paperclip size={12} strokeWidth={1.75} /></i>
          <span className={styles.control}>Opus 5<ChevronDown size={9} strokeWidth={2} /></span>
          <span className={styles.control}>Default<ChevronDown size={9} strokeWidth={2} /></span>
          <span className={`${styles.control} ${styles.meter}`}><i><b style={{ width: "14%" }} /></i>14%</span>
          <span className={styles.send}><ArrowUp size={12} strokeWidth={2.5} /></span>
        </div>
      </div>
      <div className={styles.keys}><span><kbd>⏎</kbd> send</span><span><kbd>⇧⏎</kbd> new line</span></div>
    </div>
  );
}

/* ── scene 1 · tasks: Start opens the workspace sheet ───────────────────── */

const TASKS = [
  { key: "ENG-142", title: "Add a dark mode toggle", label: "web-app", who: "kevin", when: "2h" },
  { key: "ENG-139", title: "Fix the invite link on mobile", label: "web-app", who: "mara", when: "5h" },
  { key: "ENG-131", title: "Rate-limit the webhook receiver", label: "api", who: "—", when: "1d" },
];

function TasksPage({ start }: { start?: { at: number } }) {
  return (
    <div className={styles.page}>
      <h1 className={`${styles.h1} ${styles.in}`} style={at(0.1)}>12 to pick from.</h1>
      <p className={`${styles.lede} ${styles.in}`} style={at(0.18)}>Read from your trackers as you look. Starting one opens a workspace.</p>
      <div className={`${styles.card} ${styles.in}`} style={at(0.3)}>
        <div className={styles.toolbar}>
          <span className={styles.trackers}><i><GithubMark size={12} /></i><i className={styles.on}><LinearMark size={13} /></i></span>
          <span className={styles.select}>All teams<ChevronDown size={9} strokeWidth={2} /></span>
          <i className={styles.iconBtn}><RotateCw size={10} strokeWidth={1.75} /></i>
        </div>
        <div className={styles.toolbar}>
          <span className={styles.track}><i className={styles.on}>Tickets</i></span>
          <span className={styles.search}><Search size={10} strokeWidth={1.75} />Find a ticket</span>
        </div>
        <div className={styles.colHead}><span>Id</span><span>Title</span><span>Status</span><span>Updated</span><span /></div>
        {TASKS.map((t, i) => (
          <div key={t.key} className={`${styles.taskRow} ${styles.in}`} style={at(0.45 + i * 0.1)}>
            <span className={styles.taskKey}><Ticket size={10} strokeWidth={1.75} /><code>{t.key}</code></span>
            <span className={styles.taskTitle}><b>{t.title}</b><span><i>{t.label}</i><em>{t.who}</em></span></span>
            <span className={styles.badge}>open</span>
            <code className={styles.when}>{t.when}</code>
            <span className={`${styles.control} ${styles.startBtn}`} style={start && i === 0 ? sw(start.at + 1.05) : undefined}>
              {start && i === 0
                ? <span className={styles.swap}><span className={styles.swapA}>Start</span><span className={styles.swapB}>Starting…</span><Pointer at={start.at} from="right" /></span>
                : "Start"}
            </span>
          </div>
        ))}
        <div className={styles.cardFoot}><code>Page 1</code><i className={styles.iconBtn}><ChevronLeft size={10} strokeWidth={1.75} /></i><i className={styles.iconBtn}><ChevronRight size={10} strokeWidth={1.75} /></i></div>
      </div>
    </div>
  );
}

function TasksScene() {
  return (
    <Chrome rail={{ nav: "tasks" }}>
      <TasksPage start={{ at: 1.2 }} />
    </Chrome>
  );
}

/* ── scene 2 · workspace: the sheet, then the bring-up ──────────────────── */

function NewWorkspaceSheet({ style, live }: { style?: V; live?: boolean }) {
  return (
    <div className={`${styles.sheetBackdrop} ${styles.in} ${live ? styles.out : ""}`} style={style}>
      <div className={styles.sheet}>
        <div className={styles.sheetHead}><b>New workspace</b><code>ENG-142</code><X size={11} strokeWidth={1.75} /></div>
        <div className={styles.sheetBody}>
          <label className={styles.field}><span>Name<small>What this branch is for</small></span>
            <span className={`${styles.input} ${live ? styles.focusRing : ""}`} style={live ? at(0.3) : undefined}>{live ? <Typed text="dark-mode" start={0.4} speed={0.06} /> : <i>auth refactor</i>}</span>
          </label>
          <label className={styles.field}><span>Repository<small>Cut from the base</small></span>
            <span className={styles.chips}>
              <span className={styles.repoChip}><GithubMark size={10} /><code>acme/web-app</code><small>from main</small><X size={9} strokeWidth={2} /></span>
              <span className={`${styles.control} ${styles.dashed}`}><Plus size={9} strokeWidth={2} />Add</span>
            </span>
          </label>
          <label className={styles.field}><span>Branch<small>Cut from the base above</small></span>
            <span className={`${styles.input} ${styles.mono}`}><GitBranch size={10} strokeWidth={1.75} /><i>agent/…</i></span>
          </label>
          <label className={styles.field}><span>Where it runs</span>
            <span className={styles.where}>
              <span className={styles.whereRow}>
                <Server size={11} strokeWidth={1.75} />
                <span className={`${styles.select} ${styles.machineSelect}`} style={live ? sw(5.5) : undefined}>
                  {live
                    ? <span className={styles.swap}><span className={`${styles.swapA} ${styles.machineLabel}`}>{MACHINES[0].name}<code>{MACHINES[0].ip}</code></span><span className={`${styles.swapB} ${styles.machineLabel}`}>{MACHINES[1].name}<code>{MACHINES[1].ip}</code></span></span>
                    : <span className={styles.machineLabel}>{MACHINES[1].name}<code>{MACHINES[1].ip}</code></span>}
                  <ChevronDown size={9} strokeWidth={2} />
                  {live && <Pointer at={2.6} from="right" />}
                </span>
                {live && (
                  <span className={`${styles.menu} ${styles.in} ${styles.out}`} style={io(3.7, 5.5)}>
                    {MACHINES.map((m, i) => (
                      <span key={m.name} className={`${styles.menuRow} ${i === 1 ? styles.menuPick : ""}`} style={i === 1 ? ({ "--on": "5.45s" } as V) : undefined}>
                        <Check size={10} strokeWidth={2} className={i === 0 ? styles.menuCheck : styles.menuNoCheck} />
                        <b>{m.name}</b><code>{m.ip}</code>
                        {i === 1 && <Pointer at={4.4} from="left" />}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <span className={styles.chips}>
                <span className={`${styles.control} ${styles.agentChip} ${styles.on}`}><AgentMark size={10} />Claude Code</span>
                <span className={`${styles.control} ${styles.agentChip}`}>Codex</span>
                <span className={`${styles.control} ${styles.agentChip}`}>Kimi Code</span>
              </span>
            </span>
          </label>
          <label className={styles.field}><span>When the machine is busy</span>
            <span className={`${styles.track} ${styles.trackWide}`}><i>Yields</i><i className={styles.on}>Equal share</i><i>Takes more</i></span>
          </label>
        </div>
        <div className={styles.sheetFoot}>
          <span className={styles.machine}><Cpu size={10} strokeWidth={1.75} />{live ? <span className={styles.swap} style={sw(5.5)}><span className={styles.swapA}>{MACHINES[0].name}</span><span className={styles.swapB}>{MACHINES[1].name}</span></span> : MACHINES[1].name}</span>
          <span className={`${styles.control} ${styles.cancel}`}>Cancel</span>
          <span className={`${styles.control} ${styles.startIt}`} style={live ? sw(7.25) : undefined}>
            {live ? <span className={styles.swap}><span className={styles.swapA}>Start it</span><span className={styles.swapB}>Starting…</span><Pointer at={6.2} from="left" /></span> : "Start it"}
            <kbd>⌘⏎</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

const MACHINES = [
  { name: "GCP VM", ip: "34.79.12.180" },
  { name: "Mac mini office", ip: "192.168.1.42" },
  { name: "Mac studio office", ip: "192.168.1.57" },
  { name: "OVH VM", ip: "51.210.8.113" },
];

const BRINGUP = [
  { now: "Fetching the repository", done: "Repository fetched", detail: "1.2 GB", run: 8.2, end: 9.1 },
  { now: "Creating the worktree", done: "Worktree created", detail: "agent/dark-mode", run: 9.1, end: 9.6 },
  { now: "Making the workspace", done: "Workspace made", detail: "", run: 9.6, end: 10.0 },
  { now: "Running setup", done: "Setup finished", detail: "8s", run: 10.0, end: 11.0 },
  { now: "Starting the agent", done: "Agent ready", detail: "tmux 0:agent", run: 11.0, end: 11.7 },
];

function WorkspaceScene() {
  return (
    <Chrome rail={{ nav: "tasks", dark: { at: 8.1 }, darkBeat: "working" }}>
      <div className={styles.screens}>
        <div className={styles.out} style={{ "--out": "7.9s" } as V}><TasksPage /></div>
        <NewWorkspaceSheet live style={{ "--t": "0s", "--out": "7.85s" } as V} />
        <div className={styles.in} style={at(7.95)}>
          <Workbench tab="chat" status="starting">
            <div className={styles.chat}>
              <div className={styles.stack}>
                <ol className={`${styles.bringUp} ${styles.out}`} style={{ "--out": "12.0s" } as V}>
                  {BRINGUP.map((s) => (
                    <li key={s.now} className={styles.bstep} style={{ "--run": `${s.run}s`, "--done": `${s.end}s` } as V}>
                      <i className={styles.bdot} />
                      <span className={styles.swap}><span className={styles.bnow}>{s.now}</span><span className={styles.bpast}>{s.done}</span></span>
                      {s.detail && <code className={styles.bdetail}>{s.detail}</code>}
                    </li>
                  ))}
                </ol>
                <span className={`${styles.ready} ${styles.in}`} style={at(12.1)}><Check size={11} strokeWidth={2} /><b>Workspace ready</b><small>5 steps</small><ChevronRight size={11} strokeWidth={2} /></span>
              </div>
              <i className={styles.spacer} />
            </div>
            <Composer placeholder="Say something to the agent" style={at(0)} />
          </Workbench>
        </div>
      </div>
    </Chrome>
  );
}

/* ── scene 3 · agent: the reply, then it needs you ──────────────────────── */

/** What the agent touches, in the order it touches it. The counts add up to the Ship step's +42 −2. */
const AGENT_FILES = [
  { name: "ThemeToggle.tsx", dir: "src/theme", added: 28, removed: 2, at: 2.5 },
  { name: "Appearance.tsx", dir: "src/settings", added: 9, removed: 0, at: 3.1 },
  { name: "preference.ts", dir: "src/theme", added: 5, removed: 0, at: 3.6 },
];

/* Short enough to fit the panel: code scrolls in the app, and a mock nobody can scroll should not look cut. */
const DIFF: [string, string][] = [
  ["hunk", "@@ -12,7 +12,29 @@"],
  ["ctx", "  const theme = useTheme();"],
  ["del", "  <button onClick={toggle}>"],
  ["add", "  const [choice, setChoice] ="],
  ["add", "    usePreference(\"theme\");"],
  ["add", "  return ("],
  ["add", "    <div role=\"radiogroup\">"],
];

function AgentScene() {
  const inspector = (
    <div className={styles.inspector}>
      <div className={styles.inspectorHead}>
        <span className={styles.track}>
          <i className={styles.on}><FileDiff size={10} strokeWidth={1.75} />Diff
            <code className={styles.stack}>
              <span className={`${styles.countTmp} ${styles.in} ${styles.out}`} style={io(2.5, 3.1)}>1</span>
              <span className={`${styles.countTmp} ${styles.in} ${styles.out}`} style={io(3.1, 3.6)}>2</span>
              <span className={styles.in} style={at(3.6)}>3</span>
            </code>
          </i>
          <i><FolderTree size={10} strokeWidth={1.75} />Files</i>
          <i><Ship size={10} strokeWidth={1.75} />Commit</i>
        </span>
        <i className={styles.iconBtn}><PanelRightClose size={11} strokeWidth={1.75} /></i>
      </div>
      <div className={styles.diffList}>
        <div className={`${styles.diffEmpty} ${styles.out}`} style={{ "--out": "2.45s" } as V}><p>Nothing changed yet.</p><small>Edits the agent makes will show up here.</small></div>
        {AGENT_FILES.map((f, i) => (
          <div key={f.name} className={styles.in} style={at(f.at)}>
            <span className={styles.diffFile}>
              <ChevronRight size={10} strokeWidth={1.75} className={i === 0 ? styles.open : undefined} />
              <span><b><i>●</i>{f.name}</b><code>{f.dir}</code></span>
              <code className={styles.counts}><em>+{f.added}</em> <s>−{f.removed}</s></code>
            </span>
            {i === 0 && (
              <div className={styles.diffLines}>
                {DIFF.map(([kind, text], j) => (
                  <div key={j} data-kind={kind} className={styles.in} style={at(f.at + 0.15 + j * 0.09)}><i>{kind === "add" ? "+" : kind === "del" ? "−" : " "}</i><span>{text}</span></div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Chrome waiting={io(6.2, 9.3)} rail={{ nav: "dashboard", dark: "on", darkBeat: "working", blockedAt: io(6.2, 9.3) }}>
      <Workbench tab="chat" status="working" uncommitted={3} right="1.2 cores · 640 MB" inspector={inspector}>
        <div className={styles.chat}>
          <span className={`${styles.ready} ${styles.in}`} style={at(0.05)}><Check size={11} strokeWidth={2} /><b>Workspace ready</b><small>5 steps</small><ChevronRight size={11} strokeWidth={2} /></span>
          <div className={`${styles.you} ${styles.in}`} style={at(0.4)}><div>Add a dark mode toggle to settings. Remember the user’s preference.</div></div>
          <p className={`${styles.working} ${styles.in} ${styles.out}`} style={io(0.9, 1.5)}><span className={styles.sheen}>Reading files</span></p>
          <ol className={styles.tools}>
            <li className={`${styles.tool} ${styles.in}`} style={at(1.4)}><FolderTree size={10} strokeWidth={1.75} /><b>read</b><span>src/settings/Appearance.tsx</span></li>
            <li className={`${styles.tool} ${styles.in}`} style={at(1.9)}><FolderTree size={10} strokeWidth={1.75} /><b>read</b><span>src/theme/index.ts</span></li>
            <li className={`${styles.tool} ${styles.in}`} style={at(2.5)}><Pencil size={10} strokeWidth={1.75} /><b>changed</b><span className={styles.link}>src/theme/ThemeToggle.tsx</span><code><em>+28</em> <s>−2</s></code></li>
            <li className={`${styles.tool} ${styles.in}`} style={at(3.1)}><Pencil size={10} strokeWidth={1.75} /><b>changed</b><span className={styles.link}>src/settings/Appearance.tsx</span><code><em>+9</em> <s>−0</s></code></li>
            <li className={`${styles.tool} ${styles.in}`} style={at(3.6)}><Pencil size={10} strokeWidth={1.75} /><b>changed</b><span className={styles.link}>src/theme/preference.ts</span><code><em>+5</em> <s>−0</s></code></li>
            <li className={`${styles.tool} ${styles.in}`} style={at(3.85)}><SquareTerminal size={10} strokeWidth={1.75} /><b>ran</b><span>pnpm test -- theme</span></li>
          </ol>
          <p className={`${styles.working} ${styles.in} ${styles.out}`} style={io(2.4, 3.95)}><span className={styles.sheen}>Editing files</span></p>
          <p className={`${styles.said} ${styles.in}`} style={at(3.95)}><Stream text="I’ve added the toggle under Settings › Appearance and it remembers the choice across reloads. One thing to decide before I wire the default:" start={4.0} speed={0.07} /></p>

          <div className={`${styles.waiting} ${styles.in} ${styles.out}`} style={io(6.2, 9.3)}>
            <div className={styles.waitingHead}><i /><span>Waiting on you</span></div>
            <p className={styles.question}>Should the theme follow the system by default?</p>
            <div className={styles.options}>
              <span className={`${styles.option} ${styles.chosen}`} style={{ "--on": "8.1s", "--sw": "8.1s" } as V}>
                <span className={`${styles.letter} ${styles.swap}`}><span className={styles.swapA}>Y</span><span className={styles.swapB}><Check size={9} strokeWidth={3} /></span></span>
                <span><b>Yes, follow the system</b><small>Switches with macOS until they choose.</small></span>
                <Pointer at={7.0} from="left" />
              </span>
              <span className={styles.option}><span className={styles.letter}>N</span><span><b>No, start in light</b><small>Stays light until they pick dark.</small></span></span>
            </div>
            <span className={styles.answerInput}>Or answer in your own words</span>
            <div className={styles.waitingFoot}><span className={`${styles.control} ${styles.answerBtn}`} style={{ "--press": "8.9s" } as V}>Answer</span></div>
          </div>
          <p className={`${styles.answered} ${styles.in}`} style={at(9.45)}><Check size={10} strokeWidth={2} />Answered — Yes, follow the system</p>
          <p className={`${styles.working} ${styles.in}`} style={at(9.8)}><span className={styles.sheen}>Editing files</span></p>
          <i className={styles.spacer} />
        </div>
        <Composer placeholder="Answer above, or say something else" style={at(0.2)} />
      </Workbench>
    </Chrome>
  );
}

/* ── scene 4 · preview: annotate the running app ────────────────────────── */

function PreviewScene() {
  return (
    <Chrome rail={{ nav: "dashboard", dark: "on", darkBeat: "working" }}>
      <Workbench tab="preview" status="working" uncommitted={3} right="0.8 cores · 512 MB">
        <div className={styles.previewHead}>
          <i className={styles.iconBtn}><ChevronLeft size={11} strokeWidth={1.75} /></i>
          <i className={styles.iconBtn}><ChevronRight size={11} strokeWidth={1.75} /></i>
          <i className={styles.iconBtn}><RotateCw size={10} strokeWidth={1.75} /></i>
          <span className={styles.address}><b>:3000</b>/settings</span>
          <span className={styles.track}><i className={styles.on}><Monitor size={10} strokeWidth={1.75} /></i><i><Tablet size={10} strokeWidth={1.75} /></i><i><Smartphone size={10} strokeWidth={1.75} /></i></span>
          <span className={`${styles.control} ${styles.annotateBtn}`} style={sw(1.95)}>
            <span className={styles.swap}><span className={styles.swapA}>Annotate</span><span className={styles.swapB}>Annotating</span></span>
            <Pointer at={0.9} from="left" />
          </span>
          <i className={styles.iconBtn}><ExternalLink size={10} strokeWidth={1.75} /></i>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.frame}>
            <div className={styles.site}>
              <header className={styles.siteNav}>
                <span className={styles.siteLogo}><i />acme</span>
                <nav><span>Overview</span><span>Projects</span><span className={styles.siteNavOn}>Settings</span></nav>
                <span className={styles.siteAvatar}>K</span>
              </header>
              <div className={styles.siteBody}>
                <aside className={styles.siteSide}>
                  <b>Settings</b>
                  <span>General</span><span className={styles.siteSideOn}>Appearance</span><span>Members</span><span>Billing</span><span>Integrations</span>
                </aside>
                <main className={styles.siteMain}>
                  <h4>Appearance</h4>
                  <p>Choose how the app looks on your device.</p>
                  <div className={styles.siteCard}>
                    <div className={styles.siteRow}>
                      <div><b>Theme</b><small>Follow the system, or pick one.</small></div>
                  <div className={styles.segWrap}>
                    <div className={styles.seg}>
                      <span>Light</span><span>Dark</span>
                      <span className={`${styles.segOn} ${styles.picked}`} style={{ "--pick": "3.5s" } as V}>
                        System
                        <Pointer at={2.4} from="right" />
                        <i className={`${styles.pin} ${styles.in}`} style={at(6.0)}>1</i>
                        <div className={`${styles.annotate} ${styles.in} ${styles.out}`} style={io(3.7, 5.9)}>
                          <div className={styles.annotateHead}><MessageSquarePlus size={10} strokeWidth={1.75} /><span>Note on &lt;button&gt; System · /settings</span></div>
                          <code className={styles.quote}>&lt;button class=&quot;seg on&quot;&gt;System&lt;/button&gt;</code>
                          <div className={styles.annotateFoot}>
                            <span className={styles.annotateText}><Typed text="Show which theme is selected more clearly." start={4.0} speed={0.032} /></span>
                            <span className={styles.keep} style={{ "--press": "5.6s" } as V}><CornerDownLeft size={10} strokeWidth={2.5} /></span>
                          </div>
                        </div>
                      </span>
                    </div>
                  </div>
                    </div>
                    <div className={styles.siteRow}>
                      <div><b>Accent</b><small>Used for links and buttons.</small></div>
                      <span className={styles.swatches}><i style={{ background: "#2563eb" }} className={styles.swatchOn} /><i style={{ background: "#7c3aed" }} /><i style={{ background: "#059669" }} /><i style={{ background: "#d97706" }} /></span>
                    </div>
                    <div className={styles.siteRow}>
                      <div><b>Reduce motion</b><small>Fewer animations across the app.</small></div>
                      <span className={styles.toggle}><i /></span>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
          <div className={styles.notes}>
            <div className={styles.notesHead}>Notes on :3000<code className={styles.in} style={at(6.0)}>1</code></div>
            <p className={`${styles.notesEmpty} ${styles.out}`} style={{ "--out": "5.9s" } as V}>Press Annotate, then click anything in the page.</p>
            <div className={`${styles.note} ${styles.in}`} style={at(6.0)}>
              <span className={styles.noteHead}><i className={`${styles.noteNo} ${styles.swap}`} style={sw(7.9)}><span className={styles.swapA}>1</span><span className={styles.swapB}>1</span></i><code>&lt;button&gt; System</code></span>
              <p>Show which theme is selected more clearly.</p>
              <small className={styles.swap} style={sw(7.9)}><span className={styles.swapA}>draft</span><span className={styles.swapB}>sent · now</span></small>
            </div>
            <div className={`${styles.notesFoot} ${styles.in}`} style={at(6.1)}>
              <span className={styles.control}><Bot size={10} strokeWidth={1.75} />Another agent…</span>
              <span className={`${styles.control} ${styles.sendNotes} ${styles.out}`} style={{ "--sw": "7.25s", "--press": "7.2s", "--out": "7.95s" } as V}>
                <span className={styles.swap}><span className={styles.swapA}><Send size={9} strokeWidth={2} />Send 1 note to the agent</span><span className={styles.swapB}>Sending…</span></span>
                <Pointer at={6.15} from="right" />
              </span>
            </div>
          </div>
        </div>
      </Workbench>
    </Chrome>
  );
}

/* ── scene 5 · ship: commit, push, open the pull request ────────────────── */

const FILES = ["src/theme/ThemeToggle.tsx", "src/settings/Appearance.tsx", "src/theme/preference.ts"];

function ShipScene() {
  const inspector = (
    <div className={styles.inspector}>
      <div className={styles.inspectorHead}>
        <span className={styles.track}><i><FileDiff size={10} strokeWidth={1.75} />Diff<code>3</code></i><i><FolderTree size={10} strokeWidth={1.75} />Files</i><i className={styles.on}><Ship size={10} strokeWidth={1.75} />Commit</i></span>
        <i className={styles.iconBtn}><PanelRightClose size={11} strokeWidth={1.75} /></i>
      </div>
      <div className={`${styles.ship} ${styles.in}`} style={at(0.3)}>
        <code className={styles.branchLine}><GitBranch size={10} strokeWidth={1.75} /><b>agent/dark-mode</b>→ main</code>
        <div className={styles.shipRow}>
          <span className={`${styles.input} ${styles.swap}`} style={sw(1.6)}>
            <i className={`${styles.swapA} ${styles.describing}`}><Loader2 size={9} strokeWidth={2} className={styles.spin} />Describing the change…</i>
            <span className={styles.swapB}><Typed text="Add a theme toggle that follows the system" start={1.7} speed={0.03} /></span>
          </span>
          <i className={styles.iconBtn}><RefreshCw size={9} strokeWidth={1.75} /></i>
        </div>
        <p className={`${styles.textarea} ${styles.in}`} style={at(1.7)}>Adds a Light / Dark / System control under Appearance, persists the choice, and defaults to the system theme.</p>
        <div className={`${styles.out}`} style={{ "--out": "8.15s" } as V}>
          <div className={styles.filesHead}><span>3 of 3 files</span><code><em>+42</em> <s>−2</s></code></div>
          <div className={styles.files}>
            {FILES.map((f, i) => <span key={f} className={`${styles.fileRow} ${styles.in}`} style={at(2.2 + i * 0.1)}><i className={styles.tick}><Check size={8} strokeWidth={3} /></i><code>{f}</code></span>)}
          </div>
          <div className={styles.refs}><code>Closes ENG-142<X size={8} strokeWidth={2} /></code><span>+ #issue</span></div>
          <span className={styles.draftRow}><i />Open as a draft</span>
        </div>
        <div className={styles.stack}>
          <span className={`${styles.control} ${styles.shipBtn} ${styles.out}`} style={{ "--out": "8.1s", "--press": "4.65s" } as V}>
            <span className={styles.stack}>
              <span className={`${styles.out}`} style={{ "--out": "4.7s" } as V}>Commit &amp; open PR</span>
              <span className={`${styles.busy} ${styles.in} ${styles.out}`} style={io(4.75, 5.9)}><Loader2 size={10} strokeWidth={2} className={styles.spin} />Committing 3 files</span>
              <span className={`${styles.busy} ${styles.in} ${styles.out}`} style={io(5.95, 7.0)}><Loader2 size={10} strokeWidth={2} className={styles.spin} />Pushing agent/dark-mode</span>
              <span className={`${styles.busy} ${styles.in}`} style={at(7.05)}><Loader2 size={10} strokeWidth={2} className={styles.spin} />Opening the pull request</span>
            </span>
            <Pointer at={3.6} from="left" />
          </span>
          <div className={`${styles.prOpen} ${styles.in}`} style={at(8.25)}>
            <p><GitPullRequest size={11} strokeWidth={1.75} />The pull request is open.</p>
            <span className={styles.control}>Open it on GitHub</span>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <Chrome rail={{ nav: "dashboard", dark: "on", darkBeat: "done" }}>
      <Workbench tab="chat" status="done" uncommitted={{ "--out": "5.9s" } as V} inspector={inspector}>
        <div className={`${styles.chat} ${styles.chatNarrow}`}>
          <ol className={styles.tools}>
            <li className={styles.tool}><ChevronRight size={10} strokeWidth={1.75} /><b>changed</b><span>3 files</span></li>
          </ol>
          <p className={styles.said}>Done. The toggle lives in Settings › Appearance, follows the system by default and remembers a manual choice. Tests pass.</p>
          <i className={styles.spacer} />
        </div>
        <Composer placeholder="Say something to the agent" style={at(0.1)} />
      </Workbench>
    </Chrome>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   The phone client (`mobile/app`): three tabs and a stack, the inbox as the
   dashboard, the repository as a page. Same vocabulary, drawn at 390pt.
   ═══════════════════════════════════════════════════════════════════════ */

/** The device: status bar, a screen, the home indicator; a tab bar on tab screens. */
function Phone({ tab, children }: { tab?: "inbox" | "tasks" | "you"; children: ReactNode }) {
  return (
    <div className={styles.phone}>
      <div className={styles.ios}>
        <b>9:41</b>
        <span><SignalBars size={13} strokeWidth={2} /><Wifi size={13} strokeWidth={2} /><BatteryFull size={16} strokeWidth={1.75} /></span>
      </div>
      <div className={styles.pScreen}>{children}</div>
      {tab && (
        <div className={styles.pTabs}>
          <span className={tab === "inbox" ? styles.on : ""}><Inbox size={20} strokeWidth={1.75} />Inbox</span>
          <span className={tab === "tasks" ? styles.on : ""}><ListTodo size={20} strokeWidth={1.75} />Tasks</span>
          <span className={tab === "you" ? styles.on : ""}><User size={20} strokeWidth={1.75} />You</span>
        </div>
      )}
      <i className={styles.home} />
    </div>
  );
}

/** A finger, where a Mac has a cursor: a touch ring at the moment of the press. */
function Tap({ at: t }: { at: number }) {
  return <i className={styles.tap} style={{ "--at": `${t}s` } as V} />;
}

function Seg({ options, on }: { options: string[]; on: string }) {
  return <span className={styles.pSeg}>{options.map((o) => <i key={o} className={o === on ? styles.on : ""}>{o}</i>)}</span>;
}

/* ── tasks ──────────────────────────────────────────────────────────────── */

function PhoneTasks() {
  return (
    <Phone tab="tasks">
      <div className={styles.pPage}>
        <h1 className={styles.pDisplay}>Tasks</h1>
        <p className={styles.pSub}>12 to pick from. Starting one opens a workspace.</p>
        <div className={styles.pTrackers}><span><GithubMark size={12} />GitHub</span><span className={styles.on}><LinearMark size={12} />Linear</span></div>
        <Seg options={["Tickets"]} on="Tickets" />
        <div className={styles.pRow2}><Seg options={["Open", "Closed"]} on="Open" /><span className={styles.pMine}>Mine</span></div>
        <span className={styles.pSearch}>Search</span>
        {TASKS.map((t, i) => (
          <div key={t.key} className={`${styles.pTask} ${styles.in} ${i === 0 ? styles.pTaskPress : ""}`} style={{ "--t": `${0.3 + i * 0.1}s`, "--on": "2.25s" } as V}>
            <Ticket size={16} strokeWidth={1.75} />
            <span><b>{t.title}</b><small><code>{t.key}</code><code>acme/{t.label}</code>{t.when}</small></span>
            {i === 0 && <Tap at={1.2} />}
          </div>
        ))}
      </div>
    </Phone>
  );
}

/* ── new workspace, then the workspace coming up ────────────────────────── */

function PhoneWorkspace() {
  return (
    <Phone>
      <div className={styles.screens}>
        <div className={`${styles.pStack} ${styles.out}`} style={{ "--out": "7.85s" } as V}>
          <div className={styles.pHead}><ChevronLeft size={22} strokeWidth={1.75} /><b>New workspace</b><i /></div>
          <div className={styles.pForm}>
            <label><span>Name<small>What this branch is for</small></span><span className={`${styles.pInput} ${styles.focusRing}`} style={at(0.3)}><Typed text="dark-mode" start={0.4} speed={0.06} /></span></label>
            <label><span>Repositories<small>One or more</small></span>
              <span className={styles.pRepo}><code>acme/web-app</code><small><GitBranch size={11} strokeWidth={1.75} />main</small></span>
            </label>
            <label><span>Branch<small>Cut from the base above</small></span><span className={`${styles.pInput} ${styles.pMono}`}><i>agent/…</i></span></label>
            <label><span>Where it runs</span>
              <span className={styles.pTrigger} style={sw(5.5)}>
                <span className={styles.swap}><span className={styles.swapA}>{MACHINES[0].name}</span><span className={styles.swapB}>{MACHINES[1].name}</span></span>
                <ChevronDown size={15} strokeWidth={2} /><Tap at={2.6} />
              </span>
              <span className={styles.pTrigger}><AgentMark size={12} />Claude Code<ChevronDown size={15} strokeWidth={2} /></span>
            </label>
            <label><span>When the machine is busy</span><Seg options={["Yields", "Equal share", "Takes more"]} on="Equal share" /></label>
          </div>
          <div className={styles.pFoot}>
            <span className={styles.pPrimary} style={sw(7.25)}><span className={styles.swap}><span className={styles.swapA}>Start the workspace</span><span className={styles.swapB}>Starting…</span></span><Tap at={6.2} /></span>
          </div>
          {/* The picker: a sheet from the bottom, the whole thing following the finger. */}
          <div className={`${styles.pScrim} ${styles.in} ${styles.out}`} style={io(3.7, 5.5)} />
          <div className={`${styles.pSheet} ${styles.in} ${styles.out}`} style={io(3.7, 5.5)}>
            <i className={styles.pGrabber} />
            <span className={styles.pEyebrow}>Where it runs</span>
            {MACHINES.map((m, i) => (
              <span key={m.name} className={`${styles.pChoice} ${i === 1 ? styles.pChoicePress : ""}`} style={i === 1 ? ({ "--on": "5.45s", "--sw": "5.45s" } as V) : ({ "--sw": "5.45s" } as V)}>
                <span><b>{m.name}</b><small>{m.ip}</small></span>
                {i === 0 && <Check size={17} strokeWidth={2} className={`${styles.pCheck} ${styles.swapA}`} />}
                {i === 1 && <Check size={17} strokeWidth={2} className={`${styles.pCheck} ${styles.swapB}`} />}
                {i === 1 && <Tap at={4.4} />}
              </span>
            ))}
          </div>
        </div>
        <div className={`${styles.pStack} ${styles.in}`} style={at(7.95)}>
          <PhoneWorkspaceHead status="starting" label="Starting" />
          <div className={styles.pStrip}><FileDiff size={14} strokeWidth={1.75} /><span>Files and commits</span><i /><small>Nothing to commit</small><ChevronRight size={14} strokeWidth={1.75} /></div>
          <div className={styles.pChat}>
            <code className={styles.pBranch}>agent/dark-mode</code>
            <ol className={styles.pBringUp}>
              {BRINGUP.map((s) => (
                <li key={s.now} className={styles.bstep} style={{ "--run": `${s.run}s`, "--done": `${s.end}s` } as V}>
                  <i className={styles.bdot} />
                  <span><span className={styles.swap}><span className={styles.bnow}>{s.now}</span><span className={styles.bpast}>{s.done}</span></span>{s.detail && <code className={styles.bdetail}>{s.detail}</code>}</span>
                </li>
              ))}
            </ol>
            <i className={styles.spacer} />
          </div>
          <PhoneComposer />
        </div>
      </div>
    </Phone>
  );
}

function PhoneWorkspaceHead({ status, label }: { status: "starting" | "working" | "done"; label: string }) {
  return (
    <div className={styles.pHead}>
      <ChevronLeft size={22} strokeWidth={1.75} />
      <span className={styles.pHeadTitle}><b>dark-mode</b><small><Signal status={status} />{label}<i>·</i>now<AgentMark size={11} /></small></span>
      <MoreHorizontal size={20} strokeWidth={1.75} />
    </div>
  );
}

/** At rest, a pill: the placeholder, a +, and the microphone. */
function PhoneComposer({ placeholder = "Say something to the agent" }: { placeholder?: string }) {
  return (
    <div className={styles.pComposer}>
      <span className={styles.pPlus}><Plus size={22} strokeWidth={1.75} /></span>
      <span className={styles.pPill}>{placeholder}</span>
      <span className={styles.pMic}><Mic size={19} strokeWidth={1.75} /></span>
    </div>
  );
}

/* ── the conversation ───────────────────────────────────────────────────── */

function PhoneAgent() {
  return (
    <Phone>
      <div className={styles.pStack}>
        <PhoneWorkspaceHead status="working" label="Working" />
        <div className={styles.pStrip}>
          <FileDiff size={14} strokeWidth={1.75} />
          <span className={styles.stack}>
            <span className={styles.out} style={{ "--out": "2.5s" } as V}>Files and commits</span>
            {AGENT_FILES.map((f, i) => {
              const added = AGENT_FILES.slice(0, i + 1).reduce((n, x) => n + x.added, 0), removed = AGENT_FILES.slice(0, i + 1).reduce((n, x) => n + x.removed, 0);
              const next = AGENT_FILES[i + 1];
              return <span key={f.name} className={`${styles.pStripCount} ${styles.in} ${next ? styles.out : ""}`} style={{ "--t": `${f.at}s`, "--out": next ? `${next.at}s` : undefined } as V}>{i + 1} {i === 0 ? "file" : "files"}<em>+{added}</em><s>−{removed}</s></span>;
            })}
          </span>
          <i />
          <small className={styles.stack}><span className={styles.out} style={{ "--out": "2.5s" } as V}>Nothing to commit</span><span className={styles.in} style={at(2.5)}>Commit &amp; open PR</span></small>
          <ChevronRight size={14} strokeWidth={1.75} />
        </div>
        <div className={styles.pChat}>
          <code className={styles.pBranch}>agent/dark-mode</code>
          <div className={`${styles.pYou} ${styles.in}`} style={at(0.4)}><div>Add a dark mode toggle to settings. Remember the user’s preference.</div></div>
          <p className={`${styles.pSheen} ${styles.in} ${styles.out}`} style={io(0.9, 1.5)}><span className={styles.sheen}>Working</span></p>
          <ol className={styles.pRail}>
            <li className={styles.in} style={at(1.4)}><b>read</b><span>src/settings/Appearance.tsx</span></li>
            <li className={styles.in} style={at(1.9)}><b>read</b><span>src/theme/index.ts</span></li>
            <li className={styles.in} style={at(2.5)}><b>changed</b><span>src/theme/ThemeToggle.tsx</span><code><em>+28</em> <s>−2</s></code></li>
            <li className={styles.in} style={at(3.1)}><b>changed</b><span>src/settings/Appearance.tsx</span><code><em>+9</em> <s>−0</s></code></li>
            <li className={styles.in} style={at(3.6)}><b>changed</b><span>src/theme/preference.ts</span><code><em>+5</em> <s>−0</s></code></li>
          </ol>
          <p className={`${styles.pSaid} ${styles.in}`} style={at(3.95)}><Stream text="I’ve added the toggle under Settings › Appearance and it remembers the choice across reloads. I’d like to run the theme tests before handing it back." start={4.0} speed={0.07} /></p>
          <ol className={styles.pRail}><li className={styles.in} style={at(8.8)}><b>ran</b><span>pnpm test -- theme</span></li></ol>
          <p className={`${styles.pSheen} ${styles.in}`} style={at(9.0)}><span className={styles.sheen}>Working</span></p>
          <i className={styles.spacer} />
        </div>
        {/* The one loud thing, above the composer: the agent is stopped until you answer. */}
        <div className={`${styles.pApproval} ${styles.in} ${styles.out}`} style={io(6.2, 8.4)}>
          <span className={styles.pEyebrowEmber}>Wants to run a command</span>
          <b>pnpm test -- theme</b>
          <div><span className={styles.pNo}>No</span><span className={styles.pAllow} style={{ "--press": "8.05s" } as V}>Allow<Tap at={7.0} /></span></div>
        </div>
        <PhoneComposer placeholder="Answer the agent" />
      </div>
    </Phone>
  );
}

/* ── the repository: Diff, or Commit ────────────────────────────────────── */

function PhoneRepo({ tab }: { tab: "diff" | "ship" }) {
  return (
    <Phone>
      <div className={styles.pStack}>
        <div className={styles.pHead}>
          <ChevronLeft size={22} strokeWidth={1.75} />
          <span className={styles.pHeadTitle}><b>dark-mode</b><small>3 files<em>+42</em><s>−2</s></small></span>
          <i />
        </div>
        <div className={styles.pSegWrap}><Seg options={["Diff", "Files", "Commit"]} on={tab === "diff" ? "Diff" : "Commit"} /></div>
        {tab === "diff" ? (
          <div className={styles.pDiff}>
            {AGENT_FILES.map((f, i) => (
              <div key={f.name} className={styles.in} style={at(0.3 + i * 0.12)}>
                <span className={styles.pDiffFile}><i>●</i><span><b>{f.name}</b><code>{f.dir}</code></span><em>+{f.added}</em><s>−{f.removed}</s></span>
                {i === 0 && (
                  <div className={styles.pDiffLines}>
                    {DIFF.map(([kind, text], j) => (
                      <div key={j} data-kind={kind} className={styles.in} style={at(0.6 + j * 0.1)}><code>{kind === "hunk" ? "" : 12 + j}</code><span>{kind === "add" ? "+" : kind === "del" ? "−" : " "}{text}</span></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={`${styles.pShip} ${styles.in}`} style={at(0.3)}>
              <code className={styles.pBranchLine}><GitBranch size={13} strokeWidth={1.75} /><b>agent/dark-mode</b>→ main</code>
              <span className={styles.pEyebrow}>Title</span>
              <span className={`${styles.pField} ${styles.swap}`} style={sw(1.6)}>
                <i className={`${styles.swapA} ${styles.describing}`}><Loader2 size={12} strokeWidth={2} className={styles.spin} />Describing the change…</i>
                <span className={styles.swapB}><Typed text="Add a theme toggle that follows the system" start={1.7} speed={0.03} /></span>
              </span>
              <span className={styles.pEyebrow}>Body</span>
              <p className={`${styles.pField} ${styles.pBody} ${styles.in}`} style={at(1.7)}>Adds a Light / Dark / System control under Appearance, persists the choice, and defaults to the system theme.</p>
              <div className={`${styles.pOpen} ${styles.in}`} style={at(8.25)}><span className={styles.pEyebrow}>Open</span><code>github.com/acme/web-app/pull/512</code></div>
              <i className={styles.spacer} />
            </div>
            <div className={styles.pFoot}>
              <span className={`${styles.pPrimary} ${styles.out}`} style={{ "--out": "8.1s", "--press": "4.65s" } as V}>Commit &amp; open PR<Tap at={3.6} /></span>
              <small className={styles.pBusy}>
                <span className={`${styles.in} ${styles.out}`} style={io(4.7, 5.9)}>Committing…</span>
                <span className={`${styles.in} ${styles.out}`} style={io(5.95, 7.0)}>Pushing…</span>
                <span className={`${styles.in} ${styles.out}`} style={io(7.05, 8.1)}>Opening the pull request…</span>
                <span className={styles.in} style={at(8.25)}>The pull request is open.</span>
              </small>
            </div>
          </>
        )}
      </div>
    </Phone>
  );
}

/* ── the app's own marks ────────────────────────────────────────────────── */

/** Which agent, as a shape rather than a word — Anthropic's mark, as the app draws it. */
function AgentMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={styles.mark}>
      <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
    </svg>
  );
}

function GithubMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={styles.mark}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function LinearMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={styles.mark}>
      <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18Z" />
      <path d="M1.5 6.132a11.943 11.943 0 0 0-1.29 3.6l14.897 14.896a11.944 11.944 0 0 0 3.598-1.29L1.5 6.132Z" />
      <path d="M.007 12.998a11.962 11.962 0 0 0 .714 3.58l6.701 6.701a11.963 11.963 0 0 0 3.58.714L.007 12.998Z" />
      <path d="M3.37 23.679.32 20.63a12.014 12.014 0 0 0 3.05 3.049Z" />
    </svg>
  );
}

/** The island's status glyph: four quadrants, one away, walking clockwise while it works. */
function Blocks({ beat, className = "", style }: { beat: "working" | "blocked" | "done"; className?: string; style?: V }) {
  return <span className={`${styles.blocks} ${className}`} data-beat={beat} style={style}><i /><i /><i /><i /></span>;
}

/** The status dot beside an agent: hollow while starting, breathing while working, a check when handed back. */
function Signal({ status }: { status: "starting" | "working" | "done" }) {
  if (status === "done") return <svg width={9} height={9} viewBox="0 0 11 11" fill="none" className={styles.signalDone} aria-hidden="true"><path d="M1.5 5.8l2.6 2.6L9.5 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <i className={styles.signal} data-status={status} />;
}

/* ── motion primitives ──────────────────────────────────────────────────── */

/** A cursor that travels in from one side and clicks the thing it lives inside. */
function Pointer({ at: t, from }: { at: number; from: "left" | "right" }) {
  return (
    <svg className={styles.pointer} data-from={from} style={{ "--at": `${t}s` } as V} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 2l11.2 7.1-4.9 1.1 3 5.4-2.1 1.1-3-5.4L4 14.9z" fill="#f4f4f5" stroke="#0b0b0c" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

/** Text that types itself, one character per step. */
function Typed({ text, start, speed }: { text: string; start: number; speed: number }) {
  const n = text.length;
  return (
    <span className={styles.typed} style={{ animationDuration: `${(n * speed).toFixed(2)}s`, animationDelay: `${start}s`, animationTimingFunction: `steps(${n})` }}>
      {text}
    </span>
  );
}

/** Prose that streams in a word at a time, the way a reply arrives. */
function Stream({ text, start, speed }: { text: string; start: number; speed: number }) {
  /* The space lives between the boxes, not inside them: an inline-block drops
     trailing white space at the end of its own line, which ran the words
     together. */
  return <>{text.split(" ").map((word, i) => <span key={i}><span className={styles.word} style={{ animationDelay: `${(start + i * speed).toFixed(2)}s` }}>{word}</span>{" "}</span>)}</>;
}
