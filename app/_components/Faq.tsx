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
    "Does the worker open any ports?",
    "No. It reads frames from stdin and writes them to stdout, so it can be reached through SSH, a container exec or a child process. A firewall cannot tell the difference.",
  ],
  [
    "How is Firetower licensed?",
    "AGPL-3.0-only. If you run a modified Firetower as a network service, you have to publish your changes.",
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
