/* ── What the demo pretends to have ──────────────────────────────────────
   Kept apart from the component so the copy can be read and edited without
   scrolling past layout, and so the shapes stay honest: a session here has
   the same fields the real one does. */

export type SessionStatus = "Working" | "NeedsYou" | "Ended";

export type DemoSession = {
  id: string;
  agent: string;
  repo: string;
  branch: string;
  host: string;
  title: string;
  status: SessionStatus;
  /** How long it has been going. Live only for the one you start yourself. */
  age: string;
  /** What it stopped to ask. Only ever set while it is waiting on you. */
  ask?: string;
  /** Seeds the endless output, so two sessions never print the same thing. */
  seed: number;
};

export const SEEDED: DemoSession[] = [
  {
    id: "juniper",
    agent: "Claude Code",
    repo: "westlabs/ledger",
    branch: "ft/migrate-settlement-job",
    host: "34.79.12.180",
    title: "Migrate the settlement job off the nightly cron",
    status: "NeedsYou",
    age: "2h48m",
    ask: "Two tables have a settled_at. Should I backfill both, or is invoices.settled_at derived?",
    seed: 3,
  },
  {
    id: "kestrel",
    agent: "Claude Code",
    repo: "westlabs/ledger",
    branch: "ft/split-reconciliation-report",
    host: "34.79.12.180",
    title: "Split the reconciliation report by currency",
    status: "Working",
    age: "3h34m",
    seed: 41,
  },
  {
    id: "wren",
    agent: "Codex",
    repo: "westlabs/web",
    branch: "ft/drop-unused-analytics",
    host: "5.161.44.9",
    title: "Drop the unused analytics bundle",
    status: "Ended",
    age: "12m",
    seed: 77,
  },
];

/* ── The diff the finished session left behind ─────────────────────────── */

export type DiffFile = { path: string; added: number; removed: number; patch: string };

export const DIFF: DiffFile[] = [
  {
    path: "app/_lib/analytics.ts",
    added: 0,
    removed: 34,
    patch: `--- a/app/_lib/analytics.ts
+++ /dev/null
@@ -1,34 +0,0 @@
-import { track } from "@vendor/metrics";
-
-const QUEUE: Event[] = [];
-let timer: ReturnType<typeof setInterval> | null = null;
-
-export function record(name: string, props?: Props) {
-  QUEUE.push({ name, props, at: Date.now() });
-  if (!timer) timer = setInterval(flush, 5_000);
-}
-
-function flush() {
-  if (!QUEUE.length) return;
-  track(QUEUE.splice(0, QUEUE.length));
-}`,
  },
  {
    path: "app/layout.tsx",
    added: 0,
    removed: 6,
    patch: `--- a/app/layout.tsx
+++ b/app/layout.tsx
@@ -3,8 +3,6 @@ import type { Metadata } from "next";
 import { Geist } from "next/font/google";
-import { Analytics } from "./_components/Analytics";
 import "./globals.css";
 
@@ -41,7 +39,6 @@ export default function RootLayout({ children }) {
       <body>
         {children}
-        <Analytics />
       </body>`,
  },
  {
    path: "package.json",
    added: 0,
    removed: 2,
    patch: `--- a/package.json
+++ b/package.json
@@ -12,8 +12,6 @@
   "dependencies": {
     "next": "16.3.1",
-    "@vendor/metrics": "^4.2.0",
-    "@vendor/metrics-react": "^4.2.0",
     "react": "19.2.8"`,
  },
  {
    path: "app/_components/Analytics.tsx",
    added: 0,
    removed: 21,
    patch: `--- a/app/_components/Analytics.tsx
+++ /dev/null
@@ -1,21 +0,0 @@
-"use client";
-
-import { useEffect } from "react";
-import { record } from "../_lib/analytics";
-
-export function Analytics() {
-  useEffect(() => {
-    record("page_view", { path: location.pathname });
-  }, []);
-  return null;
-}`,
  },
];

export const DIFF_TOTAL = DIFF.reduce(
  (t, f) => ({ added: t.added + f.added, removed: t.removed + f.removed }),
  { added: 0, removed: 0 },
);
