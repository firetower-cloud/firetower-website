import { PhoneTour } from "./Workflow";

/* ── Any device ──────────────────────────────────────────────────────────
   The same four screens as the section above, on the phone client, next to
   the one sentence that explains why that is possible at all.

   This used to carry the three failure cases as well — laptop, server,
   worker. They are gone from here because the section below lets you cause
   each of them yourself, and a list of claims next to a thing that proves
   them is just the thing being read out twice.
   ─────────────────────────────────────────────────────────────────────── */

const DEVICES = [
  { name: "macOS", note: "the desktop client" },
  { name: "Windows", note: "the same build" },
  { name: "iOS", note: "review on the move" },
  { name: "Android", note: "review on the move" },
];

export function Anywhere() {
  // Bottom padding of its own, unlike the other sections: what follows is a
  // sticky track with no top padding to borrow.
  //
  // The phone tour is hidden at the width where the section above switches to
  // the phone client itself — below 720px these are the same four screens, and
  // showing them twice in a row is just a longer page.
  return (
    <section id="anywhere" className="scroll-mt-14 pt-20 pb-20 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-(--shell) px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">[ ANY DEVICE ]</p>
            <h2 className="display h2">Start On One. Finish On Another.</h2>
            <p className="max-w-[58ch] text-[17px] leading-[1.6] text-dim">
              <span className="text-bone">
                The agent runs on your server, not on the device you started it from
              </span>
              , so every device picks up exactly where another left off. The same
              conversation, the same diff, the same branch — on a phone on a train.
            </p>

            <dl className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2">
              {DEVICES.map((device) => (
                <div key={device.name} className="bg-ground px-4 py-3.5">
                  <dt className="text-[15px] font-medium text-bone">{device.name}</dt>
                  <dd className="mt-1 font-mono text-[12px] tracking-[0.04em] text-mute">
                    {device.note}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="max-[719px]:hidden">
            <PhoneTour />
          </div>
        </div>
      </div>
    </section>
  );
}
