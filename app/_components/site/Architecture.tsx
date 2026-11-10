"use client";
/* Approved website design, implemented as React components. */
import { translator, type LocalizedProps } from "../../_lib/i18n";
import { useState, useEffect, useRef } from "react";
export function Architecture({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  const diagram = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = diagram.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          element.classList.toggle("in-view", entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const [off, setOff] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState(
    t("Try closing the laptop. The agents run elsewhere."),
  );
  const labels: Record<string, string> = {
    laptop: t("laptop"),
    server: t("Firetower server"),
    host0: t("Mac mini · Office"),
    host1: t("Hetzner server"),
    host2: t("OVH server"),
    agent0: t("code agent"),
    agent1: t("QA agent"),
    agent2: t("documentation agent"),
  };
  const isOff = (key: string) =>
    Boolean(
      off[key] || (key.startsWith("agent") && off["host" + key.slice(-1)]),
    );
  function toggle(key: string) {
    const stopped = !off[key];
    setOff({ ...off, [key]: stopped });
    if (key === t("laptop"))
      setMessage(
        stopped
          ? t(
              "Your laptop is closed. Agents keep working on your connected machines.",
            )
          : t("Your laptop reconnects to the same work."),
      );
    else if (key === "server")
      setMessage(
        stopped
          ? t(
              "Existing agents keep working. Workers log locally; live coordination waits for the server.",
            )
          : t("The server reconnects and catches up from worker logs."),
      );
    else if (key.startsWith("host")) {
      const next = { ...off, [key]: stopped };
      if (stopped) next["agent" + key.slice(-1)] = true;
      setOff(next);
      setMessage(
        stopped
          ? labels[key] +
              t(
                " is offline. Its agent stops; the other machines are unaffected.",
              )
          : labels[key] +
              t(" is back. Restart its agent from the retained workspace."),
      );
    } else
      setMessage(
        stopped
          ? t(
              "This agent stops. Its files remain; the other agents are unaffected.",
            )
          : off["host" + key.slice(-1)]
            ? t("The agent is ready to restart when its machine comes back.")
            : t("The agent is restarted in its existing workspace."),
      );
  }

  return (
    <section className="full-section shell" id="architecture">
      <div className="architecture-layout">
        <div className="architecture-copy">
          <h2>
            {t("Close your laptop.")}
            <br />
            {t("The work continues.")}
          </h2>
          <p>
            {t(
              "Agents run on your machines. Firetower’s server coordinates the work. Your devices let you pick it up.",
            )}
          </p>
          <div className="architecture-points">
            <div>
              <strong>{t("Independent by design")}</strong>
              <p>
                {t(
                  "A disconnected device or server leaves existing agents running.",
                )}
              </p>
            </div>
            <div>
              <strong>{t("Failures stay contained")}</strong>
              <p>
                {t(
                  "If a machine stops, other machines keep working. Files stay in their workspaces.",
                )}
              </p>
            </div>
          </div>
          <div className="architecture-outcome" aria-live="polite">
            <strong id="active-count">
              {[0, 1, 2].filter((i) => !isOff(`agent${i}`)).length + " / 3"}
            </strong>
            <span>{t("agents running")}</span>
            <p id="fault-description">{message}</p>
          </div>
        </div>
        <div className="architecture-demo" ref={diagram}>
          <div className="architecture-toolbar">
            <span>{t("Try an interruption")}</span>
            <button
              id="restore-system"
              onClick={() => {
                setOff({});
                setMessage(
                  t(
                    "All components restored. Agents restarted in their existing workspaces.",
                  ),
                );
              }}
            >
              {t("Restore all")}
            </button>
          </div>
          <div className="client-row">
            <button
              className={
                "infra-node device-node" + (isOff(t("laptop")) ? " off" : "")
              }
              aria-pressed={Boolean(off.laptop)}
              aria-label={
                (off.laptop ? t("Restore ") : t("Stop ")) + labels.laptop
              }
              onClick={() => toggle(t("laptop"))}
            >
              <svg viewBox="0 0 24 24">
                <rect x="4" y="3" width="16" height="13" rx="1.5"></rect>
                <path d="M2 20h20l-2-4H4l-2 4Z"></path>
              </svg>
              <span>{t("Laptop")}</span>
              <small id="state-laptop">
                {off.laptop
                  ? t("Closed")
                  : off.server
                    ? t("Waiting for server")
                    : t("Connected")}
              </small>
            </button>
            <div className="infra-node device-node">
              <svg viewBox="0 0 24 24">
                <rect x="6" y="2" width="12" height="20" rx="3"></rect>
                <path d="M10 18h4"></path>
              </svg>
              <span>{t("Phone")}</span>
              <small id="state-phone">
                {off.server ? t("Waiting for server") : t("Connected")}
              </small>
            </div>
          </div>
          <div
            className={"infra-wire" + (off.server ? " off" : "")}
            id="device-wire"
          ></div>
          <div className="infra-label">{t("Control plane")}</div>
          <button
            className={
              "infra-node control-node" + (isOff("server") ? " off" : "")
            }
            aria-pressed={Boolean(off.server)}
            aria-label={
              (off.server ? t("Restore ") : t("Stop ")) + labels.server
            }
            onClick={() => toggle("server")}
          >
            <svg viewBox="0 0 64 80">
              <use href="#tower" />
            </svg>
            <div>
              <strong>{t("Firetower server")}</strong>
              <small id="state-server">
                {off.server
                  ? t("Offline · coordination paused")
                  : t("Coordinating your fleet")}
              </small>
            </div>
            <span className="status-dot"></span>
          </button>
          <div
            className={"infra-wire" + (off.server ? " off" : "")}
            id="server-wire"
          ></div>
          <div className="infra-label">
            {t("Workers · your infrastructure")}
          </div>
          <div className="infra-fleet">
            <div className="machine-column">
              <button
                className={
                  "infra-node machine-node" + (isOff("host0") ? " off" : "")
                }
                aria-pressed={Boolean(off.host0)}
                aria-label={
                  (off.host0 ? t("Restore ") : t("Stop ")) + labels.host0
                }
                onClick={() => toggle("host0")}
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="7" width="18" height="11" rx="3"></rect>
                  <path d="M7 14h.01M17 14h.01"></path>
                </svg>
                <strong>Mac mini</strong>
                <span>{t("Office")}</span>
                <small id="state-host0">
                  {off.host0
                    ? t("Stopped")
                    : off.server
                      ? t("Logging locally")
                      : t("Online")}
                </small>
              </button>
              <div
                className={
                  "infra-wire host-wire" + (isOff("agent0") ? " off" : "")
                }
              ></div>
              <button
                className={
                  "infra-node run-node" + (isOff("agent0") ? " off" : "")
                }
                aria-pressed={Boolean(off.agent0)}
                aria-label={
                  (off.agent0 ? t("Restore ") : t("Stop ")) + labels.agent0
                }
                onClick={() => toggle("agent0")}
              >
                <span className="status-dot"></span>
                <strong>{t("Code agent")}</strong>
                <small id="state-agent0">
                  {off.host0
                    ? t("Machine offline")
                    : off.agent0
                      ? t("Stopped")
                      : t("Working")}
                </small>
              </button>
            </div>
            <div className="machine-column">
              <button
                className={
                  "infra-node machine-node" + (isOff("host1") ? " off" : "")
                }
                aria-pressed={Boolean(off.host1)}
                aria-label={
                  (off.host1 ? t("Restore ") : t("Stop ")) + labels.host1
                }
                onClick={() => toggle("host1")}
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="18" height="7" rx="1.5"></rect>
                  <path d="M7 6h.01M7 17h.01M12 6h5M12 17h5"></path>
                </svg>
                <strong>Hetzner</strong>
                <span>{t("Server")}</span>
                <small id="state-host1">
                  {off.host1
                    ? t("Stopped")
                    : off.server
                      ? t("Logging locally")
                      : t("Online")}
                </small>
              </button>
              <div
                className={
                  "infra-wire host-wire" + (isOff("agent1") ? " off" : "")
                }
              ></div>
              <button
                className={
                  "infra-node run-node" + (isOff("agent1") ? " off" : "")
                }
                aria-pressed={Boolean(off.agent1)}
                aria-label={
                  (off.agent1 ? t("Restore ") : t("Stop ")) + labels.agent1
                }
                onClick={() => toggle("agent1")}
              >
                <span className="status-dot"></span>
                <strong>{t("QA agent")}</strong>
                <small id="state-agent1">
                  {off.host1
                    ? t("Machine offline")
                    : off.agent1
                      ? t("Stopped")
                      : t("Working")}
                </small>
              </button>
            </div>
            <div className="machine-column">
              <button
                className={
                  "infra-node machine-node" + (isOff("host2") ? " off" : "")
                }
                aria-pressed={Boolean(off.host2)}
                aria-label={
                  (off.host2 ? t("Restore ") : t("Stop ")) + labels.host2
                }
                onClick={() => toggle("host2")}
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="18" height="7" rx="1.5"></rect>
                  <path d="M7 6h.01M7 17h.01M12 6h5M12 17h5"></path>
                </svg>
                <strong>OVH</strong>
                <span>{t("Server")}</span>
                <small id="state-host2">
                  {off.host2
                    ? t("Stopped")
                    : off.server
                      ? t("Logging locally")
                      : t("Online")}
                </small>
              </button>
              <div
                className={
                  "infra-wire host-wire" + (isOff("agent2") ? " off" : "")
                }
              ></div>
              <button
                className={
                  "infra-node run-node" + (isOff("agent2") ? " off" : "")
                }
                aria-pressed={Boolean(off.agent2)}
                aria-label={
                  (off.agent2 ? t("Restore ") : t("Stop ")) + labels.agent2
                }
                onClick={() => toggle("agent2")}
              >
                <span className="status-dot"></span>
                <strong>{t("Docs agent")}</strong>
                <small id="state-agent2">
                  {off.host2
                    ? t("Machine offline")
                    : off.agent2
                      ? t("Stopped")
                      : t("Working")}
                </small>
              </button>
            </div>
          </div>
          <div className="infra-label agent-layer-label">
            {t("Agents · independent processes")}
          </div>
          <p className="infra-note">
            {t(
              "Select a component to stop or restore it. Illustrative architecture.",
            )}
          </p>
        </div>
      </div>
      <div className="performance-block">
        <div>
          <h3>{t("Built for performance.")}</h3>
          <p>{t("A lean foundation for always-on work.")}</p>
        </div>
        <div className="performance-facts">
          <div>
            <strong>{t("Rust core")}</strong>
            <span>{t("Server and workers")}</span>
          </div>
          <div>
            <strong>{t("Fast and efficient")}</strong>
            <span>{t("Uses the system webview")}</span>
          </div>
          <div>
            <strong>{t("No overhead")}</strong>
            <span>{t("No container required per agent")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
