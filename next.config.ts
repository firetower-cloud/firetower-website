import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Every route here is static. Nothing on the site reads a request, so the whole
 * thing is prerendered at build time and served as files — which is also what
 * makes it cheap to host anywhere the project ends up.
 */
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  compress: true,
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
