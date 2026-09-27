import styles from "./Performance.module.css";

const COMPARISONS = [
  {
    name: "Desktop",
    saving: "30× more efficient",
    comparable: true,
    firetowerLabel: "Firetower Desktop",
    firetower: "~50 MB",
    orcaLabel: "Orca app + daemon · reported idle",
    orca: "~1.5 GB",
    width: "3.333%",
    source: "https://github.com/stablyai/orca/issues/5386",
    sourceLabel: "macOS user report",
  },
  {
    name: "Agent worker",
    saving: "100× more efficient",
    comparable: true,
    firetowerLabel: "Firetower worker · agent CLI separate",
    firetower: "5 MB",
    orcaLabel: "Orca agent process · reported",
    orca: "~500 MB / agent",
    width: "1%",
    source: "https://github.com/stablyai/orca/issues/5386",
    sourceLabel: "macOS user report",
  },
  {
    name: "Server",
    saving: "5× more efficient",
    comparable: true,
    firetowerLabel: "Firetower control plane",
    firetower: "200 MB",
    orcaLabel: "Orca service · reported after restart",
    orca: "~1 GB",
    width: "20%",
    source: "https://github.com/stablyai/orca/issues/16084",
    sourceLabel: "Linux user report",
  },
] as const;

export function Performance() {
  return (
    <section className={styles.section} aria-labelledby="performance-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className="eyebrow">Small by design</p>
          <h2 id="performance-heading" className={`${styles.heading} display`}>
            Written<br />in Rust<span>.</span>
          </h2>
          <p className={styles.lead}>By far the most efficient ADE on the market.</p>
          <p className={styles.detail}>
            A small core, no accumulating terminal daemons, and workspace memory ceilings
            where the host supports them. Built for work that keeps running.
          </p>
        </div>

        <div className={styles.instrument}>
          <div className={styles.instrumentTop}>
            <span>Firetower / resource profile</span>
            <span className={styles.live}><i /> NATIVE</span>
          </div>

          <div className={styles.comparison}>
            <div className={styles.chartHeading}>
              <span>RAM footprint</span>
              <span>Firetower / Orca</span>
            </div>
            {COMPARISONS.map((item) => (
              <div className={styles.compareGroup} key={item.name}>
                <div className={styles.groupHead}>
                  <div className={styles.groupTitle}>
                    <h3>{item.name}</h3>
                    <span className={item.comparable ? styles.saving : styles.scope}>{item.saving}</span>
                  </div>
                  <a href={item.source} target="_blank" rel="noreferrer noopener">{item.sourceLabel} ↗</a>
                </div>
                <div className={styles.chartRow}>
                  <div className={styles.chartLabel}><span>{item.firetowerLabel}</span><strong>{item.firetower}</strong></div>
                  <div className={styles.barTrack}><span className={styles.firetowerBar} style={{ width: item.width }} /></div>
                </div>
                <div className={styles.chartRow}>
                  <div className={styles.chartLabel}><span>{item.orcaLabel}</span><strong>{item.orca}</strong></div>
                  <div className={styles.barTrack}><span className={styles.otherBar} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.instrumentFoot}>
            <span>SMALL BY DESIGN</span>
            <span>03 / 03</span>
          </div>
        </div>
      </div>
    </section>
  );
}
