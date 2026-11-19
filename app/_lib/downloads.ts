export type Platform =
  | "mac"
  | "windows"
  | "windows-msi"
  | "android"
  | "ios"
  | "linux"
  | "unknown";
export type Download = {
  os: Platform;
  name: string;
  detail: string;
  label: string;
  url: string;
  version?: string;
};
export type Release = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  assets: { name: string; browser_download_url: string }[];
};
/** The parts of `channels.json` the download button depends on. */
export type Channels = { desktop?: { general?: string } };
export const RELEASES_URL =
  "https://github.com/firetower-cloud/firetower/releases";
export const RELEASE_FEED =
  "https://api.github.com/repos/firetower-cloud/firetower/releases?per_page=100";
/**
 * The channel manifest, which is an asset on the rolling `channels` release.
 * That tag is itself flagged `prerelease`, so it is addressed by URL rather
 * than found by scanning the release feed. GitHub serves release assets
 * without CORS headers, so only Node can read this — see sync-downloads.mjs.
 */
export const CHANNELS_URL = `${RELEASES_URL}/download/channels/channels.json`;
/**
 * The platforms a freshly resolved set must cover before it is allowed to
 * replace the committed snapshot, so the live path and the snapshot cannot
 * disagree about what a complete menu looks like.
 */
export const REQUIRED_PLATFORMS: Platform[] = [
  "mac",
  "windows",
  "linux",
  "android",
  "ios",
];
const TAG_PREFIX = /^(desktop|mobile)-v/;
const VERSION = /^\d+\.\d+\.\d+$/;
const released = (r: Release) => r.tag_name.replace(TAG_PREFIX, "");
/**
 * Numeric semver order. Comparing version strings instead would rank 0.9.0
 * above 0.31.0, which would let a build past the channel ceiling.
 */
export function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number),
    right = b.split(".").map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] || 0) - (right[i] || 0);
    if (difference) return difference;
  }
  return 0;
}
/**
 * The general-channel desktop version, or undefined when the manifest is
 * absent or not shaped as expected. GitHub does not flag the beta desktop tag
 * `prerelease`, so this manifest is the only thing that tells the two apart.
 */
export function generalDesktopVersion(manifest: unknown): string | undefined {
  const version = (manifest as Channels | null | undefined)?.desktop?.general;
  return typeof version === "string" && VERSION.test(version)
    ? version
    : undefined;
}
export const isComplete = (downloads: Download[]) =>
  REQUIRED_PLATFORMS.every((os) => downloads.some((d) => d.os === os));
export function detectPlatform(
  userAgent: string,
  platform: string,
  touchPoints = 0,
): Platform {
  const value = userAgent + " " + platform;
  if (/Android/i.test(value)) return "android";
  if (
    /iPhone|iPad|iPod/i.test(value) ||
    (/Mac/i.test(platform) && touchPoints > 1)
  )
    return "ios";
  if (/Win/i.test(value)) return "windows";
  if (/Mac/i.test(value)) return "mac";
  if (/Linux|X11/i.test(value)) return "linux";
  return "unknown";
}
export function downloadsFromReleases(
  releases: Release[],
  channels: unknown,
): Download[] {
  const stable = releases.filter(
    (r) => !r.draft && !r.prerelease && Array.isArray(r.assets),
  );
  /** Every stable release for a package, newest version first. */
  const line = (prefix: string) =>
    stable
      .filter((r) =>
        new RegExp("^" + prefix + "\\d+\\.\\d+\\.\\d+$").test(r.tag_name),
      )
      .sort((a, b) => compareVersions(released(b), released(a)));
  const ceiling = generalDesktopVersion(channels);
  /**
   * Desktop candidates stop at the general channel: the newest desktop tag is
   * often the beta build, and nothing on the release itself says so. With no
   * readable manifest no desktop build is offered at all, which leaves callers
   * on their snapshot rather than promoting a beta to every visitor.
   */
  const desktop = ceiling
    ? line("desktop-v").filter((r) => compareVersions(released(r), ceiling) <= 0)
    : [];
  /** The manifest has no mobile entry, so mobile is not capped. */
  const mobile = line("mobile-v");
  /**
   * The newest candidate that actually ships this platform's asset, which is
   * not always the newest candidate: a single-platform release must not drop
   * every other platform out of the menu. Only a URL GitHub itself returned,
   * under that release's own download path, is ever turned into a link — a
   * version number is never pasted into a URL.
   */
  const build = (candidates: Release[], pattern: RegExp) => {
    for (const release of candidates) {
      const url = release.assets.find(
        (a) =>
          pattern.test(a.name) &&
          a.browser_download_url.startsWith(
            `${RELEASES_URL}/download/${release.tag_name}/`,
          ),
      )?.browser_download_url;
      if (url) return { url, version: released(release) };
    }
  };
  const options: [
    Platform,
    string,
    string,
    string,
    { url: string; version?: string } | undefined,
  ][] = [
    [
      "mac",
      "macOS",
      "Universal · Apple silicon and Intel",
      "Download for macOS",
      build(desktop, /_(macos|universal)\.dmg$/i),
    ],
    [
      "windows",
      "Windows",
      "64-bit installer · .exe",
      "Download for Windows",
      build(desktop, /_x64-setup\.exe$/i),
    ],
    [
      "windows-msi",
      "Windows MSI",
      "64-bit package · .msi",
      "Download Windows MSI",
      build(desktop, /_x64.*\.msi$/i),
    ],
    [
      "linux",
      "Linux",
      "AppImage · 64-bit Intel and AMD",
      "Download for Linux",
      build(desktop, /_amd64\.AppImage$/i),
    ],
    [
      "android",
      "Android",
      "Android app · .apk",
      "Download for Android",
      build(mobile, /\.apk$/i),
    ],
    [
      "ios",
      "iPhone and iPad",
      "Beta through TestFlight",
      "Join iOS beta",
      { url: "https://testflight.apple.com/join/uhgjMk1y" },
    ],
  ];
  return options
    .filter((x) => x[4])
    .map(([os, name, detail, label, found]) => ({
      os,
      name,
      detail,
      label,
      url: found!.url,
      ...(found!.version ? { version: found!.version } : {}),
    }));
}
