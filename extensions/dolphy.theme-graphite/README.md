# Graphite

A restrained dark theme for Dolphy: neutral graphite surfaces and a muted sea-green accent.

- Contribution: the theme `dolphy.theme-graphite` (“Settings → Appearance”; listed there as “Графит”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors (background, card, primary button, secondary accent, text lines). Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-graphite` from the repository root.
- No code: the extension consists of `extension.json` and the icon, so it needs no permissions.
- Base: a dark theme (`dark: true`). Every text color is set explicitly (`on-background`, `on-surface`, `on-surface-variant`, `on-primary`, `on-secondary` and the `on-*` colors of the status colors), so contrast does not depend on the Vuetify base theme.

## Palette

| Role | Color |
| --- | --- |
| `background` | `#15171B` |
| `surface` | `#1F2227` |
| `surface-variant` | `#2A2E35` |
| `primary` | `#5FB8A8` |
| `secondary` | `#9DB0CC` |
| `hero-start` → `hero-end` | `#2F6F66` → `#1F3F4A` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `extension.json`. Every text pair is at least 4.5:1, and the `primary` accent against `background` is 7.61:1 (at least 3:1 is required for non-text elements).

| Pair | Ratio |
| --- | --- |
| `on-background / background` | 14.89:1 |
| `on-surface / surface` | 13.24:1 |
| `on-surface-variant / surface-variant` | 6.24:1 |
| `on-surface-variant / background` | 8.21:1 |
| `on-primary / primary` | 7.23:1 |
| `on-secondary / secondary` | 8.04:1 |
| `error / surface` | 6.68:1 |
| `warning / surface` | 8.20:1 |
| `success / surface` | 8.35:1 |
| `info / surface` | 7.23:1 |
| `hero-contrast / hero-start` | 5.86:1 |
| `hero-contrast / hero-end` | 11.24:1 |
