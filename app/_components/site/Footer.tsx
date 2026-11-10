import Link from "next/link";
export function Footer() {
  return (
    <footer className="shell site-footer">
      <span>© {new Date().getFullYear()} Westlabs LLC</span>
      <nav aria-label="Footer">
        <Link href="/docs">Documentation</Link>
        <a href="https://github.com/firetower-cloud/firetower">GitHub</a>
        <a href="https://discord.gg/Y2HYVEhSc">Contact us</a>
        <a href="https://github.com/firetower-cloud/firetower/blob/main/LICENSE">
          AGPL-3.0
        </a>
      </nav>
    </footer>
  );
}
