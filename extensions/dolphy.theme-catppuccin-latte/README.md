# Catppuccin Latte

A light theme based on the Catppuccin Latte palette: a cool gray-blue base and the mauve (violet) accent.

- Contribution: the theme `dolphy.theme-catppuccin-latte` (“Settings → Appearance”; listed there as “Catppuccin Latte”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-catppuccin-latte` from the repository root.
- No code: the extension consists of `extension.json` and the icon, so it needs no permissions.
- Base: a light theme (`dark: false`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Catppuccin, https://github.com/catppuccin/palette (palette.json (palette v1.8.0)).
- License of the palette: MIT; Copyright (c) 2021 Catppuccin (https://github.com/catppuccin/palette/blob/main/LICENSE).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | mantle | `#E6E9EF` |
| `surface` | base | `#EFF1F5` |
| `surface-variant` | crust | `#DCE0E8` |
| `on-surface` | text | `#4C4F69` |
| `on-surface-variant` | subtext1 | `#5C5F77` |
| `primary` | mauve | `#8839EF` |
| `on-primary` | base | `#EFF1F5` |
| `secondary` | blue | `#1E66F5` |
| `on-secondary` | base | `#EFF1F5` |
| `error` | red | `#D20F39` |
| `warning` | yellow | `#DF8E1D` |
| `success` | green | `#40A02B` |
| `info` | blue | `#1E66F5` |
| `hero-start` | mauve | `#8839EF` |
| `hero-end` | blue | `#1E66F5` |
| `hero-contrast` | base | `#EFF1F5` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `extension.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 6.57:1 | 4.5:1 | yes |
| `on-surface / surface` | 7.06:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 6.04:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 5.53:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 4.73:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 5.14:1 | 4.5:1 | yes |
| `on-primary / primary` | 4.79:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 4.34:1 | 4.5:1 | **no** |
| `on-error / error` | 4.80:1 | 4.5:1 | yes |
| `on-warning / warning` | 3.05:1 | 4.5:1 | **no** |
| `on-success / success` | 2.96:1 | 4.5:1 | **no** |
| `on-info / info` | 4.34:1 | 4.5:1 | **no** |
| `primary / background` | 4.45:1 | 3:1 | yes |
| `primary / surface` | 4.79:1 | 4.5:1 | yes |
| `secondary / surface` | 4.34:1 | 4.5:1 | **no** |
| `error / surface` | 4.80:1 | 4.5:1 | yes |
| `warning / surface` | 2.31:1 | 4.5:1 | **no** |
| `success / surface` | 2.96:1 | 4.5:1 | **no** |
| `info / surface` | 4.34:1 | 4.5:1 | **no** |
| `hero-contrast / hero-start` | 4.79:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 4.34:1 | 4.5:1 | **no** |

### Known limitations

The official colors are used as they are, so these pairs stay below 4.5:1. Palette alternatives that keep the meaning of the role were tried first. Use these colors for fills, icons and large or bold text only, not for small body text:

- `on-secondary / secondary`: 4.34:1 (meets only the 3:1 threshold for large text and graphics)
- `on-warning / warning`: 3.05:1 (meets only the 3:1 threshold for large text and graphics)
- `on-success / success`: 2.96:1 (below even 3:1)
- `on-info / info`: 4.34:1 (meets only the 3:1 threshold for large text and graphics)
- `secondary / surface`: 4.34:1 (meets only the 3:1 threshold for large text and graphics)
- `warning / surface`: 2.31:1 (below even 3:1)
- `success / surface`: 2.96:1 (below even 3:1)
- `info / surface`: 4.34:1 (meets only the 3:1 threshold for large text and graphics)
- `hero-contrast / hero-end`: 4.34:1 (meets only the 3:1 threshold for large text and graphics)
