# Sunrise

A warm light theme for Dolphy: beige background, white cards and an amber accent.

- Contribution: the theme `dolphy.theme-sunrise` (“Settings → Appearance”; listed there as “Рассвет”).
- Icon (since 1.1.0): `assets/icon.png`, a 128×128 miniature of the app drawn from the theme's own colors. Regenerate it with `node scripts/theme-icon.mjs extensions/dolphy.theme-sunrise` from the repository root.
- No code: the extension consists of `extension.json` and the icon, so it needs no permissions.
- Contrast of the main text/background pairs is at least 4.5:1 (the `#B45309` accent on white is 5.0:1).
- Versions: 1.1.0 adds the icon (the colors are unchanged); 1.0.0 was the first release.

This is a sample extension without code: to make your own theme, copy the directory, change `id`, `version`, `name`, `author` and the colors, then open a pull request (see the root `README.md`).
