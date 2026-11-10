"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import snapshot from "../../_lib/downloads.json";
import {
  detectPlatform,
  downloadsFromReleases,
  RELEASE_FEED,
  RELEASES_URL,
  type Download,
  type Platform,
} from "../../_lib/downloads";
let request: Promise<Download[]> | undefined;
function currentDownloads() {
  return (request ??= (async () => {
    try {
      const cached = JSON.parse(
        localStorage.getItem("firetower-downloads") || "null",
      );
      if (cached?.expires > Date.now() && Array.isArray(cached.releases)) {
        const parsed = downloadsFromReleases(cached.releases);
        if (parsed.length > 1) return parsed;
      }
    } catch {}
    try {
      const response = await fetch(RELEASE_FEED, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw Error("Release feed unavailable");
      const releases = await response.json();
      if (!Array.isArray(releases)) throw Error("Invalid release feed");
      const downloads = downloadsFromReleases(releases);
      if (downloads.length < 2) throw Error("No release assets");
      try {
        localStorage.setItem(
          "firetower-downloads",
          JSON.stringify({ expires: Date.now() + 6 * 3600000, releases }),
        );
      } catch {}
      return downloads;
    } catch {
      return snapshot as Download[];
    }
  })());
}
const subscribe = () => () => {};
const devicePlatform = (): Platform => {
  const ua = navigator as Navigator & { userAgentData?: { platform: string } };
  return detectPlatform(
    ua.userAgent,
    ua.userAgentData?.platform || ua.platform,
    ua.maxTouchPoints,
  );
};
const serverPlatform = (): Platform => "unknown";
export function DownloadButton() {
  const os = useSyncExternalStore(subscribe, devicePlatform, serverPlatform);
  const [downloads, setDownloads] = useState<Download[]>(
    snapshot as Download[],
  );
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    let active = true;
    currentDownloads().then((d) => {
      if (active) setDownloads(d);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    function outside(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const preferred = downloads.find((d) => d.os === os);
  function expand() {
    setOpen(true);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLAnchorElement>("[role=menuitem]")
        ?.focus(),
    );
  }
  return (
    <div
      className="split-download"
      ref={root}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          if (!open) {
            expand();
            return;
          }
          const items = [
            ...root.current!.querySelectorAll<HTMLAnchorElement>(
              "[role=menuitem]",
            ),
          ];
          const index = items.indexOf(
            document.activeElement as HTMLAnchorElement,
          );
          items[
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? items.length - 1
                : (index + (e.key === "ArrowDown" ? 1 : items.length - 1)) %
                  items.length
          ]?.focus();
        }
      }}
    >
      {preferred ? (
        <a
          className="button download-main"
          href={preferred.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {preferred.label}
        </a>
      ) : (
        <button
          className="button download-main"
          aria-expanded={open}
          aria-controls={id}
          aria-haspopup="menu"
          onClick={() => (open ? setOpen(false) : expand())}
        >
          Download Firetower
        </button>
      )}
      <button
        className="button download-toggle"
        ref={toggle}
        aria-label="Choose a download platform"
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="menu"
        onClick={() => (open ? setOpen(false) : expand())}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className="download-options"
        id={id}
        role="menu"
        aria-label="Download Firetower"
        hidden={!open}
      >
        <div className="download-panel-title" role="presentation">
          Download Firetower
        </div>
        {downloads.map((d) => (
          <a
            key={d.os}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span>
              <b>{d.name}</b>
              <small>
                {d.detail}
                {d.version ? ` · ${d.version}` : ""}
              </small>
            </span>
            <span aria-hidden="true">↓</span>
          </a>
        ))}
        <p className="download-platform-note">
          {os === "linux"
            ? "A Linux desktop build is not available. Workers support Linux."
            : "Choose the device you want to use."}{" "}
          <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
            All releases
          </a>
        </p>
      </div>
    </div>
  );
}
