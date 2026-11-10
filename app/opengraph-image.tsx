import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE, OG_ALT } from "./_lib/og";
import { TAGLINE } from "./_lib/site";
export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = OG_ALT;
export default function Image() { return renderOgImage({ title: TAGLINE }); }
