"use client";

import { useState } from "react";
import { DISCORD_URL } from "../_lib/site";

/* The six things people actually ask, with the answers they actually get.
   One open at a time, the first one open to start with — a wall of collapsed
   rows makes the reader do work before they learn anything. */

const QUESTIONS: [string, string][] = [
  [
    "Do I need an account?",
    "No. Firetower runs on your own machine, and there is no account to create.",
  ],
  [
    "Which agents can it run?",
    "Any coding agent that runs in a terminal. Firetower starts it in tmux on its own worktree, so you keep using the agent you already like.",
  ],
  [
    "What can I use as a machine?",
    "Anything you can SSH into: a cloud VPS, a Mac mini under your desk, a homelab server. Each one runs a small worker.",
  ],
  [
    "What happens when I close my laptop?",
    "Nothing happens to the agent. It never ran on the laptop. Open Firetower on your phone or another computer and the conversation is exactly where you left it.",
  ],
  [
    "Do I lose my work when a worker crashes?",
    "No. Your work is a branch and a worktree on that machine's disk, not state inside Firetower — restart the worker and the agent carries on from where it stopped. The same holds a layer up: if the control plane goes down the workers keep running and log locally, and it catches up by replay when it comes back. Worst case, SSH into the machine yourself. It is an ordinary git worktree, so you can commit and push by hand.",
  ],
  [
    "Does the worker open any ports?",
    "No. It reads frames from stdin and writes them to stdout, so it can be reached through SSH, a container exec or a child process. A firewall cannot tell the difference.",
  ],
  [
    "Why is it open source?",
    "Because nothing else gets adopted at scale. A company that is going to run coding agents on its own infrastructure has to be able to read the code, audit it, and keep running it whether or not we are still around — no amount of marketing substitutes for that. It also makes the thing better: people running Firetower on hardware we have never seen find the problems we never would, and fix them.",
  ],
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="pt-20 sm:pt-40">
      <div className="mx-auto flex max-w-(--shell) flex-wrap gap-x-16 gap-y-10 px-5 sm:px-8">
        <div className="flex flex-[1_1_320px] flex-col gap-4">
          <p className="eyebrow">[ FAQ ]</p>
          <h2 className="display h2">Frequently Asked Questions</h2>
          <p className="max-w-[360px] text-[16px] leading-[1.6] text-soft">
            Something missing? Ask in the{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-bone underline decoration-rim underline-offset-2"
            >
              community Discord
            </a>
            .
          </p>
        </div>

        <div className="flex flex-[2_1_560px] flex-col border-t border-line">
          {QUESTIONS.map(([question, answer], i) => {
            const shown = i === open;
            return (
              <div key={question} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={shown}
                  onClick={() => setOpen(shown ? -1 : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent py-[22px] text-left text-[19px] font-medium tracking-[-0.01em] text-bone"
                >
                  {question}
                  <span className="flex-none font-mono text-[16px] text-label">
                    {shown ? "−" : "+"}
                  </span>
                </button>
                {shown && (
                  <p className="pr-12 pb-6 text-[16px] leading-[1.65] text-dim">{answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
