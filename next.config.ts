import type { NextConfig } from "next";

/**
 * Every route here is static. Nothing on the marketing site reads a request,
 * so the whole thing is prerendered at build time and served as files — which
 * is also what makes it cheap to host anywhere the project ends up.
 *
 * `output: "export"` makes that literal: the build emits plain HTML, CSS and
 * JS into `out/`, with no Node server at all, which is what Firebase Hosting
 * uploads to its CDN. The moment any route needs a request — middleware, a
 * route handler, `cookies()`, ISR — this line has to go and the site needs a
 * real runtime behind it.
 */
const nextConfig: NextConfig = {
  output: "export",
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

export default nextConfig;
