import { ImageResponse } from "next/og";

/**
 * `output: "export"` has no server to run this at request time, so the
 * image is rendered once at build time and emitted as a file.
 */
export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon. iOS masks the corners itself, so this is a full bleed. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F8F7",
        }}
      >
        <svg width="100" height="125" viewBox="0 0 64 80">
          <g fill="none" stroke="#111110" strokeWidth="3.1">
            <path d="M7 25 32 7l25 18H7Z" />
            <path d="M17 25v19h30V25M23 44 13 73M41 44l10 29M18 59h28" />
          </g>
          <rect x="29" y="31" width="6" height="6" fill="#111110" />
        </svg>
      </div>
    ),
    size,
  );
}
