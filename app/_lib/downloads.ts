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
export const RELEASES_URL =
  "https://github.com/firetower-cloud/firetower/releases";
export const RELEASE_FEED =
  "https://api.github.com/repos/firetower-cloud/firetower/releases?per_page=100";
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
export function downloadsFromReleases(releases: Release[]): Download[] {
  const stable = releases.filter(
    (r) => !r.draft && !r.prerelease && Array.isArray(r.assets),
  );
  const newest = (prefix: string) =>
    stable
      .filter((r) =>
        new RegExp("^" + prefix + "\\d+\\.\\d+\\.\\d+$").test(r.tag_name),
      )
      .sort((a, b) =>
        b.tag_name
          .slice(prefix.length)
          .localeCompare(a.tag_name.slice(prefix.length), undefined, {
            numeric: true,
          }),
      )[0];
  const desktop = newest("desktop-v"),
    mobile = newest("mobile-v");
  const asset = (r: Release | undefined, pattern: RegExp) =>
    r?.assets.find(
      (a) =>
        pattern.test(a.name) &&
        a.browser_download_url.startsWith(
          `${RELEASES_URL}/download/${r.tag_name}/`,
        ),
    )?.browser_download_url;
  const options: [
    Platform,
    string,
    string,
    string,
    string | undefined,
    Release | undefined,
  ][] = [
    [
      "mac",
      "macOS",
      "Universal · Apple silicon and Intel",
      "Download for macOS",
      asset(desktop, /_(macos|universal)\.dmg$/i),
      desktop,
    ],
    [
      "windows",
      "Windows",
      "64-bit installer · .exe",
      "Download for Windows",
      asset(desktop, /_x64-setup\.exe$/i),
      desktop,
    ],
    [
      "windows-msi",
      "Windows MSI",
      "64-bit package · .msi",
      "Download Windows MSI",
      asset(desktop, /_x64.*\.msi$/i),
      desktop,
    ],
    [
      "android",
      "Android",
      "Android app · .apk",
      "Download for Android",
      asset(mobile, /\.apk$/i),
      mobile,
    ],
    [
      "ios",
      "iPhone and iPad",
      "Beta through TestFlight",
      "Join iOS beta",
      "https://testflight.apple.com/join/uhgjMk1y",
      undefined,
    ],
  ];
  return options
    .filter((x) => x[4])
    .map(([os, name, detail, label, url, release]) => ({
      os,
      name,
      detail,
      label,
      url: url!,
      ...(release
        ? { version: release.tag_name.replace(/^(desktop|mobile)-v/, "") }
        : {}),
    }));
}
