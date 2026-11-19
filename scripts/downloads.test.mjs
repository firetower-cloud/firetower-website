import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareVersions,
  detectPlatform,
  downloadsFromReleases,
  isComplete,
  RELEASES_URL,
} from "../app/_lib/downloads.ts";
const release = (tag, names, extra = {}) => ({
  tag_name: tag,
  draft: false,
  prerelease: false,
  assets: names.map((name) => ({
    name,
    browser_download_url: `${RELEASES_URL}/download/${tag}/${name}`,
  })),
  ...extra,
});
/**
 * Every desktop asset of a complete release. Each signature deliberately
 * precedes the file it signs, so a pattern that also matched `.sig` would be
 * caught here rather than quietly shipping a signature as a download.
 */
const desktopAssets = (version) => [
  `Firetower_${version}_amd64.AppImage.sig`,
  `Firetower_${version}_amd64.AppImage`,
  `Firetower_${version}_macos.dmg`,
  `Firetower_${version}_x64-setup.exe.sig`,
  `Firetower_${version}_x64-setup.exe`,
  `Firetower_${version}_x64_en-US.msi.sig`,
  `Firetower_${version}_x64_en-US.msi`,
  "latest.json",
];
/** The beta entry is always ahead of general, as it is in production. */
const channels = (general) => ({
  desktop: { general, beta: "99.0.0", general_promoted_at: "2026-11-19" },
});
const rows = (results) =>
  results.map((d) => [d.os, d.version, d.url.split("/").pop()]);
test("chooses the newest stable package release, not the newest unrelated tag", () => {
  const results = downloadsFromReleases(
    [
      release("firetower-v99.0.0", []),
      release("desktop-v0.9.0", ["Firetower_0.9.0_macos.dmg"]),
      release("desktop-v0.10.0", [
        "Firetower_0.10.0_macos.dmg",
        "Firetower_0.10.0_x64-setup.exe",
        "Firetower_0.10.0_x64_en-US.msi",
      ]),
      release("desktop-v0.11.0", ["bad_macos.dmg"], { prerelease: true }),
      release("desktop-v0.12.0", ["bad_macos.dmg"], { draft: true }),
      release("mobile-v1.0.0", ["firetower-1.0.0.apk"]),
    ],
    channels("0.12.0"),
  );
  assert.equal(results.find((d) => d.os === "mac").version, "0.10.0");
  assert.equal(results.find((d) => d.os === "android").version, "1.0.0");
  // No release ships an AppImage, so Linux is omitted rather than invented.
  assert.equal(results.length, 5);
  assert.equal(isComplete(results), false);
});
// desktop-v0.31.1 went out as a macOS-only hotfix and the live download button
// lost Windows and Windows MSI entirely, because every desktop platform was
// read off one single release. Each platform resolves on its own now.
test("a macOS-only release keeps Windows, MSI and Linux on the previous release", () => {
  const results = downloadsFromReleases(
    [
      release("desktop-v0.31.0", desktopAssets("0.31.0")),
      release("desktop-v0.31.1", [
        "Firetower_0.31.1_macos.dmg",
        "Firetower_universal.app.tar.gz",
        "Firetower_universal.app.tar.gz.sig",
        "latest.json",
      ]),
      release("mobile-v0.18.0", ["firetower-0.18.0.apk"]),
    ],
    channels("0.31.1"),
  );
  assert.deepEqual(rows(results), [
    ["mac", "0.31.1", "Firetower_0.31.1_macos.dmg"],
    ["windows", "0.31.0", "Firetower_0.31.0_x64-setup.exe"],
    ["windows-msi", "0.31.0", "Firetower_0.31.0_x64_en-US.msi"],
    ["linux", "0.31.0", "Firetower_0.31.0_amd64.AppImage"],
    ["android", "0.18.0", "firetower-0.18.0.apk"],
    ["ios", undefined, "uhgjMk1y"],
  ]);
  assert.equal(isComplete(results), true);
  for (const download of results)
    assert.equal(download.url.endsWith(".sig"), false, download.os);
});
test("a desktop build newer than the general channel is never offered", () => {
  const results = downloadsFromReleases(
    [
      release("desktop-v0.31.0", desktopAssets("0.31.0")),
      release("desktop-v0.31.1", desktopAssets("0.31.1")),
      release("mobile-v0.18.0", ["firetower-0.18.0.apk"]),
    ],
    channels("0.31.0"),
  );
  assert.deepEqual(rows(results), [
    ["mac", "0.31.0", "Firetower_0.31.0_macos.dmg"],
    ["windows", "0.31.0", "Firetower_0.31.0_x64-setup.exe"],
    ["windows-msi", "0.31.0", "Firetower_0.31.0_x64_en-US.msi"],
    ["linux", "0.31.0", "Firetower_0.31.0_amd64.AppImage"],
    ["android", "0.18.0", "firetower-0.18.0.apk"],
    ["ios", undefined, "uhgjMk1y"],
  ]);
  for (const download of results)
    assert.equal(download.url.includes("0.31.1"), false, download.os);
});
test("a partial general release falls back to an older one, never past the cap", () => {
  const results = downloadsFromReleases(
    [
      release("desktop-v0.30.0", desktopAssets("0.30.0")),
      release("desktop-v0.31.0", ["Firetower_0.31.0_macos.dmg"]),
      release("desktop-v0.31.1", desktopAssets("0.31.1")),
      release("mobile-v0.18.0", ["firetower-0.18.0.apk"]),
    ],
    channels("0.31.0"),
  );
  assert.deepEqual(rows(results), [
    ["mac", "0.31.0", "Firetower_0.31.0_macos.dmg"],
    ["windows", "0.30.0", "Firetower_0.30.0_x64-setup.exe"],
    ["windows-msi", "0.30.0", "Firetower_0.30.0_x64_en-US.msi"],
    ["linux", "0.30.0", "Firetower_0.30.0_amd64.AppImage"],
    ["android", "0.18.0", "firetower-0.18.0.apk"],
    ["ios", undefined, "uhgjMk1y"],
  ]);
  for (const download of results)
    assert.equal(download.url.includes("0.31.1"), false, download.os);
});
test("versions compare as numbers, so 0.9.0 ranks below 0.31.0", () => {
  assert.ok(compareVersions("0.9.0", "0.31.0") < 0);
  assert.ok(compareVersions("0.31.0", "0.9.0") > 0);
  assert.equal(compareVersions("0.31.1", "0.31.1"), 0);
  assert.ok(compareVersions("0.31.1", "0.31.0") > 0);
  const feed = [
    release("desktop-v0.9.0", desktopAssets("0.9.0")),
    release("desktop-v0.31.0", desktopAssets("0.31.0")),
    release("mobile-v0.18.0", ["firetower-0.18.0.apk"]),
  ];
  // A string compare sorts 0.9.0 ahead of 0.31.0 and would pick the old build.
  assert.equal(
    downloadsFromReleases(feed, channels("0.31.0")).find((d) => d.os === "mac")
      .version,
    "0.31.0",
  );
  // A string compare also reads "0.31.0" as <= "0.9.0" and would let the newer
  // build through a 0.9.0 ceiling.
  assert.deepEqual(
    downloadsFromReleases(feed, channels("0.9.0"))
      .filter((d) => d.version)
      .map((d) => d.version),
    ["0.9.0", "0.9.0", "0.9.0", "0.9.0", "0.18.0"],
  );
});
test("a missing or unparseable manifest never yields a desktop link", () => {
  const feed = [
    release("desktop-v0.31.1", desktopAssets("0.31.1")),
    release("mobile-v0.18.0", ["firetower-0.18.0.apk"]),
  ];
  for (const manifest of [
    undefined,
    null,
    {},
    { desktop: {} },
    { desktop: { general: "" } },
    { desktop: { general: "beta" } },
    { desktop: { general: 31 } },
    { control_plane: { general: "0.56.2" } },
    "not json at all",
  ]) {
    const results = downloadsFromReleases(feed, manifest);
    assert.deepEqual(
      results.map((d) => d.os),
      ["android", "ios"],
      JSON.stringify(manifest ?? null),
    );
    // Incomplete, so a caller keeps its snapshot rather than showing this.
    assert.equal(isComplete(results), false);
  }
});
test("missing and untrusted assets are never fabricated into download links", () => {
  const data = release("desktop-v1.0.0", ["Firetower_1.0.0_macos.dmg"]);
  data.assets[0].browser_download_url = "https://untrusted.example/file.dmg";
  assert.deepEqual(
    downloadsFromReleases([data], channels("1.0.0")).map((d) => d.os),
    ["ios"],
  );
  assert.equal(downloadsFromReleases([], channels("1.0.0"))[0].os, "ios");
});
test("device detection distinguishes iPad desktop mode, Android, Windows, Mac and Linux", () => {
  assert.equal(detectPlatform("Mozilla Macintosh", "MacIntel", 5), "ios");
  assert.equal(detectPlatform("Mozilla Macintosh", "MacIntel", 0), "mac");
  assert.equal(
    detectPlatform("Mozilla Android Linux", "Linux armv8", 5),
    "android",
  );
  assert.equal(detectPlatform("Mozilla Windows", "Win32"), "windows");
  assert.equal(detectPlatform("Mozilla Linux", "Linux x86_64"), "linux");
  assert.equal(detectPlatform("", ""), "unknown");
});
