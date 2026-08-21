/**
 * A laptop to put the product inside — or rather, the top half of one.
 *
 * There is no base and no bottom edge. The lid runs off the bottom of the
 * section and dissolves into the page, which does two useful things: it says
 * "this screen continues" instead of "this screen ends here", and it means
 * the frame never has to pick a height that looks like a real machine. A
 * device drawn in full invites you to check its proportions; a device fading
 * out does not.
 *
 * That is also why the height is fixed rather than an aspect ratio. With the
 * bottom gone there is nothing left to be out of proportion, so the only
 * question is how much of the dashboard to show, which is a decision about
 * content and not about hardware.
 *
 * Deliberately graphite rather than aluminium: a silver chassis on this
 * palette reads as a stock photo dropped onto the page.
 */

/* Solid to nearly two thirds, then gone. Starting the fade earlier eats the
   session cards; later leaves a hard edge that reads as a clipping bug. */
/* Solid most of the way down, then gone. The screen holds something you can
   click now, so the fade has to stay clear of the controls — it only has to
   remove the bottom edge, not a third of the display. */
const FADE = "linear-gradient(to bottom, #000 0%, #000 82%, rgba(0,0,0,0.5) 93%, transparent 100%)";

export function Macbook({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative"
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      {/* Lid: sides and top only. */}
      <div className="relative rounded-t-[16px] border-x border-t border-[#2b2825] bg-linear-to-b from-[#211e1c] to-[#141211] px-[8px] pt-[8px] sm:rounded-t-[22px] sm:px-[11px] sm:pt-[11px]">
        <div className="relative flex h-[620px] flex-col overflow-hidden rounded-t-[9px] bg-ground sm:h-[665px] sm:rounded-t-[13px]">
          {/* The menu strip, a shade off black so the notch can sit against it. */}
          <div className="relative z-20 flex h-[22px] shrink-0 items-center justify-between bg-[#0e0d0c] px-3 sm:h-[26px]">
            <span className="font-narrow text-[9px] font-semibold tracking-[0.18em] text-mute uppercase sm:text-[10px]">
              Firetower
            </span>
            <span className="font-mono text-[9px] text-mute sm:text-[10px]">Thu 09:41</span>
          </div>

          {/* The notch, overhanging the strip so it reads as a cutout. */}
          <span
            className="absolute top-0 left-1/2 z-30 h-[26px] w-[110px] -translate-x-1/2 rounded-b-[9px] bg-black sm:h-[31px] sm:w-[145px]"
            aria-hidden
          />

          <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
