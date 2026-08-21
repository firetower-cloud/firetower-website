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
          background: "#0c0b0a",
        }}
      >
        <svg width="122" height="122" viewBox="0 0 20 20" fill="none">
          <path d="M4.4 19L7 9.6M15.6 19L13 9.6" stroke="#f4f0e9" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M6.1 14.4h7.8" stroke="#f4f0e9" strokeWidth="1.1" strokeLinecap="round" opacity=".55" />
          <path d="M6.4 9.4h7.2v-3H6.4z" stroke="#f4f0e9" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M4.8 6.4L10 2.2l5.2 4.2" stroke="#f4f0e9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="7.9" r="1.4" fill="#ff6b2c" />
        </svg>
      </div>
    ),
    size,
  );
}
