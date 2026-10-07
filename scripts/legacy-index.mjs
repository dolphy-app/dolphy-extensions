#!/usr/bin/env node
// Tells whether a published index.v2.json was written by the tools of app 0.4:
// its entries carry `contributes` / `titles`, its versions carry `permissions`.
// The 0.5 tools cannot read such an index, and the 0.5 app cannot use the
// versions it lists (their manifests have `contributes`).
//
// Usage: node scripts/legacy-index.mjs <index.v2.json>
// Exit code: 0 — legacy index, 1 — not legacy (or no such file / not JSON).
import { readFileSync } from 'node:fs';

try {
  const index = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const legacy = (index.extensions ?? []).some(
    (entry) =>
      'contributes' in entry ||
      'titles' in entry ||
      (entry.versions ?? []).some((version) => 'permissions' in version),
  );
  process.exit(legacy ? 0 : 1);
} catch {
  process.exit(1);
}
