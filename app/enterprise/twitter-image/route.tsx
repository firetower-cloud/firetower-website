import { renderOgImage } from "../../_lib/og";
export const dynamic = "force-static";
export function GET() {
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
