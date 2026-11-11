import fs from "node:fs";

const text = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
for (const locale of ["en", "fr"]) {
  const manifest = JSON.parse(
    fs.readFileSync(
      `content/docs-manifest${locale === "fr" ? ".fr" : ""}.json`,
      "utf8",
    ),
  );
  const prefix = locale === "fr" ? "/fr" : "";
  const entries = manifest.map((d) => ({
    href: prefix + (d.slug ? "/docs/" + d.slug : "/docs"),
    title: d.title,
    description: d.description,
    section: d.section,
    text: text(
      fs.readFileSync(
        `content/docs/${locale === "fr" ? "fr/" : ""}${d.id}.html`,
        "utf8",
      ),
    ),
  }));
  fs.mkdirSync(`public${prefix}`, { recursive: true });
  fs.writeFileSync(
    `public${prefix}/docs-search.json`,
    JSON.stringify(entries) + "\n",
  );
  console.log(
    `Built search index for ${entries.length} documentation pages (${locale}).`,
  );
}
