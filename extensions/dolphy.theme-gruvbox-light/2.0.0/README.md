# Gruvbox Light

A light retro theme based on the Gruvbox palette: cream surfaces and a blue-teal accent.

- Contribution: the theme `dolphy.theme-gruvbox-light` (“Settings → Appearance”; listed there as “Gruvbox Light”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-gruvbox-light` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 2.0.0 moves the extension to the app 0.5 format (requires Dolphy 0.5.0 or newer; the colors are unchanged); 1.0.0 was the first release. Apps older than 0.5 keep 1.0.0.
- Base: a light theme (`dark: false`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Gruvbox, https://github.com/morhetz/gruvbox (colors/gruvbox.vim).
- License of the palette: MIT/X11 (stated in the README and package.json of the repository; it has no separate LICENSE file); Pavel Pertsev (author in package.json) (https://github.com/morhetz/gruvbox#license).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | light0_hard | `#F9F5D7` |
| `surface` | light0 | `#FBF1C7` |
| `surface-variant` | light1 | `#EBDBB2` |
| `on-surface` | dark1 | `#3C3836` |
| `on-surface-variant` | dark3 | `#665C54` |
| `primary` | faded_blue | `#076678` |
| `on-primary` | light0 | `#FBF1C7` |
| `secondary` | faded_orange | `#AF3A03` |
| `on-secondary` | light0 | `#FBF1C7` |
| `error` | faded_red | `#9D0006` |
| `warning` | faded_yellow | `#B57614` |
| `success` | faded_green | `#79740E` |
| `info` | faded_blue | `#076678` |
| `hero-start` | faded_blue | `#076678` |
| `hero-end` | faded_purple | `#8F3F71` |
| `hero-contrast` | light0 | `#FBF1C7` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 10.53:1 | 4.5:1 | yes |
| `on-surface / surface` | 10.22:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 8.45:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 5.74:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 4.75:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 5.92:1 | 4.5:1 | yes |
| `on-primary / primary` | 5.82:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 5.40:1 | 4.5:1 | yes |
| `on-error / error` | 7.60:1 | 4.5:1 | yes |
| `on-warning / warning` | 3.91:1 | 4.5:1 | **no** |
| `on-success / success` | 4.29:1 | 4.5:1 | **no** |
| `on-info / info` | 5.82:1 | 4.5:1 | yes |
| `primary / background` | 6.00:1 | 3:1 | yes |
| `primary / surface` | 5.82:1 | 4.5:1 | yes |
| `secondary / surface` | 5.40:1 | 4.5:1 | yes |
| `error / surface` | 7.60:1 | 4.5:1 | yes |
| `warning / surface` | 3.33:1 | 4.5:1 | **no** |
| `success / surface` | 4.29:1 | 4.5:1 | **no** |
| `info / surface` | 5.82:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 5.82:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 5.94:1 | 4.5:1 | yes |

### Known limitations

The official colors are used as they are, so these pairs stay below 4.5:1. Palette alternatives that keep the meaning of the role were tried first. Use these colors for fills, icons and large or bold text only, not for small body text:

- `on-warning / warning`: 3.91:1 (meets only the 3:1 threshold for large text and graphics)
- `on-success / success`: 4.29:1 (meets only the 3:1 threshold for large text and graphics)
- `warning / surface`: 3.33:1 (meets only the 3:1 threshold for large text and graphics)
- `success / surface`: 4.29:1 (meets only the 3:1 threshold for large text and graphics)
