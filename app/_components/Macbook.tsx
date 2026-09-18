/**
 * A laptop to put the product inside — or rather, the display of one.
 *
 * The frame is bezel and notch and nothing else. It used to carry a drawn
 * menu strip along the top and a chin below the screen that dissolved into
 * the page, both of which made sense when the screen held a mock: the strip
 * gave the notch something to be cut out of, and the chin let the machine
 * run off the bottom without ever having to look like a real one.
 *
 * A recording needs neither. It arrives with a menu bar of its own, so a
 * second one drawn above it is two machines stacked; and it ends at a
 * definite edge, so there is nothing below the screen for a fade to imply.
 * What is left is the smallest thing that still reads as a display: a bezel
 * the same weight on all four sides, and the notch biting into the top of
 * the picture the way it does on the hardware.
 *
 * The height comes from the child. The recording has one true aspect ratio
 * and a number chosen here would only crop it.
 *
 * Deliberately graphite rather than aluminium: a silver chassis on this
 * palette reads as a stock photo dropped onto the page.
 */
export function Macbook({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[16px] border border-[#2b2825] bg-linear-to-b from-[#211e1c] to-[#141211] p-[8px] sm:rounded-[22px] sm:p-[11px]">
      <div className="relative overflow-hidden rounded-[9px] bg-ground sm:rounded-[13px]">
        {children}

        {/* The notch, over the picture rather than beside it — there is no
            strip left for it to sit in, and a cutout that clears the content
            is just a tab. */}
        <span
          className="absolute top-0 left-1/2 z-30 h-[22px] w-[110px] -translate-x-1/2 rounded-b-[9px] bg-black sm:h-[27px] sm:w-[145px]"
          aria-hidden
        />
      </div>
    </div>
  );
}
