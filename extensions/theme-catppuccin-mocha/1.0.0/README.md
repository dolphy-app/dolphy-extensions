# Catppuccin Mocha

The darkest Catppuccin flavor, Mocha: an almost black violet-tinted base and the mauve (violet) accent.

- Contribution: the theme `theme-catppuccin-mocha` (“Settings → Appearance”; listed there as “Catppuccin Mocha”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/theme-catppuccin-mocha` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-catppuccin-mocha` (the same theme was published as `dolphy.theme-catppuccin-mocha` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer.
- Base: a dark theme (`dark: true`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Catppuccin, https://github.com/catppuccin/palette (palette.json (palette v1.8.0)).
- License of the palette: MIT; Copyright (c) 2021 Catppuccin (https://github.com/catppuccin/palette/blob/main/LICENSE).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | mantle | `#181825` |
| `surface` | base | `#1E1E2E` |
| `surface-variant` | surface0 | `#313244` |
| `on-surface` | text | `#CDD6F4` |
| `on-surface-variant` | subtext1 | `#BAC2DE` |
| `primary` | mauve | `#CBA6F7` |
| `on-primary` | crust | `#11111B` |
| `secondary` | teal | `#94E2D5` |
| `on-secondary` | crust | `#11111B` |
| `error` | red | `#F38BA8` |
| `warning` | yellow | `#F9E2AF` |
| `success` | green | `#A6E3A1` |
| `info` | sky | `#89DCEB` |
| `hero-start` | mauve | `#CBA6F7` |
| `hero-end` | blue | `#89B4FA` |
| `hero-contrast` | crust | `#11111B` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 12.14:1 | 4.5:1 | yes |
| `on-surface / surface` | 11.34:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 8.69:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 9.26:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 7.10:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 9.91:1 | 4.5:1 | yes |
| `on-primary / primary` | 9.23:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 12.59:1 | 4.5:1 | yes |
| `on-error / error` | 8.10:1 | 4.5:1 | yes |
| `on-warning / warning` | 14.76:1 | 4.5:1 | yes |
| `on-success / success` | 12.61:1 | 4.5:1 | yes |
| `on-info / info` | 12.06:1 | 4.5:1 | yes |
| `primary / background` | 8.64:1 | 3:1 | yes |
| `primary / surface` | 8.07:1 | 4.5:1 | yes |
| `secondary / surface` | 11.01:1 | 4.5:1 | yes |
| `error / surface` | 7.08:1 | 4.5:1 | yes |
| `warning / surface` | 12.91:1 | 4.5:1 | yes |
| `success / surface` | 11.03:1 | 4.5:1 | yes |
| `info / surface` | 10.54:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 9.23:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 8.91:1 | 4.5:1 | yes |

### Known limitations

None: every pair reaches its threshold.
