# Forest

A calm light theme for Dolphy: sage-green background, off-white cards and a forest-green accent.

- Contribution: the theme `theme-forest` (“Settings → Appearance”; listed there as “Лес”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors (background, card, primary button, secondary accent, text lines). Regenerate it with `node scripts/theme-icon.mjs extensions/theme-forest` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-forest` (the same theme was published as `dolphy.theme-forest` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer. 1.1.0 adds English and Russian descriptions and needs Dolphy 0.7.0 or newer.
- Palette: this is Dolphy's own palette (sage and forest green); it is not Everforest.
- Base: a light theme (`dark: false`). Every text color is set explicitly (`on-background`, `on-surface`, `on-surface-variant`, `on-primary`, `on-secondary` and the `on-*` colors of the status colors), so contrast does not depend on the Vuetify base theme.

## Palette

| Role | Color |
| --- | --- |
| `background` | `#EEF3EA` |
| `surface` | `#FBFDF9` |
| `surface-variant` | `#DFE9D8` |
| `primary` | `#166534` |
| `secondary` | `#92400E` |
| `hero-start` → `hero-end` | `#166534` → `#14532D` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Every text pair is at least 4.5:1, and the `primary` accent against `background` is 6.33:1 (at least 3:1 is required for non-text elements).

| Pair | Ratio |
| --- | --- |
| `on-background / background` | 13.23:1 |
| `on-surface / surface` | 14.56:1 |
| `on-surface-variant / surface-variant` | 6.02:1 |
| `on-surface-variant / background` | 6.69:1 |
| `on-primary / primary` | 7.13:1 |
| `on-secondary / secondary` | 7.09:1 |
| `error / surface` | 6.32:1 |
| `warning / surface` | 4.81:1 |
| `success / surface` | 4.90:1 |
| `info / surface` | 5.80:1 |
| `hero-contrast / hero-start` | 7.13:1 |
| `hero-contrast / hero-end` | 9.11:1 |
