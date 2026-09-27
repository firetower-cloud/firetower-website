import { Blueprint } from "./Blueprint";

/* The architecture gets a section of its own, centred, because the diagram is
   the explanation and everything here is a caption for it.

   It used to sit in the hero, where it had to be small enough not to push the
   fold down and had no room for a word of context. Two boxes labelled
   "Firetower" and "Worker" also used to live here, saying the same thing in
   less detail — the drawing replaced them rather than joining them. */

const LEGEND: { mark: string; tone: string; text: string }[] = [
  { mark: "*", tone: "text-ember", text: "a session that has stopped and needs you" },
  { mark: "o", tone: "text-slate", text: "one still working, nothing to do" },
  { mark: "ssh", tone: "text-sage", text: "how the app reaches a machine you own" },
];

export function How() {
  return (
    <section id="how" className="relative scroll-mt-14">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="rule" />
        <div className="pt-10 text-center sm:pt-14">
          <p className="eyebrow">How it fits together</p>
          <h2 className="display mt-5 text-[clamp(1.7rem,4.4vw,3.05rem)]">
            Your favorite agent,
            <br /> on <span className="text-ember">your favorite hardware</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[64ch] text-[15.5px] leading-[1.66] text-dim">
            Firetower reaches each machine over SSH and starts a worker there. The agents
            run on that machine — in tmux, on their own worktree — which is why closing
            your laptop costs nothing and why the app itself never has to be the thing
            that is busy.
          </p>
        </div>
      </div>

      {/* Wider than the prose, and centred on it. */}
      <div className="mx-auto mt-12 max-w-[1340px] px-4 sm:px-8">
        <div className="flex justify-center overflow-x-auto">
          <Blueprint />
        </div>

        <ul className="mx-auto mt-8 flex max-w-[860px] flex-wrap items-center justify-center gap-x-8 gap-y-2.5">
          {LEGEND.map((l) => (
            <li key={l.mark} className="flex items-center gap-2.5">
              <span className={`font-mono text-[13px] ${l.tone}`}>{l.mark}</span>
              <span className="text-[13px] text-mute">{l.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto mt-14 grid max-w-[900px] gap-3 sm:grid-cols-2">
          <Note title="Workers are authoritative.">
            They write what happened to their own log before reporting it. When the
            control plane comes back it asks for everything since the last thing it saw —
            so a closed laptop costs nothing and a reconnect is a replay, not a guess.
          </Note>
          <Note title="The worker never opens a port.">
            It reads frames from stdin and writes them to stdout, so who dials is a
            transport detail: a child process, a container exec, or SSH. The daemon cannot
            tell the difference, and neither can a firewall.
          </Note>
        </div>
      </div>
    </section>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-line-soft px-4 py-3.5">
      <p className="text-[13.5px] text-bone">{title}</p>
      <p className="mt-1.5 text-[13px] leading-[1.6] text-dim">{children}</p>
    </div>
  );
}
