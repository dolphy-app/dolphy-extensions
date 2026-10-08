# Gruvbox Dark

A dark retro theme based on the Gruvbox palette: warm brown-gray surfaces and an orange accent.

- Contribution: the theme `theme-gruvbox-dark` (“Settings → Appearance”; listed there as “Gruvbox Dark”).
- Icon: `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's colors. Regenerate it with `node scripts/theme-icon.mjs extensions/theme-gruvbox-dark` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Versions: 1.0.0 is the first release under the id `theme-gruvbox-dark` (the same theme was published as `dolphy.theme-gruvbox-dark` before; the colors are unchanged). Requires Dolphy 0.5.0 or newer.
- Base: a dark theme (`dark: true`). Every text color is set explicitly, so contrast does not depend on the Vuetify base theme.

## Palette source

Colors from the official palette, mapped to Dolphy theme roles. No color value is changed or invented; the mapping below only chooses which palette color plays which role.

- Palette: Gruvbox, https://github.com/morhetz/gruvbox (colors/gruvbox.vim).
- License of the palette: MIT/X11 (stated in the README and package.json of the repository; it has no separate LICENSE file); Pavel Pertsev (author in package.json) (https://github.com/morhetz/gruvbox#license).
- This extension is an independent adaptation and is not affiliated with or endorsed by the palette's authors.

| Role | Palette color | Value |
| --- | --- | --- |
| `background` | dark0_hard | `#1D2021` |
| `surface` | dark0 | `#282828` |
| `surface-variant` | dark1 | `#3C3836` |
| `on-surface` | light1 | `#EBDBB2` |
| `on-surface-variant` | light3 | `#BDAE93` |
| `primary` | bright_orange | `#FE8019` |
| `on-primary` | dark0_hard | `#1D2021` |
| `secondary` | bright_aqua | `#8EC07C` |
| `on-secondary` | dark0_hard | `#1D2021` |
| `error` | bright_red | `#FB4934` |
| `warning` | bright_yellow | `#FABD2F` |
| `success` | bright_green | `#B8BB26` |
| `info` | bright_blue | `#83A598` |
| `hero-start` | faded_orange | `#AF3A03` |
| `hero-end` | faded_purple | `#8F3F71` |
| `hero-contrast` | light0 | `#FBF1C7` |

## Contrast

WCAG 2.x contrast ratios computed from the colors in `src/theme.json`. Text pairs need 4.5:1; the `primary` accent against `background` needs 3:1.

| Pair | Ratio | Needed | Met |
| --- | --- | --- | --- |
| `on-background / background` | 11.95:1 | 4.5:1 | yes |
| `on-surface / surface` | 10.75:1 | 4.5:1 | yes |
| `on-surface / surface-variant` | 8.45:1 | 4.5:1 | yes |
| `on-surface-variant / surface` | 6.77:1 | 4.5:1 | yes |
| `on-surface-variant / surface-variant` | 5.32:1 | 4.5:1 | yes |
| `on-surface-variant / background` | 7.53:1 | 4.5:1 | yes |
| `on-primary / primary` | 6.49:1 | 4.5:1 | yes |
| `on-secondary / secondary` | 7.79:1 | 4.5:1 | yes |
| `on-error / error` | 4.77:1 | 4.5:1 | yes |
| `on-warning / warning` | 9.67:1 | 4.5:1 | yes |
| `on-success / success` | 7.94:1 | 4.5:1 | yes |
| `on-info / info` | 6.09:1 | 4.5:1 | yes |
| `primary / background` | 6.49:1 | 3:1 | yes |
| `primary / surface` | 5.84:1 | 4.5:1 | yes |
| `secondary / surface` | 7.01:1 | 4.5:1 | yes |
| `error / surface` | 4.29:1 | 4.5:1 | **no** |
| `warning / surface` | 8.69:1 | 4.5:1 | yes |
| `success / surface` | 7.14:1 | 4.5:1 | yes |
| `info / surface` | 5.48:1 | 4.5:1 | yes |
| `hero-contrast / hero-start` | 5.40:1 | 4.5:1 | yes |
| `hero-contrast / hero-end` | 5.94:1 | 4.5:1 | yes |

### Known limitations

The official colors are used as they are, so these pairs stay below 4.5:1. Palette alternatives that keep the meaning of the role were tried first. Use these colors for fills, icons and large or bold text only, not for small body text:

- `error / surface`: 4.29:1 (meets only the 3:1 threshold for large text and graphics)
