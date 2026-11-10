import { ENTERPRISE_BOOKING_URL } from "../../_lib/site";

/** Shared booking destination for every Enterprise contact action. */
export function EnterpriseContact({
  label = "Discuss your deployment",
}: {
  label?: string;
}) {
  return (
    <a
      className="button"
      href={ENTERPRISE_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
