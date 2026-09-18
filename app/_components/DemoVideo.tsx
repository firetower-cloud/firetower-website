"use client";

import { useRef, useState } from "react";

/* ── The product, recorded ────────────────────────────────────────────────
   A real session, start to finish: name a branch, pick the machine it runs
   on, watch the agent work, leave a note on the line you disagree with, and
   open the pull request.

   Nothing loads until it is asked for. The video carries `preload="none"`,
   so the only weight on first paint is the poster frame — one still, pulled
   out of the recording itself at the moment the whole product is on screen
   at once. The bytes of the demo are spent on people who want the demo.

   It does not autoplay. A screen recording that starts moving on its own is
   a thing happening at the reader; a play button is a thing they chose.
   ─────────────────────────────────────────────────────────────────────── */

/** The encoded pair. Both are the same 77s, scaled to the width the frame
    actually renders at — the name carries the cut so the files can be
    cached forever and replaced by publishing a new one. */
const WEBM = "/demo/demo-0.9.webm";
const MP4 = "/demo/demo-0.9.mp4";
const POSTER_AVIF = "/demo/demo-0.9.avif";
const POSTER_JPG = "/demo/demo-0.9.jpg";

/* The encode is 1440x956. Declaring it as a ratio rather than a height lets
   the frame keep every pixel of the recording at any width — a screen
   recording cropped to fit is a screen recording with the sidebar cut off. */
const RATIO = "1440 / 956";

const LENGTH = "1:17";

export function DemoVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [covered, setCovered] = useState(true);
  /* Ended is not the same as not-yet-started: the second time the cover
     comes back it should not claim to be showing you something new. */
  const [ended, setEnded] = useState(false);

  async function play() {
    const el = video.current;
    if (!el) return;
    setCovered(false);
    setEnded(false);
    if (el.ended) el.currentTime = 0;
    try {
      await el.play();
    } catch {
      /* Autoplay policy, a codec neither source satisfies, a network that
         dropped — whatever the reason, put the cover back rather than
         leaving a black rectangle with no way out. */
      setCovered(true);
    }
  }

  return (
    <div className="relative w-full bg-ground" style={{ aspectRatio: RATIO }}>
      <video
        ref={video}
        className="h-full w-full object-cover"
        width={1440}
        height={956}
        preload="none"
        playsInline
        controls={!covered}
        onEnded={() => {
          setEnded(true);
          setCovered(true);
        }}
      >
        <source src={WEBM} type="video/webm" />
        <source src={MP4} type="video/mp4" />
      </video>

      {covered && (
        <button
          type="button"
          onClick={play}
          className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center focus-visible:outline-offset-[-3px]"
        >
          <picture>
            <source srcSet={POSTER_AVIF} type="image/avif" />
            <img
              src={POSTER_JPG}
              alt=""
              width={1440}
              height={956}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>

          {/* Enough shade for the button to sit on, lifting as you approach
              it. Weighted to the middle rather than flat across: a uniform
              wash over the whole frame dims the thing the poster is there to
              show, and the only place that needs separating is behind the
              control. */}
          <span
            className="absolute inset-0 bg-radial from-ground/70 via-ground/35 to-ground/10 transition-opacity duration-300 group-hover:opacity-70"
            aria-hidden
          />

          <span className="relative flex items-center justify-center">
            {/* The status dot's pulse, borrowed at scale — a ring rather
                than a disc. The dot fills because at 7px a filled circle is
                a glow; at 84px the same fill is an orange smudge sitting on
                top of the screenshot, and only the expanding edge still
                reads as a signal. `prefers-reduced-motion` already switches
                this animation off everywhere. */}
            {/* Centred here as well as in the keyframes, which are what
                normally supply the `translate(-50%, -50%)` — under
                `prefers-reduced-motion` the animation is dropped entirely
                and the ring would otherwise sit half its width down and to
                the right of the button it belongs to. */}
            <span
              className="ember-pulse absolute top-1/2 left-1/2 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ember sm:h-[84px] sm:w-[84px]"
              aria-hidden
            />
            <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-ember/45 bg-ember/15 backdrop-blur-[2px] transition duration-200 group-hover:scale-105 group-hover:border-ember/70 group-hover:bg-ember/25 sm:h-[84px] sm:w-[84px]">
              <svg
                viewBox="0 0 24 24"
                className="ml-[4px] h-[26px] w-[26px] sm:h-[32px] sm:w-[32px]"
                aria-hidden
              >
                <path
                  d="M6.5 3.8v16.4a1 1 0 0 0 1.53.85l13-8.2a1 1 0 0 0 0-1.7l-13-8.2a1 1 0 0 0-1.53.85Z"
                  fill="var(--color-ember)"
                />
              </svg>
            </span>
          </span>

          <span className="eyebrow relative mt-5 text-bone/85 transition-colors group-hover:text-bone">
            {ended ? "Watch it again" : "Watch a session, start to finish"}
            <span className="ml-2 text-mute">{LENGTH}</span>
          </span>
        </button>
      )}
    </div>
  );
}
