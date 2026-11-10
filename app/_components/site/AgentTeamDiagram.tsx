import { Bot, Server, Laptop, GitBranch } from "lucide-react";

const specialists = [
  { role: "Engineer", agent: "Codex", machine: "OVH", local: false },
  { role: "Security Advisor", agent: "Kimi", machine: "GCP", local: false },
  { role: "QA", agent: "Cursor Agent", machine: "Mac mini", local: true },
];

function AgentNode({ role, agent, machine, local = false }: typeof specialists[number]) {
  const Machine = local ? Laptop : Server;
  return (
    <div className="team-node">
      <div className="team-node-role"><Bot size={20} aria-hidden="true" /><h3>{role}</h3></div>
      <dl>
        <div><dt>Agent</dt><dd>{agent}</dd></div>
        <div><dt>Machine</dt><dd><Machine size={14} aria-hidden="true" />{machine}</dd></div>
      </dl>
    </div>
  );
}

export function AgentTeamDiagram() {
  return (
    <figure className="agent-team-diagram" aria-label="An orchestrator delegates to three specialists, each with its own agent and machine">
      <div className="team-orchestrator"><AgentNode role="Orchestrator" agent="Claude Code" machine="VPS · OVH" local={false} /></div>
      <div className="team-delegation"><GitBranch size={15} aria-hidden="true" /><span>Delegates to</span></div>
      <ul className="team-specialists">
        {specialists.map(specialist => <li key={specialist.role}><AgentNode {...specialist} /></li>)}
      </ul>
      <figcaption>One team. Different agents. Your choice of machines.</figcaption>
    </figure>
  );
}
