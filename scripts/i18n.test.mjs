import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { localizedHref, preferredLanguage } from "../app/_lib/i18n/routing.ts";

test("explicit language choices win; browser order and unsupported locales fall back predictably", () => {
  assert.equal(preferredLanguage(["fr-FR", "en-US"]), "fr");
  assert.equal(preferredLanguage(["fr-CA"]), "fr");
  assert.equal(preferredLanguage(["en-GB", "fr-FR"]), "en");
  assert.equal(preferredLanguage(["de-DE", "fr-FR"]), "fr");
  assert.equal(preferredLanguage(["fr-FR"], "en"), "en");
  assert.equal(preferredLanguage(["en-US"], "fr"), "fr");
  assert.equal(preferredLanguage(["de-DE"], "invalid"), "en");
  assert.equal(preferredLanguage([]), "en");
});

test("localized marketing links retain anchors without inventing translated documentation routes", () => {
  for (const [path, expected] of [
    ["/", "/fr"],
    ["/#tour", "/fr#tour"],
    ["/enterprise", "/fr/enterprise"],
    ["/enterprise#services", "/fr/enterprise#services"],
  ]) {
    assert.equal(localizedHref(path, "fr"), expected);
    assert.equal(localizedHref(path, "en"), path);
  }
  for (const path of [
    "/docs",
    "/docs/install-firetower",
    "/docs/sharing",
    "/enterprise.md",
    "/fr",
    "https://example.org",
  ]) {
    assert.equal(localizedHref(path, "fr"), path);
  }
});

test("all release-button copy has a French translation, including menus and platform details", () => {
  const dictionary = JSON.parse(readFileSync("app/_lib/i18n/fr.json", "utf8"));
  const downloads = JSON.parse(readFileSync("app/_lib/downloads.json", "utf8"));
  for (const download of downloads) {
    assert.ok(dictionary[download.label], download.label);
    assert.ok(dictionary[download.detail], download.detail);
  }
});
