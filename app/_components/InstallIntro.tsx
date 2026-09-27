import styles from "./InstallIntro.module.css";

const platforms = ["macOS", "Windows", "iOS", "Android"] as const;
type Platform = (typeof platforms)[number];

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "macOS") return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.9 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3.1-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2-.7 1.1-1 2.7-.7 4.2.3 1.7 1.1 3.4 2.2 4.6.5.6 1.1 1.3 1.9 1.2.8 0 1.1-.5 2.7-.5 1.5 0 1.8.5 2.6.5.8 0 1.4-.7 1.9-1.3.6-.7.9-1.3 1.4-2.2-2-.8-2.3-2.6-2.3-3.3ZM14.8 6.3c.5-.7.9-1.7.8-2.6-1 .1-2 .7-2.6 1.4-.5.6-1 1.6-.9 2.5 1 .1 2.1-.5 2.7-1.3Z"/></svg>
  );
  if (platform === "Windows") return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 4.7 10.8 3v8.1H2V4.7Zm10-1.9L22 1v10.1H12V2.8ZM2 12.4h8.8v8.1L2 19v-6.6Zm10 0h10V23l-10-1.8v-8.8Z"/></svg>
  );
  if (platform === "iOS") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.1" y="2.2" width="11.8" height="19.6" rx="2.4" stroke="currentColor" strokeWidth="1.6"/><path d="M10 4.7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="12" cy="19.1" r=".9" fill="currentColor"/></svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7.2 4.6-1.5-2M16.8 4.6l1.5-2M5.6 10.2a6.4 6.4 0 0 1 12.8 0v.2H5.6v-.2ZM5.3 11.8h13.4v6.3c0 .7-.5 1.2-1.2 1.2h-11c-.7 0-1.2-.5-1.2-1.2v-6.3ZM3.3 12.1v5M20.7 12.1v5M8.8 19.3v2.2M15.2 19.3v2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9.2" cy="7.6" r=".6" fill="currentColor"/><circle cx="14.8" cy="7.6" r=".6" fill="currentColor"/></svg>
  );
}

export function InstallIntro() {
  return (
    <div className={styles.block}>
      <div className={styles.header}><span className={styles.live} /> INSTALL / YOUR SERVER</div>
      <p className={styles.title}>Install Firetower on your server</p>
      <div className={styles.command}><span aria-hidden="true">$</span><code>curl -fsSL https://usefiretower.com/install.sh<wbr /> | sh</code></div>
      <div className={styles.clients}>
        <p>Clients available for</p>
        <div className={styles.platforms}>
          {platforms.map((platform) => <span className={styles.platform} key={platform}><PlatformIcon platform={platform} />{platform}</span>)}
        </div>
      </div>
    </div>
  );
}
