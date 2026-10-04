# Forest

A calm light theme for Dolphy: sage-green background, off-white cards and a forest-green accent.

- Contribution: the theme `dolphy.theme-forest` (“Settings → Appearance”; listed there as “Лес”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors (background, card, primary button, secondary accent, text lines). Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-forest` from the repository root.
- No code: the extension consists of `extension.json` and the icon, so it needs no permissions.
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

WCAG 2.x contrast ratios computed from the colors in `extension.json`. Every text pair is at least 4.5:1, and the `primary` accent against `background` is 6.33:1 (at least 3:1 is required for non-text elements).

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
