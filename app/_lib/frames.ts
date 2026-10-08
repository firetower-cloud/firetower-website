"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/* ───────────────────────────────────────────────────────────────────────────
   The clock every ASCII scene runs on.

   Each scene is a pure function of a frame number, so the only shared
   machinery it needs is something to count frames — and two rules about when
   not to.

   The first is `prefers-reduced-motion`: a scene that redraws itself fourteen
   times a second is exactly what that setting is asking us not to do, so the
   counter never starts and the drawing is a still. It is read as an external
   store rather than kept in state, which means the server renders the still
   pose and a client that wants motion starts moving without a flash of the
   wrong thing in between.

   The second is visibility. These are decorative drawings scattered down a
   long page, and a page with six of them all animating at once would spend
   the whole scroll rebuilding grids nobody is looking at. An observer stops
   every scene that is not on screen, and the browser stops all of them when
   the tab goes to the back.
   ─────────────────────────────────────────────────────────────────────── */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the reader has asked for less movement — and while rendering on
    the server, where the honest answer is "we don't know yet". */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}

type Options = {
  /** Where the counter sits when motion is reduced — a scene's "done" pose. */
  still?: number;
  /** Only run while this element is on screen. */
  watch?: RefObject<Element | null>;
};

/**
 * `now` comes back alongside the counter so a scene that measures how long ago
 * something happened — a fire that is still catching, a crate still falling —
 * can stay a pure function of its props and state rather than reading the
 * clock while React is rendering it. It is 0 until the first tick, which is
 * also for ever when motion is reduced; a scene that cares has to treat that
 * as "long enough ago" rather than "just now".
 */
export function useFrames(ms: number, { still = 0, watch }: Options = {}) {
  const [tick, setTick] = useState({ frame: 0, now: 0 });
  const reduced = useReducedMotion();
  const visible = useRef(true);

  useEffect(() => {
    if (reduced) return;
    let observer: IntersectionObserver | undefined;
    const target = watch?.current;
    if (target) {
      visible.current = false;
      observer = new IntersectionObserver(
        (entries) => {
          visible.current = entries[0]?.isIntersecting ?? false;
        },
        { rootMargin: "120px" },
      );
      observer.observe(target);
    }
    const id = window.setInterval(() => {
      if (!visible.current || document.hidden) return;
      setTick((t) => ({ frame: t.frame + 1, now: Date.now() }));
    }, ms);
    return () => {
      window.clearInterval(id);
      observer?.disconnect();
    };
    // `watch` is a ref, so its identity never changes.
  }, [ms, reduced, watch]);

  return { frame: reduced ? still : tick.frame, now: tick.now, reduced };
}
