import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE, OG_ALT } from "./_lib/og";

/**
 * `output: "export"` has no server to run this at request time, so the
 * image is rendered once at build time and emitted as a file.
 */
export const dynamic = "force-static";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = OG_ALT;

export default function Image() {
  return renderOgImage({
    eyebrow: "Control plane for coding agents",
    title: "Run any coding agent, on your own servers, from anywhere.",
  });
}
