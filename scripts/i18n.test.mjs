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

test("localized links retain documentation paths, queries and anchors", () => {
  for (const [path, expected] of [
    ["/", "/fr"],
    ["/#tour", "/fr#tour"],
    ["/enterprise", "/fr/enterprise"],
    ["/enterprise#services", "/fr/enterprise#services"],
    ["/docs", "/fr/docs"],
    [
      "/docs/install-firetower#section-1",
      "/fr/docs/install-firetower#section-1",
    ],
    ["/docs/sharing?source=app", "/fr/docs/sharing?source=app"],
    ["/docs/sharing.md", "/fr/docs/sharing.md"],
  ]) {
    assert.equal(localizedHref(path, "fr"), expected);
    assert.equal(localizedHref(path, "en"), path);
  }
  for (const path of ["/enterprise.md", "/fr", "https://example.org"]) {
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

test("every French guide keeps the English guide's anchors, screenshots, and technical commands", () => {
  const english = JSON.parse(
    readFileSync("content/docs-manifest.json", "utf8"),
  );
  const french = JSON.parse(
    readFileSync("content/docs-manifest.fr.json", "utf8"),
  );
  assert.deepEqual(
    french.map((d) => [d.id, d.slug]),
    english.map((d) => [d.id, d.slug]),
  );
  const values = (html, expression) =>
    [...html.matchAll(expression)].map((m) => m[1]);
  const prompts = new Set([
    "first-run",
    "profiles",
    "skills",
    "teams",
    "review",
  ]);
  for (const [i, doc] of french.entries()) {
    const en = readFileSync(`content/docs/${doc.id}.html`, "utf8");
    const fr = readFileSync(`content/docs/fr/${doc.id}.html`, "utf8");
    assert.notEqual(doc.description, english[i].description, doc.id);
    assert.deepEqual(
      doc.headings.map((h) => h.id),
      english[i].headings.map((h) => h.id),
      doc.id,
    );
    assert.deepEqual(
      values(fr, / id="([^"]+)"/g),
      values(en, / id="([^"]+)"/g),
      doc.id,
    );
    assert.deepEqual(
      values(fr, / src="([^"]+)"/g),
      values(en, / src="([^"]+)"/g),
      doc.id,
    );
    assert.deepEqual(
      values(fr, / data-image="([^"]+)"/g),
      values(en, / data-image="([^"]+)"/g),
      doc.id,
    );
    const code = /<code[^>]*>([\s\S]*?)<\/code>/g;
    const technical = (html) =>
      values(html, code).filter(
        (c) => !prompts.has(doc.id) || !c.includes("\n"),
      );
    assert.deepEqual(
      technical(fr),
      technical(en),
      `${doc.id}: technical code must stay intact`,
    );
    assert.equal(
      /href="\/docs(?:[\/#"])/.test(fr),
      false,
      `${doc.id}: English documentation link`,
    );
    assert.equal(
      /Select to enlarge|Desktop app · sample data|Enlarge:/.test(fr),
      false,
      `${doc.id}: untranslated caption`,
    );
    for (const heading of doc.headings)
      assert.ok(
        fr.includes(`id="${heading.id}">${heading.title}</h2>`),
        `${doc.id}: translated TOC mismatch`,
      );
  }
});
