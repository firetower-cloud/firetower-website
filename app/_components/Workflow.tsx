"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mark } from "./Mark";
import styles from "./Workflow.module.css";

const steps = [
  { label: "Tasks", title: "Start with what needs doing.", text: "Bring in issues from GitHub or Linear. Open a workspace with the task’s context already attached.", action: "Start a workspace", view: "Tasks" },
  { label: "Workspace", title: "Your branch. Your remote machine.", text: "An isolated worktree, a fresh branch, and your agent — ready on a machine that keeps running when you leave.", action: "Build with your agent", view: "New workspace" },
  { label: "Agent", title: "A conversation that becomes code.", text: "Give direction, answer questions, and refine the result. Stay with the same agent and workspace as the work evolves.", action: "Open the preview", view: "Agent" },
  { label: "Preview", title: "See it. Point to it. Refine it.", text: "Preview the running app and annotate what needs changing. Your feedback goes straight back to the agent.", action: "Review the changes", view: "Preview" },
  { label: "Ship", title: "Reviewed. Committed. Pushed.", text: "Inspect the diff and commit and push from your workspace. From issue to finished branch, it all stays together.", action: "Back to tasks", view: "Changes" },
];

export function Workflow() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setPlaying(true);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !root.current) return;
      const box = root.current.getBoundingClientRect();
      if (box.bottom > 0 && box.top < window.innerHeight) setActive((value) => (value + 1) % steps.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [playing]);

  function select(index: number) {
    setPlaying(false);
    setActive(index);
  }

  return (
    <section id="workflow" ref={root} className={styles.section} aria-labelledby="workflow-heading" data-playing={playing}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>From issue to shipped</p>
          <h2 id="workflow-heading" className="display">Your entire workflow.<br />One place to move it forward.</h2>
        </div>
        <p>Your tools, your agent, your remote machines. Connected from the first task to the final push.</p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Development workflow">
        {steps.map((step, index) => (
          <button key={step.label} ref={(node) => { buttons.current[index] = node; }} type="button" role="tab" id={`workflow-tab-${index}`} aria-controls={`workflow-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={(event) => {
            let next: number;
            if (event.key === "ArrowRight") next = (index + 1) % steps.length;
            else if (event.key === "ArrowLeft") next = (index + steps.length - 1) % steps.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = steps.length - 1;
            else return;
            event.preventDefault(); select(next); buttons.current[next]?.focus();
          }}>
            {step.label}
          </button>
        ))}
      </div>

      {steps.map((step, index) => (
        <div key={step.label} id={`workflow-panel-${index}`} role="tabpanel" aria-labelledby={`workflow-tab-${index}`} hidden={active !== index} tabIndex={0}>
          <div className={styles.panel} data-step={index}>
            <div className={styles.copy}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <button type="button" className={styles.next} onClick={() => select((index + 1) % steps.length)}>{step.action}<span aria-hidden="true"> →</span></button>
            </div>
            <div className={styles.stage}>
              <div className={styles.window}>
                <div className={styles.windowbar}><span className={styles.brand}><Mark size={17} /> FIRETOWER</span><span className={styles.windowTitle}>{index < 2 ? step.view : "dark-mode"}</span><span className={styles.remote}>dev-server-01</span></div>
                {index > 1 && <div className={styles.workbenchTabs}>{["Agent", "Preview", "Changes"].map((label) => <span key={label} className={label === step.view ? styles.currentView : undefined}>{label}</span>)}</div>}
                <div className={styles.scene}>
                  {index === 0 && <>
                    <div className={styles.sceneTitle}>Tasks <span className={styles.sources}><span><Image src="/github-logo.svg" width={14} height={14} alt="" />GitHub</span><span><Image src="/linear-logo.svg" width={14} height={14} alt="" />Linear</span></span></div>
                    <div className={styles.issue}><span className={styles.issueId}>ENG-142 <span className={styles.source}><Image src="/linear-logo.svg" width={13} height={13} alt="" />Linear</span></span><strong>Add a dark mode toggle</strong><p>Let people choose a theme that feels right.</p><span className={styles.tag}>web-app</span><span className={styles.launch}>Start workspace ↗</span></div>
                    <div className={styles.issueSmall}><span>#86</span> Fix the invite link <small className={styles.source}><Image src="/github-logo.svg" width={13} height={13} alt="" />GitHub</small></div>
                  </>}
                  {index === 1 && <>
                    <div className={styles.sceneTitle}>New workspace</div><div className={styles.workspaceFields}><div><span>Name</span><strong>dark-mode</strong></div><div><span>Repository</span><strong>acme / web-app</strong></div><div><span>Runs on</span><strong>dev-server-01 <i>Remote</i></strong></div></div>
                    <div className={styles.checklist}>{["Worktree ready", "Branch: agent/dark-mode", "Agent started"].map((line) => <div key={line}><span>✓</span>{line}</div>)}</div>
                  </>}
                  {index === 2 && <>
                    <div className={styles.message}><span>You</span><p>Add a dark mode toggle to settings. Remember the user’s preference.</p></div>
                    <div className={`${styles.message} ${styles.agent}`}><span>Agent <small>Needs you</small></span><p>I’ve added the theme switch and saved the preference. Should it follow the system theme by default?</p></div>
                    <div className={styles.reply}>Yes, use the system theme until I choose one.<span>↑</span></div>
                  </>}
                  {index === 3 && <>
                    <div className={styles.address}><span aria-hidden="true">↻</span> localhost:3000/settings <span className={styles.live}>● Live preview</span></div>
                    <div className={styles.preview}><span className={styles.previewBrand}>acme / settings</span><h4>Appearance</h4><p>Choose how the app looks on your device.</p><div className={styles.themeOptions}><span><small>Light</small></span><span><small>Dark</small></span><span className={styles.themeSelected}><small>System</small><b>1</b></span></div></div>
                    <div className={styles.annotation}><span>1</span><div><strong>You · annotation</strong><p>Show which theme is selected more clearly.</p><small>Sent to agent ↗</small></div></div>
                  </>}
                  {index === 4 && <>
                    <div className={styles.diffTitle}>ThemeToggle.tsx <span>+42 −2</span></div>
                    <div className={styles.diff}><div><em>18</em>  const theme = useTheme();</div><div className={styles.removed}><em>19</em>− &lt;button onClick=&#123;toggle&#125;&gt;</div><div className={styles.added}><em>19</em>+ &lt;button aria-pressed=&#123;selected&#125;</div><div className={styles.added}><em>20</em>+   onClick=&#123;toggle&#125;&gt;</div><div><em>21</em>    &#123;label&#125;</div></div>
                    <div className={styles.commit}><span>Commit message</span><p>Add theme toggle with system preference</p></div>
                    <div className={styles.shipped}><span>✓</span><div><strong>Committed & pushed</strong><p>3 files changed · agent/dark-mode</p></div><span aria-hidden="true">↗</span></div>
                  </>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className={styles.footer}><p><span className={styles.online} />Runs remotely. Keeps going when you close your laptop.</p><button type="button" onClick={() => setPlaying(!playing)} aria-pressed={playing}>{playing ? "Ⅱ Pause tour" : "▷ Play tour"}</button></div>
    </section>
  );
}
