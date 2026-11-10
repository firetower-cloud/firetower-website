import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectPlatform,
  downloadsFromReleases,
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
test("chooses the newest stable package release, not the newest unrelated tag", () => {
  const results = downloadsFromReleases([
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
  ]);
  assert.equal(results.find((d) => d.os === "mac").version, "0.10.0");
  assert.equal(results.find((d) => d.os === "android").version, "1.0.0");
  assert.equal(results.length, 5);
});
test("missing and untrusted assets are never fabricated into download links", () => {
  const data = release("desktop-v1.0.0", ["Firetower_1.0.0_macos.dmg"]);
  data.assets[0].browser_download_url = "https://untrusted.example/file.dmg";
  assert.deepEqual(
    downloadsFromReleases([data]).map((d) => d.os),
    ["ios"],
  );
  assert.equal(downloadsFromReleases([])[0].os, "ios");
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
