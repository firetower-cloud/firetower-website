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

  // The docs moved under /docs/self-hosting when the cloud option appeared.
  // Cheap insurance: a redirect is one line, a 404 in a bookmark is not.
  async redirects() {
    const moved: Record<string, string> = {
      "self-host": "self-hosting",
      install: "self-hosting/app/install",
      domain: "self-hosting/domain",
      hosts: "self-hosting/machines/install",
      operations: "self-hosting/operations",
      "self-hosting/install": "self-hosting/app/install",
      "self-hosting/machines": "self-hosting/machines/install",
    };
    return Object.entries(moved).map(([from, to]) => ({
      source: `/docs/${from}`,
      destination: `/docs/${to}`,
      permanent: true,
    }));
  },
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
