/* The approved wordmark is embedded directly; no network or system fonts. */
/* eslint-disable @next/next/no-img-element */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
export const OG_SIZE = { width: 1200, height: 630 };
export const X_SIZE = { width: 1200, height: 600 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "Firetower — Run AI coding teams on your own infrastructure, 24/7.";

export function renderOgImage({ title, description, section, label = section ? "Documentation" : undefined, footer, path = "usefiretower.com", format = "og" }: {
  title: string;
  description?: string;
  section?: string;
  label?: string;
  footer?: string;
  path?: string;
  format?: "og" | "x";
}) {
  const font = readFileSync(join(process.cwd(), "app/_lib/fonts/dm-sans.ttf"));
  const wordmark = readFileSync(join(process.cwd(), "public/brand/wordmark.svg"), "utf8");
  const symbol = readFileSync(join(process.cwd(), "public/brand/symbol.svg"), "utf8").replaceAll("#111110", "#DEDEDA");
  const data = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const docs = Boolean(section);
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F8F8F7", color: "#111110", padding: "48px 64px 36px", fontFamily: "DM Sans", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={data(wordmark)} width={256} height={50} alt="Firetower" />
        {docs && <span style={{ fontSize: 21, color: "#5C5B58" }}>{label}</span>}
      </div>
      <img src={data(symbol)} width={200} height={250} alt="" style={{ position: "absolute", right: 52, top: docs ? 225 : 198 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingTop: 18, paddingBottom: 22, maxWidth: 850 }}>
        {docs && <div style={{ fontSize: 20, color: "#5C5B58", marginBottom: 20 }}>{section}</div>}
        <div style={{ fontSize: docs ? (title.length > 42 ? 60 : 72) : 67, fontWeight: 500, lineHeight: 1.08, letterSpacing: -2.8, maxWidth: 820 }}>{title}</div>
        {description && <div style={{ marginTop: 22, fontSize: 24, lineHeight: 1.4, color: "#5C5B58", maxWidth: 790 }}>{description}</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #C7C6C2", paddingTop: 22, fontSize: 18, color: "#5C5B58" }}>
        <span>{footer ?? (docs ? "Firetower docs" : "Built for enterprise. Unopinionated harness, model agnostic.")}</span>
        <span>{path}</span>
      </div>
    </div>,
    { ...(format === "x" ? X_SIZE : OG_SIZE), fonts: [{ name: "DM Sans", data: font, weight: 500, style: "normal" }] },
  );
}
