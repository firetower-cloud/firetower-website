import fs from "node:fs";
import {
  CHANNELS_URL,
  downloadsFromReleases,
  generalDesktopVersion,
  isComplete,
  RELEASE_FEED,
} from "../app/_lib/downloads.ts";
const json = async (url, headers = {}) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers,
  });
  if (!response.ok) throw Error(`${url}: ${response.status}`);
  return response.json();
};
// A browser cannot read the channel manifest — GitHub serves release assets
// without CORS headers — so the cap is applied here, at build time, and the
// committed snapshot is what visitors actually get.
const token = process.env.GITHUB_TOKEN;
const [releases, channels] = await Promise.all([
  json(RELEASE_FEED, {
    Accept: "application/vnd.github+json",
    // Unauthenticated API calls are rationed per IP, and CI runners share
    // theirs, so a scheduled run gets 403ed without a token. Optional: a local
    // run works fine without one. Deliberately not sent to the asset host,
    // which is a different origin reached through a signed redirect.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }),
  json(CHANNELS_URL),
]);
const downloads = downloadsFromReleases(releases, channels);
if (!isComplete(downloads))
  throw Error("Incomplete release feed; keeping the previous snapshot.");
fs.writeFileSync(
  "app/_lib/downloads.json",
  JSON.stringify(downloads, null, 2) + "\n",
);
console.log(
  `Updated the fallback download snapshot from the general channel (desktop ${generalDesktopVersion(channels)}).`,
);
