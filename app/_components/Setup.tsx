import { INSTALL } from "./InstallCommand";

/* Three steps, three panels, and in each one the thing you would actually be
   looking at when that step is done — a command, a host that reported in, a
   ticket that has an agent on it. The screenshots of this are further down
   the page; this is the shape of the work. */

const STEPS = [
  {
    n: "STEP 01",
    title: "Install the server",
    body:
      "One command on any Linux box. The control plane runs in about 200 MB, and there is no account to create.",
    lines: [["", INSTALL]] as [string, string][],
    prompt: true,
  },
  {
    n: "STEP 02",
    title: "Add a machine",
    body:
      "Any machine you can SSH into: a VPS, a Mac mini, a box in your closet. Firetower starts a worker there. It never opens a port.",
    lines: [
      ["host ", "hetzner-01"],
      ["reach", "ssh"],
      ["state", "worker connected"],
    ] as [string, string][],
    lit: 2,
  },
  {
    n: "STEP 03",
    title: "Connect GitHub, pick an issue",
    body:
      "Start from a GitHub issue or a Linear ticket. The agent gets its own branch and worktree, and keeps going when you leave.",
    lines: [
      ["ENG-142", "Retry webhook deliveries"],
      ["branch ", "eng-142"],
      ["agent  ", "running"],
    ] as [string, string][],
    lit: 2,
  },
];

export function Setup() {
  return (
    <section id="setup" className="pt-20 sm:pt-40">
      <div className="mx-auto flex max-w-(--shell) flex-col gap-12 px-5 sm:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">[ SETUP ]</p>
          <h2 className="display h2">Set Up In Three Steps</h2>
        </div>

        <div className="flex flex-wrap border border-line">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`flex flex-[1_1_320px] flex-col gap-3.5 px-5 pt-7 pb-8 sm:px-7 sm:pt-[30px] ${
                i < STEPS.length - 1 ? "border-line lg:border-r" : ""
              }`}
            >
              <p className="font-mono text-[12px] tracking-[0.08em] text-ember">{step.n}</p>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-bone">{step.title}</h3>
              <p className="text-[15px] leading-[1.6] text-soft">{step.body}</p>
              <pre className="mt-2 border border-edge bg-panel p-4 font-mono text-[12.5px] leading-[1.7] break-all whitespace-pre-wrap text-text">
                {step.lines.map(([label, value], j) => (
                  <span key={label || value}>
                    {j > 0 && "\n"}
                    <span className="text-mute">{step.prompt ? "$" : label}</span>{" "}
                    <span className={step.lit === j ? "text-ember" : undefined}>{value}</span>
                  </span>
                ))}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
