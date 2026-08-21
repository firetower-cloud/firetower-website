import { Demo } from "./Demo";
import { Macbook } from "./Macbook";

/**
 * The product, running, at the size you would actually use it.
 *
 * No heading above it. The screen is the argument, and a caption for
 * something the reader can already see is noise — the demo introduces itself
 * with "What should we work on?", which is the same question the real
 * composer asks.
 */
export function Inbox() {
  return (
    <section id="inbox" className="relative scroll-mt-14">
      <div className="mx-auto max-w-[1340px] px-4 pt-2 pb-2 sm:px-8 sm:pt-6 sm:pb-6">
        <Macbook>
          <Demo />
        </Macbook>
      </div>
    </section>
  );
}
