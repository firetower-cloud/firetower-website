import { PhoneTour } from "./Workflow";

/* ── Close your laptop ────────────────────────────────────────────────────
   The claim the whole product rests on, said once, plainly: the agent runs
   on your server, so no device is the one holding the work. On the right,
   the phone client going through the same four screens as the tour above —
   the proof that the conversation is the same one wherever it is opened.
   On the left, what happens when each part fails, because "it keeps running"
   is only worth saying with the failure cases next to it.
   ─────────────────────────────────────────────────────────────────────── */

const FAILURES = [
  {
    what: "Your laptop closes. Or the app crashes.",
    then: "Nothing happens to the agent.",
    why: "It never ran on the laptop. Open Firetower on any other device and the conversation is exactly where you left it.",
  },
  {
    what: "The Firetower server goes down.",
    then: "The workers keep running.",
    why: "Each agent is on its own machine, in its own worktree. When the server comes back it catches up on everything that happened while it was away.",
  },
  {
    what: "A worker dies.",
    then: "The worktree is still there.",
    why: "Your branch and every file the agent changed are on that machine, and Firetower still knows about them. Restart the worker and carry on.",
  },
];

export function Anywhere() {
  return (
    <section id="anywhere" className="relative scroll-mt-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="rule" />
        <div className="grid items-center gap-12 pt-12 pb-20 sm:pt-16 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20">
          <div>
            <p className="eyebrow">From any device</p>
            <h2 className="display mt-5 text-[clamp(1.7rem,4.4vw,3.05rem)]">
              Close your laptop <span className="text-ember">anytime</span>.
              <br /> Pick up your phone.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[15.5px] leading-[1.66] text-dim">
              <strong className="font-medium text-bone">
                The agent runs on your server, not on the device you started it from
              </strong>
              , so every device can pick up exactly where another left off.
            </p>

            <div className="mt-9 grid gap-3">
              {FAILURES.map((f) => (
                <div key={f.what} className="rounded-[6px] border border-line-soft px-4 py-3.5">
                  <p className="text-[14px] leading-[1.4] text-dim">
                    <span className="eyebrow mr-2">If</span>
                    {f.what}
                  </p>
                  <p className="mt-2 text-[15px] font-medium leading-[1.35] text-bone">{f.then}</p>
                  <p className="mt-1 text-[13.5px] leading-[1.6] text-dim">{f.why}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 text-[15.5px] leading-[1.6] text-bone">
              Each part can fail on its own. The work survives every one of them.
            </p>
          </div>

          <PhoneTour />
        </div>
      </div>
    </section>
  );
}
