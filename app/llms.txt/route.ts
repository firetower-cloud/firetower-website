import { DOCS, href } from "../docs/_lib/nav";
import { NAME, SITE_URL, SUMMARY, TAGLINE, REPO_URL, LICENSE } from "../_lib/site";

/**
 * llms.txt — the site in one plain-text file, for anything that would rather
 * read markdown than parse a page.
 *
 * Built from the docs manifest like everything else, so it cannot list a page
 * that does not exist or miss one that does.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${NAME}

> ${TAGLINE}

${SUMMARY}

It runs on hardware you already have. There is no account, no telemetry
endpoint, and no hosted service in the loop. ${LICENSE}.

## Documentation

${DOCS.filter((d) => d.slug)
  .map((d) => `- [${d.title}](${SITE_URL}${href(d.slug)}): ${d.description}`)
  .join("\n")}

## Source

- [Repository](${REPO_URL}): the control plane, the worker, and the protocol
  between them.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
