import fs from "node:fs";
import { downloadsFromReleases, RELEASE_FEED } from "../app/_lib/downloads.ts";
const response = await fetch(RELEASE_FEED, {
  signal: AbortSignal.timeout(15000),
  headers: { Accept: "application/vnd.github+json" },
});
if (!response.ok) throw Error(`GitHub release feed: ${response.status}`);
const downloads = downloadsFromReleases(await response.json());
if (
  !["mac", "windows", "android", "ios"].every((os) =>
    downloads.some((d) => d.os === os),
  )
)
  throw Error("Incomplete release feed; keeping the previous snapshot.");
fs.writeFileSync(
  "app/_lib/downloads.json",
  JSON.stringify(downloads, null, 2) + "\n",
);
console.log(
  "Updated the fallback download snapshot from stable package releases.",
);
