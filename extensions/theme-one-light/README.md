# One Light

A light theme based on the One Light palette of the Atom editor: near-white surfaces and a violet accent.

- Contribution: the theme `theme-one-light` (“Settings → Appearance”; listed there as “One Light”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/theme-one-light` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-one-light` (the same theme was published as `dolphy.theme-one-light` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer. 1.1.0 adds English and Russian descriptions and needs Dolphy 0.7.0 or newer.
- Base: a light theme (`dark: false`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: One Dark / One Light (Atom), https://github.com/atom/atom/tree/master/packages (one-dark-syntax and one-dark-ui / one-light-syntax and one-light-ui (styles/colors.less, ui-variables-custom.less; HSL values converted to #rrggbb)).
- License of the palette: MIT; Copyright (c) 2011-2022 GitHub Inc. (https://github.com/atom/atom/blob/master/LICENSE.md).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | bg | `#FAFAFA` |
| `surface` | level-1 | `#FFFFFF` |
| `surface-variant` | level-3 | `#EAEAEB` |
| `on-surface` | highlight | `#232324` |
| `on-surface-variant` | mono-1 | `#383A42` |
| `primary` | purple | `#A626A4` |
| `on-primary` | level-1 | `#FFFFFF` |
| `secondary` | blue | `#4078F2` |
| `on-secondary` | level-1 | `#FFFFFF` |
| `error` | red2 | `#CA1243` |
| `warning` | orange1 | `#B76B01` |
| `success` | green | `#50A14F` |
| `info` | cyan | `#0184BC` |
| `hero-start` | purple | `#A626A4` |
| `hero-end` | blue | `#4078F2` |
| `hero-contrast` | level-1 | `#FFFFFF` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 15.04:1 | 4.5:1 | yes |
| `on-surface / surface` | 15.70:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 13.06:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 11.34:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 9.43:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 10.86:1 | 4.5:1 | yes |
| `on-primary / primary` | 6.11:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 4.05:1 | 4.5:1 | **no** |
| `on-error / error` | 5.71:1 | 4.5:1 | yes |
| `on-warning / warning` | 4.10:1 | 4.5:1 | **no** |
| `on-success / success` | 3.21:1 | 4.5:1 | **no** |
| `on-info / info` | 4.18:1 | 4.5:1 | **no** |
| `primary / background` | 5.86:1 | 3:1 | yes |
| `primary / surface` | 6.11:1 | 4.5:1 | yes |
| `secondary / surface` | 4.05:1 | 4.5:1 | **no** |
| `error / surface` | 5.71:1 | 4.5:1 | yes |
| `warning / surface` | 4.10:1 | 4.5:1 | **no** |
| `success / surface` | 3.21:1 | 4.5:1 | **no** |
| `info / surface` | 4.18:1 | 4.5:1 | **no** |
| `hero-contrast / hero-start` | 6.11:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 4.05:1 | 4.5:1 | **no** |

### Known limitations

The official colors are used as they are, so these pairs stay below 4.5:1. Palette alternatives that keep the meaning of the role were tried first. Use these colors for fills, icons and large or bold text only, not for small body text:

- `on-secondary / secondary`: 4.05:1 (meets only the 3:1 threshold for large text and graphics)
- `on-warning / warning`: 4.10:1 (meets only the 3:1 threshold for large text and graphics)
- `on-success / success`: 3.21:1 (meets only the 3:1 threshold for large text and graphics)
- `on-info / info`: 4.18:1 (meets only the 3:1 threshold for large text and graphics)
- `secondary / surface`: 4.05:1 (meets only the 3:1 threshold for large text and graphics)
- `warning / surface`: 4.10:1 (meets only the 3:1 threshold for large text and graphics)
- `success / surface`: 3.21:1 (meets only the 3:1 threshold for large text and graphics)
- `info / surface`: 4.18:1 (meets only the 3:1 threshold for large text and graphics)
- `hero-contrast / hero-end`: 4.05:1 (meets only the 3:1 threshold for large text and graphics)
