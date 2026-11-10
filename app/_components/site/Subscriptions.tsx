"use client";
import { translator, type LocalizedProps } from "../../_lib/i18n";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Pause, Play, RotateCcw, Route, Check } from "lucide-react";

const accounts = [
  { agent: "Claude Code", name: "Your primary subscription" },
  { agent: "Claude Code", name: "Your backup subscription" },
  { agent: "Codex", name: "Your alternative subscription" },
];
const duration = 12000;
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotion = () => true;

export function Subscriptions({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  const diagram = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    reducedMotion,
    serverMotion,
  );
  const finished = elapsed >= duration;
  const playing = visible && !paused && !reduceMotion && !finished;
  const active = elapsed < 4500 ? 0 : elapsed < 9000 ? 1 : 2;
  const switching =
    (elapsed >= 3600 && elapsed < 4500) || (elapsed >= 8100 && elapsed < 9000);
  const usage = [
    Math.min(100, 72 + (elapsed / 3600) * 28),
    elapsed < 4500 ? 38 : Math.min(100, 38 + ((elapsed - 4500) / 3600) * 62),
    elapsed < 9000 ? 18 : Math.min(32, 18 + ((elapsed - 9000) / 3000) * 14),
  ];
  const message =
    elapsed < 3600
      ? t("Work runs on your primary Claude Code subscription.")
      : elapsed < 4500
        ? t("Primary limit reached. Routing to your backup.")
        : elapsed < 8100
          ? t(
              "Claude Code resumes the conversation on your backup subscription.",
            )
          : elapsed < 9000
            ? t("Backup limit reached. Routing to Codex.")
            : t(
                "Codex starts a new conversation with a handoff. Your workspace files stay in place.",
              );

  useEffect(() => {
    const element = diagram.current;
    if (!element) return;
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = now - previous;
      previous = now;
      setElapsed((value) => Math.min(duration, value + delta));
    }, 80);
    return () => window.clearInterval(timer);
  }, [playing]);

  function replay() {
    setElapsed(0);
    setPaused(false);
  }
  function next() {
    setPaused(true);
    setElapsed(active === 0 ? 4500 : duration);
  }

  return (
    <section className="full-section shell" id="subscriptions">
      <div className="account-layout">
        <div className="account-copy">
          <h2>{t("Bring your own subscriptions.")}</h2>
          <p>
            {t(
              "Connect your Claude Code, Codex and other supported accounts. Firetower handles subscription routing and rotation.",
            )}
          </p>
          <div className="account-explain">
            <p>
              <strong>{t("Your subscriptions.")}</strong>{" "}
              {t("Use the accounts you already pay for.")}
            </p>
            <p>
              <strong>{t("Your routing rules.")}</strong>{" "}
              {t("Choose the accounts and their fallback order.")}
            </p>
            <p>
              <strong>{t("Automatic rotation.")}</strong>{" "}
              {t(
                "Enable fallback. When an account reaches its limit, Firetower moves to the next one.",
              )}
            </p>
          </div>
          <Link className="text-link" href="/docs/fallback">
            {t("Configure subscription routing")}
          </Link>
        </div>
        <div
          ref={diagram}
          className={`subscription-routing${playing ? " is-playing" : ""}`}
        >
          <div className="routing-heading">
            <span>{t("Subscription routing")}</span>
            <span className="routing-enabled">
              <Check size={13} aria-hidden="true" />
              {t("Auto-rotation on")}
            </span>
          </div>
          <div
            className="routing-diagram"
            aria-label={t(
              "Firetower routes work through your subscriptions in the order you choose",
            )}
          >
            <div className="routing-source">
              <div>
                <Route size={26} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <strong>Firetower</strong>
              <span>{t("Your routing rules")}</span>
            </div>
            <div className="routing-wires" aria-hidden="true">
              <svg viewBox="0 0 64 330" preserveAspectRatio="none">
                {[
                  "M0 165H18Q28 165 28 155V65Q28 55 38 55H64",
                  "M0 165H64",
                  "M0 165H18Q28 165 28 175V265Q28 275 38 275H64",
                ].map((path, i) => (
                  <g
                    key={path}
                    className={active === i && !switching ? "selected" : ""}
                  >
                    <path className="routing-wire" d={path} />
                    <path
                      className="routing-packet"
                      d={path}
                      pathLength="100"
                    />
                  </g>
                ))}
              </svg>
            </div>
            <ol className="routing-accounts">
              {accounts.map((account, i) => {
                const limited = i < active || (i === active && switching);
                return (
                  <li
                    key={t(account.name)}
                    className={`${active === i && !switching ? "selected" : ""}${limited ? " limited" : ""}`}
                    aria-current={
                      i === active && !switching ? "step" : undefined
                    }
                  >
                    <div className="routing-account-title">
                      <span className="routing-position">{i + 1}</span>
                      <strong>{account.agent}</strong>
                      <span className="routing-account-state">
                        {limited
                          ? t("Limit reached")
                          : active === i
                            ? t("In use")
                            : t("Ready")}
                      </span>
                    </div>
                    <p>{t(account.name)}</p>
                    <div
                      className="routing-usage"
                      role="meter"
                      aria-label={`${t(account.name)}: example usage`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(usage[i])}
                    >
                      <span style={{ width: `${usage[i]}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div
            className="routing-status"
            aria-live={playing ? "off" : "polite"}
          >
            <span
              className={
                switching
                  ? "routing-status-dot switching"
                  : "routing-status-dot"
              }
            />
            <p>{message}</p>
          </div>
          <div className="routing-controls">
            <span>{t("Example usage")}</span>
            <div>
              {!reduceMotion && !finished && (
                <button
                  onClick={() => setPaused(!paused)}
                  aria-label={
                    paused
                      ? t("Play routing animation")
                      : t("Pause routing animation")
                  }
                >
                  {paused ? (
                    <Play size={14} aria-hidden="true" />
                  ) : (
                    <Pause size={14} aria-hidden="true" />
                  )}
                  {paused ? t("Play") : t("Pause")}
                </button>
              )}
              {active < 2 ? (
                <button onClick={next}>
                  {t("Reach a limit")}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              ) : (
                <button onClick={replay}>
                  <RotateCcw size={14} aria-hidden="true" />
                  {t("Replay")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
