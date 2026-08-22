import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Every route here is static. Nothing on the site reads a request, so the whole
 * thing is prerendered at build time and served as files — which is also what
 * makes it cheap to host anywhere the project ends up.
 *
 * `output: "export"` makes that literal: the build emits plain HTML, CSS and
 * JS into `out/`, with no Node server at all, which is what Firebase Hosting
 * uploads to its CDN. The moment any route needs a request — middleware, a
 * route handler, `cookies()`, ISR — this line has to go and the site needs a
 * real runtime behind it.
 *
 * The docs' redirects live in `firebase.json` rather than here, for the same
 * reason: `redirects()` is served by a Node server this deployment does not
 * have, and Next drops it from an export with a warning rather than an error.
 */
const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  compress: true,

  // Without this, Turbopack walks up looking for a lockfile, finds the one in
  // the home directory, and infers a workspace root containing everything the
  // user owns. Pin the root to this project.
  turbopack: { root: import.meta.dirname },

  // Static export has no image optimisation server. The site ships its own
  // assets at the sizes it needs, so this only disables a feature nothing uses.
  images: { unoptimized: true },
};

/**
 * Plugins are named as strings on purpose.
 *
 * Next builds with Turbopack, which runs the MDX pipeline in Rust and can only
 * be handed serializable options — a JavaScript function cannot cross that
 * boundary. So the usual `rehype-pretty-code` config with `onVisitLine`
 * callbacks is out, and anything that needs one has to move into a component
 * in `mdx-components.tsx` instead.
 *
 * `vesper` because it is the one bundled Shiki theme that is warm rather than
 * blue, which is the whole point of this palette.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [
      ["rehype-slug", {}],
      ["rehype-pretty-code", { theme: "vesper", keepBackground: false }],
    ],
  },
});

export default withMDX(nextConfig);
