import { ListFilter, GitPullRequest, CheckCheck, ShieldCheck, BookOpen, BriefcaseBusiness } from "lucide-react";

const workflows = [
  { title: "Task triage", description: "Sort incoming issues, group duplicates and identify the next steps.", icon: ListFilter },
  { title: "Ticket to code", description: "Turn an issue into a code change, tests and a pull request for review.", icon: GitPullRequest },
  { title: "QA", description: "Test changes, reproduce failures and report what needs attention.", icon: CheckCheck },
  { title: "Security analysis", description: "Investigate vulnerabilities and bring back findings with evidence.", icon: ShieldCheck },
  { title: "Documentation", description: "Keep guides and examples in step with the code.", icon: BookOpen },
  { title: "Operations", description: "Prepare weekly business reports. Turn meeting notes into clear follow-up tasks.", icon: BriefcaseBusiness },
];

export function Workflows() {
  return (
    <section className="full-section shell" id="tour">
      <div className="full-heading">
        <h2>AI Agents for any usecase.</h2>
        <p>Put your agents to work around the clock. You set the task, the team and its permissions.</p>
      </div>
      <div className="usecase-grid">
        {workflows.map(({ title, description, icon: Icon }) => (
          <article className="usecase" key={title}>
            <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
