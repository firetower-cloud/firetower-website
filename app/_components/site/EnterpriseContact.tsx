import { DISCORD_URL } from "../../_lib/site";

/** Use the site's established contact channel until a dedicated sales inbox is chosen. */
export function EnterpriseContact({
  label = "Discuss your deployment",
}: {
  label?: string;
}) {
  return (
    <a
      className="button"
      href={DISCORD_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
