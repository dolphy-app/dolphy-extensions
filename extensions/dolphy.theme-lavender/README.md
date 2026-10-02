# Lavender

A soft light theme for Dolphy: pale lavender background, white cards and a violet accent.

- Contribution: the theme `dolphy.theme-lavender` (“Settings → Appearance”; listed there as “Лаванда”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors (background, card, primary button, secondary accent, text lines). Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-lavender` from the repository root.
- No code: the extension consists of `extension.json` and the icon, so it needs no permissions.
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

WCAG 2.x contrast ratios computed from the colors in `extension.json`. Every text pair is at least 4.5:1, and the `primary` accent against `background` is 6.42:1 (at least 3:1 is required for non-text elements).

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
