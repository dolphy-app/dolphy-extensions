# One Dark

A dark theme based on the One Dark palette of the Atom editor: blue-gray surfaces and a blue accent.

- Contribution: the theme `theme-one-dark` (“Settings → Appearance”; listed there as “One Dark”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/theme-one-dark` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-one-dark` (the same theme was published as `dolphy.theme-one-dark` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer.
- Base: a dark theme (`dark: true`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: One Dark / One Light (Atom), https://github.com/atom/atom/tree/master/packages (one-dark-syntax and one-dark-ui / one-light-syntax and one-light-ui (styles/colors.less, ui-variables-custom.less; HSL values converted to #rrggbb)).
- License of the palette: MIT; Copyright (c) 2011-2022 GitHub Inc. (https://github.com/atom/atom/blob/master/LICENSE.md).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | level-3 | `#21252B` |
| `surface` | bg | `#282C34` |
| `surface-variant` | level-1 | `#353B45` |
| `on-surface` | highlight | `#D7DAE0` |
| `on-surface-variant` | mono-1 | `#ABB2BF` |
| `primary` | blue | `#61AFEF` |
| `on-primary` | level-3 | `#21252B` |
| `secondary` | purple | `#C678DD` |
| `on-secondary` | level-3 | `#21252B` |
| `error` | red1 | `#E06C75` |
| `warning` | orange2 | `#E5C07B` |
| `success` | green | `#98C379` |
| `info` | cyan | `#56B6C2` |
| `hero-start` | blue | `#61AFEF` |
| `hero-end` | purple | `#C678DD` |
| `hero-contrast` | level-3 | `#21252B` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 10.99:1 | 4.5:1 | yes |
| `on-surface / surface` | 10.00:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 8.05:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 6.57:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 5.29:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 7.22:1 | 4.5:1 | yes |
| `on-primary / primary` | 6.51:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 5.23:1 | 4.5:1 | yes |
| `on-error / error` | 4.82:1 | 4.5:1 | yes |
| `on-warning / warning` | 8.91:1 | 4.5:1 | yes |
| `on-success / success` | 7.64:1 | 4.5:1 | yes |
| `on-info / info` | 6.50:1 | 4.5:1 | yes |
| `primary / background` | 6.51:1 | 3:1 | yes |
| `primary / surface` | 5.92:1 | 4.5:1 | yes |
| `secondary / surface` | 4.75:1 | 4.5:1 | yes |
| `error / surface` | 4.38:1 | 4.5:1 | **no** |
| `warning / surface` | 8.10:1 | 4.5:1 | yes |
| `success / surface` | 6.94:1 | 4.5:1 | yes |
| `info / surface` | 5.91:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 6.51:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 5.23:1 | 4.5:1 | yes |

### Known limitations

The official colors are used as they are, so these pairs stay below 4.5:1. Palette alternatives that keep the meaning of the role were tried first. Use these colors for fills, icons and large or bold text only, not for small body text:

- `error / surface`: 4.38:1 (meets only the 3:1 threshold for large text and graphics)
