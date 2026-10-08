"use client";

import { useMemo, useRef } from "react";
import { rng } from "../_lib/ascii";
import { useFrames } from "../_lib/frames";

/* Two slow sine waves, quantised onto a density ramp, with a little noise
   shaken through. It is a horizontal rule that is alive — the one place on
   the page where the character grid is doing nothing but marking a seam. */
const RAMP = " .:+xX80@#%$";
const WIDTH = 220;

export function Divider() {
  const host = useRef<HTMLDivElement>(null);
  const { frame } = useFrames(140, { watch: host });

  const line = useMemo(() => {
    let out = "";
    for (let i = 0; i < WIDTH; i++) {
      const wave =
        (Math.sin(i * 0.13 + frame * 0.175) + Math.sin(i * 0.041 - frame * 0.105)) * 0.5;
      const jitter = rng(i * 131 + frame)();
      const level = Math.max(
        0,
        Math.min(RAMP.length - 1, Math.floor((wave * 0.5 + 0.5) * RAMP.length + (jitter - 0.5) * 3)),
      );
      out += RAMP[level];
    }
    return out;
  }, [frame]);

  return (
    <div
      ref={host}
      aria-hidden
      className="mx-auto mt-14 max-w-(--shell) overflow-hidden px-5 sm:px-8"
    >
      <pre className="m-0 overflow-hidden font-mono text-[13px] leading-[1.2] whitespace-pre text-faint select-none">
        {line}
      </pre>
    </div>
  );
}
