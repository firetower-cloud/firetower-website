import { DOCS, SECTION_ORDER } from "../docs/_lib/nav";
import { NAME, SITE_URL, SUMMARY, REPO_URL, LICENSE, DISCORD_URL } from "../_lib/site";

/** Generated from the same manifest as the documentation navigation. */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${NAME}

> Firetower runs teams of AI agents on infrastructure you control. Built for enterprise, with an unopinionated harness and a choice of agents and models.

${SUMMARY}

Firetower connects three parts: a client app, a self-hosted control plane, and worker machines that run agents. Closing the client does not stop work running on a worker. Workers should run separately from the control-plane server.

Supported agents include Claude Code, Codex, Kimi, Cursor Agent and Mistral Vibe. Bring your own supported subscriptions or API credentials. Account fallback is optional: a same-agent switch resumes its conversation; switching agents starts a new conversation with a handoff. Provider limits and terms still apply.

An agent profile saves instructions, skills and execution settings. A workspace holds the work and can use one or more repositories, or none. Agent teams delegate to subagents in sub-workspaces. People and teams can share resources through directories and individual permissions. Use cases include coding, QA, security analysis, documentation and operations.

The Markdown guides below are generated from the published documentation on each build. Follow the relevant guide for exact steps and supported behavior. Product screenshots use sample data; they are not evidence that an installation, backup or upgrade has completed. The source is licensed under ${LICENSE}.

${SECTION_ORDER.map((section) => `## ${section}\n\n${DOCS.filter((d) => d.section === section).map((d) => `- [${d.title}](${SITE_URL}/docs/${d.slug || "index"}.md): ${d.description}`).join("\n")}`).join("\n\n")}

## Optional

- [Complete documentation](${SITE_URL}/llms-full.txt): All documentation in one Markdown file. Prefer individual guides for focused questions.
- [Website](${SITE_URL}): Product overview and downloads.
- [Source repository](${REPO_URL}): Application source, issues and releases.
- [Community support](${DISCORD_URL}): Firetower Discord.
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
