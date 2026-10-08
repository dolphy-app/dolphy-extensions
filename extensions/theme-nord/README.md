# Nord

A dark theme based on the Nord palette: arctic blue-gray surfaces and an icy cyan accent. Nord has no official light variant, so there is only this one.

- Contribution: the theme `theme-nord` (“Settings → Appearance”; listed there as “Nord”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/theme-nord` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-nord` (the same theme was published as `dolphy.theme-nord` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer. 1.1.0 adds English and Russian descriptions and needs Dolphy 0.7.0 or newer.
- Base: a dark theme (`dark: true`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Nord, https://www.nordtheme.com/docs/colors-and-palettes (nord0–nord15 (also https://github.com/nordtheme/nord)).
- License of the palette: MIT; Copyright (c) 2016-present Sven Greb (https://github.com/nordtheme/nord/blob/develop/license).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | nord0 | `#2E3440` |
| `surface` | nord1 | `#3B4252` |
| `surface-variant` | nord2 | `#434C5E` |
| `on-surface` | nord6 | `#ECEFF4` |
| `on-surface-variant` | nord4 | `#D8DEE9` |
| `primary` | nord8 | `#88C0D0` |
| `on-primary` | nord0 | `#2E3440` |
| `secondary` | nord14 | `#A3BE8C` |
| `on-secondary` | nord0 | `#2E3440` |
| `error` | nord11 | `#BF616A` |
| `warning` | nord13 | `#EBCB8B` |
| `success` | nord14 | `#A3BE8C` |
| `info` | nord7 | `#8FBCBB` |
| `hero-start` | nord8 | `#88C0D0` |
| `hero-end` | nord9 | `#81A1C1` |
| `hero-contrast` | nord0 | `#2E3440` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 10.84:1 | 4.5:1 | yes |
| `on-surface / surface` | 8.73:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 7.49:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 7.45:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 6.39:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 9.25:1 | 4.5:1 | yes |
| `on-primary / primary` | 6.24:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 6.13:1 | 4.5:1 | yes |
| `on-error / error` | 3.55:1 | 4.5:1 | **no** |
| `on-warning / warning` | 8.00:1 | 4.5:1 | yes |
| `on-success / success` | 6.13:1 | 4.5:1 | yes |
| `on-info / info` | 5.99:1 | 4.5:1 | yes |
| `primary / background` | 6.24:1 | 3:1 | yes |
| `primary / surface` | 5.03:1 | 4.5:1 | yes |
| `secondary / surface` | 4.94:1 | 4.5:1 | yes |
| `error / surface` | 2.46:1 | 4.5:1 | **no** |
| `warning / surface` | 6.44:1 | 4.5:1 | yes |
| `success / surface` | 4.94:1 | 4.5:1 | yes |
| `info / surface` | 4.83:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 6.24:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 4.64:1 | 4.5:1 | yes |

### Known limitations

The official colors are used as they are, so these pairs stay below 4.5:1. Palette alternatives that keep the meaning of the role were tried first. Use these colors for fills, icons and large or bold text only, not for small body text:

- `on-error / error`: 3.55:1 (meets only the 3:1 threshold for large text and graphics)
- `error / surface`: 2.46:1 (below even 3:1)
