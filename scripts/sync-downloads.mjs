import fs from "node:fs";
import { downloadsFromReleases, RELEASE_FEED } from "../app/_lib/downloads.ts";
const response = await fetch(RELEASE_FEED, {
  signal: AbortSignal.timeout(15000),
  headers: { Accept: "application/vnd.github+json" },
});
if (!response.ok) throw Error(`GitHub release feed: ${response.status}`);
const downloads = downloadsFromReleases(await response.json());
// `downloads.json` is the first paint for every visitor, not only the offline
// fallback: the download menu seeds its state from this file and renders it
// before the release feed answers. A row carrying a URL that does not resolve
// would be the first thing everybody sees, which is worse than no row at all,
// so this guard throws instead of writing a snapshot that is missing a
// platform and the previous one keeps serving.
// `linux` joined the list on desktop-v0.30.0, the first release to carry an
// `.AppImage`. From then on a missing Linux row means that release's Linux leg
// failed rather than that Linux has no build yet, which is worth stopping for.
if (
  !["mac", "windows", "linux", "android", "ios"].every((os) =>
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
