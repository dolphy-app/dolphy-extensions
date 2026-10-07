# AGENTS.md

Rules for agents and contributors of the Dolphy extension catalog.

## Language

**All READMEs and similar documentation texts must be written in English.** This covers the root `README.md`, every `extensions/<id>/README.md`, and any new documentation added to this repository (guides, changelogs, descriptions of extensions and their permissions).

- When you add or edit such a text, write it in English; translate Russian text you touch.
- Identifiers, code, commands and file names stay as they are. Quote app UI labels in English (“Settings → Extensions → Catalog”); if the extension's own manifest label is localized, mention it in parentheses.
- Extension data such as `name`, `description` and theme `label` in `extension.json` is content of the extension, not documentation, and is not governed by this rule.

## Extension format (app 0.5)

- An extension is `extensions/<id>/` with `extension.json` (identity and metadata only: no `contributes`, no `permissions`), `src/index.ts` (the `server` and `client` exports that register contributions), `README.md`, `package.json` and a lockfile. `<id>` equals the `id` in the manifest.
- Set `minAppVersion` (`0.5.0` or newer) and `tags` (the allowed values are listed in the `@dolphy-app/extension-tools` README). A change to a published extension needs a new `version`; a change of the format is a new major version.
- Themes keep the theme object in `src/theme.json` and register it in `src/index.ts` with `addTheme`. After changing the colors, regenerate the icon with `node scripts/theme-icon.mjs extensions/<id>`.
- Extensions run without restrictions, so the `README.md` of an extension must say what it reads, writes and sends; the review rules are in `rules/rules.json`.
- Check before a pull request: `npx dolphy-ext catalog check extensions --ids <id> --skip-github-check`, then `npx dolphy-ext build extensions/<id> --out /tmp/out`.
