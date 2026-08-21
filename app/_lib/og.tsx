/**
 * The social card.
 *
 * Satori (what next/og renders with) does not read WOFF2, and the product's
 * faces are only checked in as WOFF2 — so rather than ship a second copy of
 * Archivo in another format for one image, the card leans on next/og's
 * bundled face and gets its character from colour, the tower mark, and the
 * ridgeline. Hierarchy comes from size and colour, not weight.
 */
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "Firetower — run any coding agent on your own servers";

const GROUND = "#0a0908";
const BONE = "#f4f0e9";
const DIM = "#948c83";
const MUTE = "#6b645d";
const EMBER = "#ff6b2c";
const LINE = "#262320";

export function renderOgImage({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 76px",
          background: GROUND,
          position: "relative",
        }}
      >
        {/* Ember on the horizon. A linear band rather than a radial glow:
            Satori renders radial gradients with a visible seam at this size. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 300,
            background:
              "linear-gradient(0deg, rgba(255,107,44,0.22), rgba(255,107,44,0.05) 52%, rgba(255,107,44,0) 100%)",
          }}
        />

        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="42" height="42" viewBox="0 0 20 20" fill="none">
            <path d="M4.4 19L7 9.6M15.6 19L13 9.6" stroke={BONE} strokeWidth="1.3" strokeLinecap="round" />
            <path d="M6.1 14.4h7.8" stroke={BONE} strokeWidth="1.1" strokeLinecap="round" opacity=".55" />
            <path d="M6.4 9.4h7.2v-3H6.4z" stroke={BONE} strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M4.8 6.4L10 2.2l5.2 4.2" stroke={BONE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="7.9" r="1.15" fill={EMBER} />
          </svg>
          <div style={{ display: "flex", fontSize: 22, color: BONE, letterSpacing: 6 }}>
            FIRETOWER
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow ? (
            <div style={{ display: "flex", fontSize: 20, color: EMBER, letterSpacing: 4 }}>
              {eyebrow.toUpperCase()}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 66,
              lineHeight: 1.06,
              color: BONE,
              letterSpacing: "-2px",
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: DIM, maxWidth: 820 }}>
            Open source. Self-hosted. No account.
          </div>
        </div>

        {/* Footer rule and the ridgeline the whole brand rests on */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", height: 1, width: "100%", background: LINE }} />
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", fontSize: 20, color: MUTE }}>
              github.com/firetower-cloud/firetower
            </div>
            <div style={{ display: "flex", fontSize: 20, color: MUTE }}>AGPL-3.0</div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
