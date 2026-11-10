import Link from "next/link";
export function EnterpriseCallout() {
  return (
    <aside
      className="enterprise-services-callout shell"
      aria-labelledby="enterprise-services-title"
    >
      <div>
        <h2 id="enterprise-services-title">
          Deploy with the people building Firetower.
        </h2>
        <p>Get help with deployment, agent workflows, and ongoing support.</p>
      </div>
      <Link className="button outline" href="/enterprise">
        Explore enterprise services
      </Link>
    </aside>
  );
}
