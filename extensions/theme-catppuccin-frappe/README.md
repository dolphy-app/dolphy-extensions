# Catppuccin Frappé

A dark theme based on the Catppuccin Frappé palette: a muted gray-blue base and a blue accent.

- Contribution: the theme `theme-catppuccin-frappe` (“Settings → Appearance”; listed there as “Catppuccin Frappé”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/theme-catppuccin-frappe` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-catppuccin-frappe` (the same theme was published as `dolphy.theme-catppuccin-frappe` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer.
- Base: a dark theme (`dark: true`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Catppuccin, https://github.com/catppuccin/palette (palette.json (palette v1.8.0)).
- License of the palette: MIT; Copyright (c) 2021 Catppuccin (https://github.com/catppuccin/palette/blob/main/LICENSE).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | mantle | `#292C3C` |
| `surface` | base | `#303446` |
| `surface-variant` | surface0 | `#414559` |
| `on-surface` | text | `#C6D0F5` |
| `on-surface-variant` | subtext1 | `#B5BFE2` |
| `primary` | blue | `#8CAAEE` |
| `on-primary` | crust | `#232634` |
| `secondary` | teal | `#81C8BE` |
| `on-secondary` | crust | `#232634` |
| `error` | red | `#E78284` |
| `warning` | yellow | `#E5C890` |
| `success` | green | `#A6D189` |
| `info` | sky | `#99D1DB` |
| `hero-start` | blue | `#8CAAEE` |
| `hero-end` | mauve | `#CA9EE6` |
| `hero-contrast` | crust | `#232634` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 9.04:1 | 4.5:1 | yes |
| `on-surface / surface` | 8.06:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 6.19:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 6.75:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 5.19:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 7.58:1 | 4.5:1 | yes |
| `on-primary / primary` | 6.51:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 7.82:1 | 4.5:1 | yes |
| `on-error / error` | 5.67:1 | 4.5:1 | yes |
| `on-warning / warning` | 9.29:1 | 4.5:1 | yes |
| `on-success / success` | 8.66:1 | 4.5:1 | yes |
| `on-info / info` | 8.94:1 | 4.5:1 | yes |
| `primary / background` | 5.99:1 | 3:1 | yes |
| `primary / surface` | 5.34:1 | 4.5:1 | yes |
| `secondary / surface` | 6.41:1 | 4.5:1 | yes |
| `error / surface` | 4.65:1 | 4.5:1 | yes |
| `warning / surface` | 7.62:1 | 4.5:1 | yes |
| `success / surface` | 7.10:1 | 4.5:1 | yes |
| `info / surface` | 7.33:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 6.51:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 6.83:1 | 4.5:1 | yes |

### Known limitations

None: every pair reaches its threshold.
