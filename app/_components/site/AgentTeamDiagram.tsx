import { translator, type LocalizedProps } from "../../_lib/i18n";
import { Bot, Server, Laptop, GitBranch } from "lucide-react";

const specialists = [
  { role: "Engineer", agent: "Codex", machine: "OVH", local: false },
  { role: "Security Advisor", agent: "Kimi", machine: "GCP", local: false },
  { role: "QA", agent: "Cursor Agent", machine: "Mac mini", local: true },
];

function AgentNode({
  role,
  agent,
  machine,
  local = false,
  locale = "en",
}: (typeof specialists)[number] & LocalizedProps) {
  const t = translator(locale);
  const Machine = local ? Laptop : Server;
  return (
    <div className="team-node">
      <div className="team-node-role">
        <Bot size={20} aria-hidden="true" />
        <h3>{t(role)}</h3>
      </div>
      <dl>
        <div>
          <dt>Agent</dt>
          <dd>{agent}</dd>
        </div>
        <div>
          <dt>Machine</dt>
          <dd>
            <Machine size={14} aria-hidden="true" />
            {machine}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function AgentTeamDiagram({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <figure
      className="agent-team-diagram"
      aria-label={t(
        "An orchestrator delegates to three specialists, each with its own agent and machine",
      )}
    >
      <div className="team-orchestrator">
        <AgentNode
          locale={locale}
          role="Orchestrator"
          agent="Claude Code"
          machine="VPS · OVH"
          local={false}
        />
      </div>
      <div className="team-delegation">
        <GitBranch size={15} aria-hidden="true" />
        <span>{t("Delegates to")}</span>
      </div>
      <ul className="team-specialists">
        {specialists.map((specialist) => (
          <li key={specialist.role}>
            <AgentNode locale={locale} {...specialist} />
          </li>
        ))}
      </ul>
      <figcaption>
        {t("One team. Different agents. Your choice of machines.")}
      </figcaption>
    </figure>
  );
}
