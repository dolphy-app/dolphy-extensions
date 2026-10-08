# Midnight

A deep dark theme for Dolphy: navy background, slightly lighter navy cards and a bright cyan accent.

- Contribution: the theme `theme-midnight` (“Settings → Appearance”; listed there as “Полночь”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors (background, card, primary button, secondary accent, text lines). Regenerate it with `node scripts/theme-icon.mjs extensions/theme-midnight` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-midnight` (the same theme was published as `dolphy.theme-midnight` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer. 1.1.0 adds English and Russian descriptions and needs Dolphy 0.7.0 or newer.
- Base: a dark theme (`dark: true`). Every text color is set explicitly (`on-background`, `on-surface`, `on-surface-variant`, `on-primary`, `on-secondary` and the `on-*` colors of the status colors), so contrast does not depend on the Vuetify base theme.

## Palette

| Role | Color |
| --- | --- |
| `background` | `#0B1220` |
| `surface` | `#131C2E` |
| `surface-variant` | `#1C2842` |
| `primary` | `#22D3EE` |
| `secondary` | `#A5B4FC` |
| `hero-start` → `hero-end` | `#0E7490` → `#1E3A8A` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Every text pair is at least 4.5:1, and the `primary` accent against `background` is 10.36:1 (at least 3:1 is required for non-text elements).

| Pair | Ratio |
| --- | --- |
| `on-background / background` | 15.89:1 |
| `on-surface / surface` | 14.45:1 |
| `on-surface-variant / surface-variant` | 7.30:1 |
| `on-surface-variant / background` | 9.32:1 |
| `on-primary / primary` | 9.16:1 |
| `on-secondary / secondary` | 8.77:1 |
| `error / surface` | 6.16:1 |
| `warning / surface` | 10.20:1 |
| `success / surface` | 9.77:1 |
| `info / surface` | 6.70:1 |
| `hero-contrast / hero-start` | 5.36:1 |
| `hero-contrast / hero-end` | 10.36:1 |
