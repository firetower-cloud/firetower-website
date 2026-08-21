# Firetower website

The marketing site — one page, statically generated, no runtime.

This is a separate repository from the product. It deliberately shares the
application's design system rather than inventing a second one: the palette in
`app/globals.css` is lifted from `firetower/web/app/globals.css`, the three
faces in `public/fonts` are the same files, and the tower mark and status
signals in `app/_components/Mark.tsx` are the application's own glyphs.

Nothing enforces that — when the product's palette moves, move this one with
it by hand.

## Running it

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # every route prerendered
npm run lint
```

## Layout

```
app/
  page.tsx              the landing page — sections in reading order
  layout.tsx            fonts, sitewide metadata, sitewide JSON-LD
  globals.css           the design system: palette, display face, motion
  _components/          Nav, Hero, Inbox (the screen), How, Footer, Mark
  _components/BinaryField.tsx  the canvas field behind the hero
  _components/Blueprint.tsx    the ASCII architecture diagram
  _components/Macbook.tsx      the laptop the demo sits in
  _components/Demo.tsx         the interactive demo (the only stateful thing)
  _components/Screen.tsx       the app's shell and its inbox
  _lib/site.ts          canonical origin, product copy, links
  _lib/structured-data.ts  Organization, WebSite, SoftwareApplication
  _lib/og.tsx           the social card renderer
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx apple-icon.tsx icon.svg
```

## Things worth knowing before editing

**The domain lives in one place.** `SITE_URL` in `app/_lib/site.ts` is the
canonical URL, the `metadataBase` every relative image resolves against, the
host in `robots.txt` and the prefix in the sitemap. Changing the domain is that
line and nothing else.

**The page is four things: hero, screen, diagram, footer.** Everything else
was cut. If you add a section back, add its structured data with it and not
before — `FAQPage` schema outlived the FAQ by about a minute here, and schema
that does not match visible copy is a penalty rather than a bonus.

**There is no install section, so every call to action leaves the site** for
the README's *Running it* heading. If that heading is ever renamed, three
links break silently: the nav button, the hero, and the footer.

**Two client components, and no more.** `Copy` (the clipboard button) and
`BinaryField` (the hero background). Everything else is a server component and
the page should stay readable as HTML.

**The hero background is a canvas on purpose.** The obvious build is a few
thousand `<span>`s with CSS on them, but an inline element cannot be
composited on its own, so lighting one under the cursor repaints the whole
text layer beneath it. The canvas paints the field once (~1.4 ms) and every
redraw afterwards touches only the cells that changed — the ones under the
pointer and the ones it just left. Measured at **0.032 ms per pointer move**.
It is `aria-hidden` decoration, so having no server-rendered markup costs
nothing.

Four things in there are easy to break:

- The font family is read back off the element with
  `getComputedStyle(...).fontFamily`. `getPropertyValue("--font-mono")`
  returns the literal `var(...)` text, and assigning that to `ctx.font` is
  invalid — the canvas silently stays on 10px sans-serif.
- The pointer's light is scaled by each cell's own falloff. Without that,
  running the cursor over the headline lights up the glyphs hiding behind
  the words.
- The falloff is baked into each glyph's alpha rather than applied as a CSS
  mask — a mask over a canvas is another layer to blend every frame.
- The pointer redraws from the event, on a 16 ms throttle, not inside
  `requestAnimationFrame`. The work is bounded, so coalescing buys nothing,
  and rAF is suspended in a background tab.

Every cell holds a glyph even where the field looks blank: the pointer's
light is what reveals them, which is what makes the pool read as a beam
rather than a brightness control. Ambient blooms (a handful of glyphs
fading in and out on their own) are the one thing still on rAF, and they
are disabled under `prefers-reduced-motion`, as is the whole loop.

**The diagram has a section to itself, centred.** It used to sit in the hero,
where it had to stay small enough not to push the fold down and had no room
for a word of context. It now leads "How it fits together", with a legend
underneath for `*`, `o` and `ssh`. Two boxes labelled Firetower and Worker
used to open that section, saying the same thing in less detail — the drawing
replaced them rather than joining them.

**The diagram's shape is the argument.** One app on the left, two
machines stacked on the right, and a single trunk labelled `ssh` that forks to
reach both — with the sessions listed inside the machine that runs them. An
earlier version drew `INBOX | FIRETOWER | YOUR HOSTS` as three equal panels in
a row, which claimed two things that are false: that there is a system called
Inbox sitting beside Firetower, and that separate machines are rows in one
box. The inbox is a screen in the app, so it is a row inside the app panel. If
you restructure this, keep the one-to-many.

**The connector is a fork rather than two wires, and that is not decoration.**
Two independent wires only work while the app panel happens to be tall enough
to have a row at each machine's height. It is not, and every edit to the app's
copy changes whether it is — so the second wire silently ends up dangling
beside nothing. The fork does not care: the trunk leaves the app at its own
middle, the branches meet the machines wherever they are, and `hub()` derives
all of it. Add a third machine and it still works.

Keep prose out of the `<pre>`. It cannot wrap in there, so on a phone a long
line sets the block's width and makes the whole figure scroll sideways.

**It is generated, and it is pure ASCII.** Both of those are load-bearing:

- The natural frame is `┌─┐│└┘`, and those glyphs are missing from the
  subsetted mono face. They come back from a fallback at **1.55× the cell
  width** — measured — which bows every border out of true. Printable ASCII
  is the only set guaranteed to be one cell wide in any monospace font, so
  that is the whole palette. If you add a character, measure it first.
- Rows are described by what they are (`session`, `host`, `text`) and
  rendered with the padding computed. Typed-out art drifts a column the
  moment somebody edits a label, and colouring by character would tint the
  "o" in "grove-01" the same as a status mark.

Every line in a block must come out the same length — including the caption
under each panel, which is easy to forget because it sits outside the frame.
`fit()` clamps an over-long label so the failure is a truncated word rather
than a bent diagram. To check, count `[...new Set(lines.map(l => l.length))]`
in the console; it should have exactly one entry.

The travelling `*` on each wire is a positioned span animated with `steps()`.
Use the default (`jump-end`) timing: `steps(n, start)` shifts every tick one
cell along, which parks the last one on the closing bracket instead of the
final dot.

**The screen is a working demo, not a picture.** `Demo.tsx` opens on the
composer with three sessions under it, one in each state that matters, and
each opens into the screen the real product would give it:

The home screen leads with the composer, then a card for anything blocked —
name, question in the agent's own words, and one ember button into it — then a
plain list for everything else. A blocked session as a row is a coloured dot
you have to open a terminal to understand, and opening the terminal is most of
the cost of being interrupted.

| State | What the session screen does |
| --- | --- |
| Working | A terminal that never finishes, and `← Go back to sessions` |
| Needs you | The question it stopped on, and a box to answer it — type anything and it goes back to work |
| Ended | The Changes tab: a real diff, and a rail that commits, pushes and opens a pull request |

Launching your own adds a fourth. Everything is fake and none of it is a
recording — at 1250px a video would be soft, and the controls being real is
the part hardest to describe in a sentence.

**The working agent never finishes, and that is the argument.** A demo that
wraps up in eight seconds demonstrates a task; this one demonstrates the
product, which is what you do with the twenty minutes while the task runs.
Everything that is working keeps working while you are elsewhere in the demo,
because that is the claim. Output comes from `activity(i, seed)`, derived from
the tick index so the stream is endless without being random, seeded per
session so two never print the same thing, and capped at `KEEP` lines so an
hour-old tab is not a leak.

Copy and the diff live in `DemoData.ts`, apart from the layout, so they can be
read and edited without scrolling past markup.

The vocabulary is the product's own: the checklist labels are the ones the
control plane sends (`components/Steps.tsx` in the app), and the chips are the
composer's, glyphs included. If those change in the product, change them here.

The terminal shows what the agent actually prints on start: the welcome box,
then a line per tool call with its result indented underneath. The box is
drawn with a CSS border rather than the `╭─╮` characters it really uses —
those come back from a fallback face at 1.55× the cell width here and bow it
out of true, the same trap as the ASCII diagram.

Three things that will bite:

- Every phase has to fit the lid. The terminal pane and the inbox are both
  sized by hand for this reason; see the measuring note below.

- The demo session needs a name no other fake session uses, or it appears
  twice in the sidebar and twice in the inbox it lands in.
- The terminal's output pane is a fixed height and scrolls itself to the
  newest line. A pane that grows as lines arrive shunts the "it needs you"
  bar down the screen while you are reading it; on a phone the transcript is
  taller than the frame, so it has to follow the tail.
- **Every state has to finish inside the lid's solid region**, and they are
  different heights. The fade starts at 82% of the frame, so after touching
  any of this, measure the bottom of: the last session row (home), the reply
  box (needs you), the footer (working), and the action rail (ended). All four
  must clear `height * 0.82` at **390, 660, 760, 1024 and 1250** — the middle
  widths are the ones that catch you, because that is where the diff is
  already tall but the rail has not moved beside it yet. It is why the session
  header drops its metadata line on a phone, why the branch chip is `md:` and
  not `sm:`, and why the action rail lays its buttons out in a row on a phone.
  The pane scrolls when a state is taller than the lid, so nothing is ever
  unreachable — but the primary control of each state (`Open agent`, `Send`,
  `Commit and push`, the back link) must still land above the fade without
  scrolling.

**Third-party names.** The agent dropdown lists Claude Code, Codex and Open
Code, with only Claude Code selectable — the others carry the product's own
`· unavailable here` suffix, which is what the real composer does with an
agent that is not installed on the chosen machine. The diagram names agents
and cloud providers for the same reason. The prose everywhere else still says
"any coding agent", deliberately: it is the claim, not an omission.

**The screen leads, and it carries no heading.** The demo sits directly after
the hero, full width, with no eyebrow or title above it — the fastest way to
explain this thing is to show the one screen you spend your time in, and a
caption for something the reader can already see is just noise. The diagram
follows it, unnumbered, because it is the only section left to number.

**The laptop has no bottom.** Sides and top only; the lid runs off the end of
the section and dissolves into the page under a `mask-image`. That is why its
height is a fixed number rather than an aspect ratio — with the bottom edge
gone there is nothing left to be out of proportion, so the only question is
how much of the dashboard to show. (Drawn in full it came out at 1.19:1,
which reads as a monitor and undoes the frame entirely.) The fade holds solid
to 58% and is gone by 100%: earlier eats the session cards, later leaves a
hard edge that reads as a clipping bug.

**No screenshots.** The dashboard, terminal and phone are drawn in markup with
the real components' classes. They stay sharp at any density and never go stale,
but they will drift from the product if nobody moves them, so treat them as
illustrations rather than documentation.

**No third-party product names.** The copy says "any coding agent" throughout,
matching the repository's README. That is a deliberate constraint, not an
oversight.

**Do not cap a display heading with `ch`.** `ch` is the width of "0", which
in a condensed uppercase face is nothing like the average letter — a
`max-w-[22ch]` reads as roughly half the room it sounds like, and both section
titles were silently wrapping to three and four lines because of it. They are
broken by hand now, with a second break that only applies below `sm`, so each
one is two lines from 360px to 1600px.

**Grid items need `min-w-0`.** A `<pre>` inside a grid item will widen the
whole page on narrow screens without it. Worth remembering if a section with
a two-column layout ever comes back.
