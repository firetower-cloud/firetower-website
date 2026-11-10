import fs from "node:fs";
const manifest = JSON.parse(
  fs.readFileSync("content/docs-manifest.json", "utf8"),
);
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
const entries = manifest.map((d) => ({
  href: d.slug ? "/docs/" + d.slug : "/docs",
  title: d.title,
  description: d.description,
  section: d.section,
  text: text(fs.readFileSync(`content/docs/${d.id}.html`, "utf8")),
}));
fs.writeFileSync("public/docs-search.json", JSON.stringify(entries) + "\n");
console.log(`Built search index for ${entries.length} documentation pages.`);
