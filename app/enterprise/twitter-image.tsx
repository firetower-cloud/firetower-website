import { renderOgImage, X_SIZE, OG_CONTENT_TYPE } from "../_lib/og";
export const dynamic = "force-static";
export const size = X_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Firetower Enterprise — Your infrastructure. Our expertise. Deployment, agent workflows and support.";
export default function Image() {
  return renderOgImage({
    title: "Your infrastructure. Our expertise.",
    description:
      "Deployment, agent workflows and support from the Firetower team.",
    section: "Firetower for enterprise",
    label: "Enterprise",
    footer: "Free to self-host. Expert help when you need it.",
    path: "usefiretower.com/enterprise",
    format: "x",
  });
}
