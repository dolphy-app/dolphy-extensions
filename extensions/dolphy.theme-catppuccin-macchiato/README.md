# Catppuccin Macchiato

A dark theme based on the Catppuccin Macchiato palette: a deep blue-gray base and a pink accent.

- Contribution: the theme `dolphy.theme-catppuccin-macchiato` (“Settings → Appearance”; listed there as “Catppuccin Macchiato”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-catppuccin-macchiato` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 2.0.0 moves the extension to the app 0.5 format (requires Dolphy 0.5.0 or newer; the colors are unchanged); 1.0.0 was the first release. Apps older than 0.5 keep 1.0.0.
- Base: a dark theme (`dark: true`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Catppuccin, https://github.com/catppuccin/palette (palette.json (palette v1.8.0)).
- License of the palette: MIT; Copyright (c) 2021 Catppuccin (https://github.com/catppuccin/palette/blob/main/LICENSE).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | mantle | `#1E2030` |
| `surface` | base | `#24273A` |
| `surface-variant` | surface0 | `#363A4F` |
| `on-surface` | text | `#CAD3F5` |
| `on-surface-variant` | subtext1 | `#B8C0E0` |
| `primary` | pink | `#F5BDE6` |
| `on-primary` | crust | `#181926` |
| `secondary` | sapphire | `#7DC4E4` |
| `on-secondary` | crust | `#181926` |
| `error` | red | `#ED8796` |
| `warning` | yellow | `#EED49F` |
| `success` | green | `#A6DA95` |
| `info` | sky | `#91D7E3` |
| `hero-start` | pink | `#F5BDE6` |
| `hero-end` | mauve | `#C6A0F6` |
| `hero-contrast` | crust | `#181926` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 10.85:1 | 4.5:1 | yes |
| `on-surface / surface` | 9.92:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 7.55:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 8.17:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 6.22:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 8.93:1 | 4.5:1 | yes |
| `on-primary / primary` | 11.03:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 9.03:1 | 4.5:1 | yes |
| `on-error / error` | 7.05:1 | 4.5:1 | yes |
| `on-warning / warning` | 12.07:1 | 4.5:1 | yes |
| `on-success / success` | 10.85:1 | 4.5:1 | yes |
| `on-info / info` | 10.81:1 | 4.5:1 | yes |
| `primary / background` | 10.20:1 | 3:1 | yes |
| `primary / surface` | 9.33:1 | 4.5:1 | yes |
| `secondary / surface` | 7.63:1 | 4.5:1 | yes |
| `error / surface` | 5.96:1 | 4.5:1 | yes |
| `warning / surface` | 10.20:1 | 4.5:1 | yes |
| `success / surface` | 9.17:1 | 4.5:1 | yes |
| `info / surface` | 9.14:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 11.03:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 8.09:1 | 4.5:1 | yes |

### Known limitations

None: every pair reaches its threshold.
