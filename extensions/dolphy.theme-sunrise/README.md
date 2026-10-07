# Sunrise

A warm light theme for Dolphy: beige background, white cards and an amber accent.

- Contribution: the theme `dolphy.theme-sunrise` (“Settings → Appearance”; listed there as “Рассвет”).
- Icon (since 1.1.0): `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors. Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-sunrise` from the repository root.
- Layout (app 0.5 format): `extension.json` holds the metadata (`minAppVersion` 0.5.0, tag `theme`), `src/theme.json` holds the theme and `src/index.ts` registers it from the `client` export with `addTheme`; `dolphy-ext build` produces `client.mjs`. The theme is plain data, with no server part. The extension runs with the rights of the app, but this one reads no files, uses no network and stores nothing.
- Contrast of the main text/background pairs is at least 4.5:1 (the `#B45309` accent on white is 5.0:1).
- Versions: 2.0.0 moves the extension to the app 0.5 format (requires Dolphy 0.5.0 or newer; the colors are unchanged); 1.1.0 adds the icon; 1.0.0 was the first release. Apps older than 0.5 keep the 1.x versions.

This is a sample theme extension: to make your own, copy the directory, change `id`, `version`, `name`, `author` and the colors in `src/theme.json` (and the `id` and label there), then open a pull request (see the root `README.md`).
