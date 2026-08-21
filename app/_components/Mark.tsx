/**
 * The product's own glyphs, copied out of the application so the site and
 * the software are unmistakably the same thing.
 *
 * `Mark` is the lookout tower: legs, cabin, roof, and the light that's lit.
 * `Signal` is the status dot — the one place ember is allowed to be loud.
 */

export function Mark({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden
    >
      <path d="M4.4 19L7 9.6M15.6 19L13 9.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.1 14.4h7.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".55" />
      <path d="M6.4 9.4h7.2v-3H6.4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.8 6.4L10 2.2l5.2 4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="7.9" r="1.15" fill="var(--color-ember)" />
    </svg>
  );
}

export type Status = "NeedsYou" | "Working" | "Starting" | "HandedBack" | "Failed" | "Ended";

export function Signal({ status, size = 7 }: { status: Status; size?: number }) {
  const tone =
    status === "NeedsYou"
      ? "text-ember"
      : status === "HandedBack"
        ? "text-sage"
        : status === "Failed"
          ? "text-brick"
          : status === "Ended"
            ? "text-mute"
            : "text-slate";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${tone}`}
      style={{ width: size * 2.4, height: size * 2.4 }}
      aria-hidden
    >
      {status === "NeedsYou" && (
        <span
          className="ember-pulse absolute top-1/2 left-1/2 rounded-full bg-current"
          style={{ width: size, height: size }}
        />
      )}
      {status === "Failed" ? (
        <svg width={size + 2} height={size + 2} viewBox="0 0 10 10" fill="none">
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : status === "HandedBack" ? (
        <svg width={size + 3} height={size + 3} viewBox="0 0 11 11" fill="none">
          <path
            d="M1.5 5.8l2.6 2.6L9.5 3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span
          // Starting and Ended are both hollow: nothing is happening in there
          // yet, or ever again.
          className={`relative rounded-full ${
            status === "Ended" || status === "Starting" ? "border border-current" : "bg-current"
          } ${status === "Working" ? "breathe" : ""}`}
          style={{ width: size, height: size }}
        />
      )}
    </span>
  );
}

/** Wordmark lockup used in the nav and the footer. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5 text-bone">
      <Mark size={size} />
      <span className="font-narrow text-[13px] font-semibold tracking-[0.22em] uppercase">
        Firetower
      </span>
    </span>
  );
}
