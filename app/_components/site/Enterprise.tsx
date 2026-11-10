import Link from "next/link";
import { Building2, Users, FolderOpen, Puzzle, Bot, CreditCard, Server, PanelsTopLeft, Shapes } from "lucide-react";

const teams = [
  { name: "Engineering", people: ["AL", "MC", "JD"], role: "Editor", purpose: "Work with resources" },
  { name: "Product", people: ["SK", "RN"], role: "Viewer", purpose: "Read shared work" },
  { name: "Platform", people: ["LM", "AP"], role: "Admin", purpose: "Manage directory access" },
];
const resources = [
  { name: "Skills", icon: Puzzle },
  { name: "Agent profiles", icon: Bot },
  { name: "Subscriptions", icon: CreditCard },
  { name: "Machines", icon: Server },
  { name: "Workspaces", icon: PanelsTopLeft },
  { name: "Artifacts", icon: Shapes },
];

export function Enterprise() {
  return (
    <section className="enterprise-band">
      <div className="full-section shell" id="enterprise">
        <div className="full-heading governance-heading">
          <h2>Govern resources across your company.</h2>
          <p>Organize people into teams. Give each team the right access to shared resources.</p>
        </div>
        <figure className="company-access-diagram" aria-label="Company teams receive different permissions on a shared resource directory">
          <div className="company-node"><Building2 size={23} aria-hidden="true" /><div><h3>Your company</h3><p>People, organized into teams</p></div></div>
          <div className="company-trunk" aria-hidden="true" />
          <ul className="company-teams">
            {teams.map(team => (
              <li key={team.name}>
                <div className="people-team"><div className="people-team-title"><Users size={19} aria-hidden="true" /><h4>{team.name}</h4></div><div className="people-team-members" aria-label="Example team members">{team.people.map(person => <span key={person} aria-hidden="true">{person}</span>)}<small>People team</small></div></div>
                <div className="team-access"><strong>{team.role}</strong><span>{team.purpose}</span></div>
              </li>
            ))}
          </ul>
          <div className="directory-trunk" aria-hidden="true" />
          <div className="shared-directory">
            <div className="shared-directory-heading"><FolderOpen size={22} aria-hidden="true" /><div><h4>Shared directory</h4><p>Resources inherit the access you set here.</p></div></div>
            <ul className="governed-resources">{resources.map(({ name, icon: Icon }) => <li key={name}><Icon size={21} strokeWidth={1.5} aria-hidden="true" /><span>{name}</span></li>)}</ul>
          </div>
          <figcaption>Grant access to a team once. Its members can reach the resources in that directory.</figcaption>
        </figure>
        <div className="governance-followup"><p>Need an exception? Give a person Viewer or Editor access to a single resource.</p><Link className="text-link" href="/docs/sharing">How sharing and permissions work</Link></div>
      </div>
    </section>
  );
}
