/**
 * What one sentence of work turns into, in order.
 *
 * Lives here rather than in `How.tsx` because two things describe it: the
 * numbered list on the homepage, and the `HowTo` node in the page's JSON-LD.
 * Same reasoning as the docs manifest in `docs/_lib/nav.ts` — a step that is
 * shown but not described, or described but not shown, is the failure mode
 * worth designing out.
 *
 * `k` is the action, `v` the qualifier. Read together they make one sentence,
 * which is exactly what the schema needs for a step's name and text.
 */
export type Step = { k: string; v: string };

export const LIFECYCLE: Step[] = [
  { k: "picks a host", v: "from the fleet, or the one you named" },
  { k: "cuts a branch", v: "off the mirror it already keeps warm" },
  { k: "makes a worktree", v: "so two sessions never share a checkout" },
  { k: "starts tmux", v: "and the session outlives every connection to it" },
  // Before the launch, not after it: the agent needs the variables to work
  // and the install to have finished. The control plane's own step order is
  // Setup then Launch, and the demo further up the page shows it that way.
  { k: "copies your variables", v: "and runs the repository's init scripts" },
  { k: "launches the agent", v: "with credentials handed over at start, in memory only" },
  { k: "keeps it running", v: "and records what happened before reporting it" },
];

/** The example prompt shown above the list, and the HowTo's supply. */
export const LIFECYCLE_PROMPT = "rate-limit the webhook receiver, 100/min per key";
