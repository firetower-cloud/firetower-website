import { LIFECYCLE } from "../_lib/lifecycle";

/* ── What happens when you start a workspace ──────────────────────────────
   The lifecycle, given a screen of its own. The steps come from
   `_lib/lifecycle`, which is also what the page's HowTo structured data
   reads — one list, described and shown from the same source.
   ─────────────────────────────────────────────────────────────────────── */

export function Lifecycle() {
  return (
    <section id="lifecycle" className="relative scroll-mt-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="rule" />
        <div className="flex min-h-[100svh] flex-col justify-center py-16 sm:py-24">
          <div className="text-center">
            <p className="eyebrow">Step by step</p>
            <h2 className="display mt-5 text-[clamp(1.9rem,5vw,3.6rem)]">
              Here is what happens
              <br /> when you start a workspace
            </h2>
          </div>

          {/* Every step, in order, at a size that reads from across the room. */}
          <ol className="mt-10 divide-y divide-line-soft border-y border-line-soft sm:mt-12">
            {LIFECYCLE.map((s, i) => (
              <li key={s.k} className="grid gap-x-8 gap-y-1 py-5 sm:grid-cols-[72px_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-baseline sm:py-6">
                <span className="font-mono text-[15px] text-ember sm:text-[17px]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[24px] font-medium leading-[1.15] tracking-[-0.02em] text-bone sm:text-[30px] lg:text-[34px]">
                  {s.k}
                </span>
                <span className="text-[15.5px] leading-[1.6] text-dim sm:text-[17px]">{s.v}</span>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-[15.5px] leading-[1.6] text-dim sm:mt-10 sm:text-[17px]">
            <span className="font-medium text-bone">Then:</span> attach from a browser or a phone, answer
            it, review the diff, push the branch, open the pull request, destroy the workspace.
          </p>
        </div>
      </div>
    </section>
  );
}
