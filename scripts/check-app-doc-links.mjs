import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// CI uses the captured app links; a local checkout can audit its current source.
const snapshot = JSON.parse(fs.readFileSync('content/app-doc-links.json', 'utf8'));
const app = process.argv[2];
let links = snapshot.links;
if (app) {
  links = [];
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: app, encoding: 'utf8' }).split('\0').filter(Boolean);
  for (const file of files) {
    const full = path.join(app, file);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
    const body = fs.readFileSync(full, 'utf8');
    for (const [i, line] of body.split('\n').entries()) {
      for (const match of line.matchAll(/https?:\/\/(?:www\.)?usefiretower\.com\/docs[^\s"'<>`)]*/g)) {
        links.push({ source: `${file}:${i + 1}`, url: match[0] });
      }
    }
  }
}
if (!links.length) throw new Error('No app documentation links found; check the source selection.');
const redirects = new Map(JSON.parse(fs.readFileSync('firebase.json', 'utf8')).hosting.redirects.map((r) => [r.source, r]));
for (const link of links) {
  const url = new URL(link.url);
  let target = url.pathname.replace(/\/$/, '');
  const visited = new Set();
  while (redirects.has(target)) {
    if (visited.has(target)) throw new Error(`Redirect loop: ${target}`);
    visited.add(target);
    const redirect = redirects.get(target);
    if (redirect.type !== 301) throw new Error(`Documentation redirect must be permanent: ${target}`);
    target = redirect.destination;
  }
  const file = `out${target}.html`;
  if (!fs.existsSync(file)) throw new Error(`${link.source}: ${link.url} resolves to missing ${file}`);
  if (url.hash && !fs.readFileSync(file, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))
    throw new Error(`${link.source}: missing anchor ${url.hash} on ${target}`);
}
console.log(`App documentation links passed: ${links.length} references (${app ? 'current app checkout' : 'recorded source snapshot'}).`);
