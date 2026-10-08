# Lavender

A soft light theme for Dolphy: pale lavender background, white cards and a violet accent.

- Contribution: the theme `theme-lavender` (“Settings → Appearance”; listed there as “Лаванда”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors (background, card, primary button, secondary accent, text lines). Regenerate it with `node scripts/theme-icon.mjs extensions/theme-lavender` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-lavender` (the same theme was published as `dolphy.theme-lavender` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer.
- Base: a light theme (`dark: false`). Every text color is set explicitly (`on-background`, `on-surface`, `on-surface-variant`, `on-primary`, `on-secondary` and the `on-*` colors of the status colors), so contrast does not depend on the Vuetify base theme.

## Palette

| Role | Color |
| --- | --- |
| `background` | `#F5F2FC` |
| `surface` | `#FFFFFF` |
| `surface-variant` | `#EAE4F8` |
| `primary` | `#6D28D9` |
| `secondary` | `#BE185D` |
| `hero-start` → `hero-end` | `#6D28D9` → `#4C1D95` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Every text pair is at least 4.5:1, and the `primary` accent against `background` is 6.42:1 (at least 3:1 is required for non-text elements).

| Pair | Ratio |
| --- | --- |
| `on-background / background` | 13.55:1 |
| `on-surface / surface` | 14.99:1 |
| `on-surface-variant / surface-variant` | 5.92:1 |
| `on-surface-variant / background` | 6.63:1 |
| `on-primary / primary` | 7.10:1 |
| `on-secondary / secondary` | 6.04:1 |
| `error / surface` | 6.47:1 |
| `warning / surface` | 4.92:1 |
| `success / surface` | 5.02:1 |
| `info / surface` | 5.93:1 |
| `hero-contrast / hero-start` | 7.10:1 |
| `hero-contrast / hero-end` | 10.95:1 |
