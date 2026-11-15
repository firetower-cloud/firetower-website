import fs from "node:fs";
import { downloadsFromReleases, RELEASE_FEED } from "../app/_lib/downloads.ts";
const response = await fetch(RELEASE_FEED, {
  signal: AbortSignal.timeout(15000),
  headers: { Accept: "application/vnd.github+json" },
});
if (!response.ok) throw Error(`GitHub release feed: ${response.status}`);
const downloads = downloadsFromReleases(await response.json());
// `linux` is deliberately not in this list yet. No `desktop-v*` release
// carries an `.AppImage` — firetower-cloud/firetower#324 is what starts
// producing one — so requiring it here would refuse every run until that
// release is cut and freeze the snapshot for the four platforms that do
// ship. Add "linux" on the first release that carries an AppImage: from then
// on a missing row means the Linux leg failed, which is worth stopping for.
// Until then the checked-in snapshot has no Linux row on purpose, because the
// URL it would carry does not resolve, and that file is the first paint for
// every visitor rather than only the offline fallback.
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
