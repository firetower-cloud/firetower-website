import { Mark, Signal } from "./Mark";

/* The application's chrome, reduced. Same components, same palette, same
   voice as the real one — drawn in markup rather than screenshotted, so it
   stays sharp on every display and never goes stale.

   Everything to the right of the sidebar is the demo's business. */

const NAV = ["Sessions", "Repositories", "Agents", "Secrets", "Compute"];

/** The rest of the fleet: enough for the sidebar to look like a fleet. */
const OTHERS = ["marlow", "ashby", "tessier"];

export function Shell({
  children,
  pinnedNames = [],
}: {
  children: React.ReactNode;
  /** Sessions the demo currently has working, listed first and lit. */
  pinnedNames?: string[];
}) {
  return (
    <div className="flex h-full bg-ground">
      <aside className="hidden w-[150px] shrink-0 flex-col border-r border-line bg-panel py-4 lg:flex xl:w-[186px]">
        <div className="flex items-center gap-2.5 px-4 pb-5 text-bone">
          <Mark size={17} />
          <span className="font-narrow text-[11px] font-semibold tracking-[0.2em] uppercase">
            Firetower
          </span>
        </div>
        <nav className="flex flex-col gap-px px-2">
          {NAV.map((n, i) => (
            <span
              key={n}
              className={`rounded-[4px] px-2.5 py-[6px] text-[12.5px] ${
                i === 0 ? "bg-raise text-bone" : "text-dim"
              }`}
            >
              {n}
            </span>
          ))}
        </nav>

        <p className="eyebrow mt-7 px-4">In flight</p>
        <div className="mt-2 flex flex-col px-2">
          {pinnedNames.map((n) => (
            <span key={n} className="flex items-center gap-1.5 rounded-[4px] bg-raise px-2.5 py-[4px]">
              <Signal status="Working" size={5} />
              <span className="truncate text-[12px] text-bone">{n}</span>
            </span>
          ))}
          {OTHERS.map((n) => (
            <span key={n} className="flex items-center gap-1.5 px-2.5 py-[4px]">
              <Signal status="Working" size={5} />
              <span className="truncate text-[12px] text-dim">{n}</span>
            </span>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
