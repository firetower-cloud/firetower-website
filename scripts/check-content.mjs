import fs from "node:fs";
import path from "node:path";
const manifest = JSON.parse(
  fs.readFileSync("content/docs-manifest.json", "utf8"),
);
const hosting = JSON.parse(fs.readFileSync("firebase.json", "utf8")).hosting;
const redirects = new Map(
  hosting.redirects.map((r) => [r.source, r.destination]),
);
const routes = new Map([
  ["/", "out/index.html"],
  ["/enterprise", "out/enterprise.html"],
  ["/fr", "out/fr.html"],
  ["/fr/enterprise", "out/fr/enterprise.html"],
  ...manifest.map((d) => [
    d.slug ? "/docs/" + d.slug : "/docs",
    "out/docs" + (d.slug ? "/" + d.slug : "") + ".html",
  ]),
]);
const errors = [];
for (const [route, file] of routes) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(#[^"]*)?"/g)) {
    const [, , fragment] = match;
    let target = match[1];
    if (!target.startsWith("/") || target.startsWith("//")) continue;
    const seen = new Set();
    while (redirects.has(target)) {
      if (seen.has(target)) {
        errors.push("Redirect loop " + target);
        break;
      }
      seen.add(target);
      target = redirects.get(target);
    }
    if (!target.startsWith("/")) continue;
    const dest = routes.get(target) || path.join("out", target);
    if (!fs.existsSync(dest)) {
      errors.push(`${route}: missing ${target}`);
      continue;
    }
    if (
      fragment &&
      routes.has(target) &&
      !fs.readFileSync(dest, "utf8").includes(`id="${fragment.slice(1)}"`)
    )
      errors.push(`${route}: missing anchor ${target}${fragment}`);
  }
}
for (const [src, dst] of redirects)
  if (dst.startsWith("/") && !routes.has(dst) && !redirects.has(dst))
    errors.push(`${src}: redirect to missing route ${dst}`);
for (const id of [
  "machines",
  "accounts",
  "fallback",
  "git",
  "git-admin",
  "trackers",
  "repo-setup",
]) {
  const body = fs.readFileSync(`content/docs/${id}.html`, "utf8");
  if (!body.includes("/product/setup-"))
    errors.push(`${id}: missing product screenshot`);
}
if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exit(1);
}
console.log(
  `Content check passed: ${routes.size} routes, ${redirects.size} redirects, seven illustrated setup guides.`,
);
