# Dolphy extension catalog

This repository holds the sources of the extensions that can be installed from the Dolphy app (“Settings → Extensions → Catalog”). An extension enters the catalog through a pull request, passes automated checks and review, and after the merge CI builds and publishes it.

- What an extension is and how to write one: [docs/design/extensions.md](https://github.com/dolphy-app/dolphy/blob/develop/docs/design/extensions.md) in the main repository.
- Review rules: [skills/extension-reviewer/SKILL.md](skills/extension-reviewer/SKILL.md) and [rules/rules.json](rules/rules.json).

## How to install an extension

In the app, open “Settings → Extensions → Catalog”, find the extension and click “Install”. Before installing, the app shows the permissions the extension requests. Extensions from the catalog run in isolation; its limits are described in ADR 0003 of the main repository.

## How to publish an extension

1. Create a project: `npx --package=@dolphy-app/create-extension create-dolphy-extension <directory> --id <id>`..
2. Finish the extension and check it with `npx dolphy-ext build` and `npx dolphy-ext validate dist-ext/<id>`.
3. Fork this repository and put the project in `extensions/<id>/`, where `<id>` is exactly the `id` from `extension.json`. The project must contain:
   - `extension.json` with `name`, `description` and `author` (your GitHub login), and a version greater than the published one;
   - `README.md` — what the extension does and why it needs its permissions;
   - `package.json` and a lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` or `bun.lock`); dependencies only from the registry, no `postinstall`, `prepare` or similar scripts.
4. Check locally: `npx dolphy-ext catalog check extensions --ids <id> --skip-github-check`. List the rules with `npx dolphy-ext catalog check --list-rules`.
5. Open a pull request. CI runs the checks and a trial build. A maintainer performs a semantic review against the rules in `rules/rules.json`.
6. After the merge into `main`, CI builds the extension and adds its version to the catalog.

Published versions never change. To ship a fix, bump `version` and open a new pull request.

## Theme icons

An extension can have an icon (`"icon": "assets/icon.png"` in `extension.json`); the app shows it in the catalog, the install dialog and the list of installed extensions. For a theme the icon is a miniature of the app drawn from the theme's own colors: a backdrop in `background`, a `surface` card, a `primary` button, a `secondary` accent dot and text lines in `on-surface` / `on-surface-variant`.

Generate it with the script of this repository (plain Node 22.12 or newer, no dependencies):

```sh
node scripts/theme-icon.mjs extensions/<id> [extensions/<id> ...]
```

- It reads the first theme of `contributes.themes` in `extensions/<id>/extension.json` and writes `extensions/<id>/assets/icon.png`: 128×128, an opaque rounded square with transparent corners, well under the 16 KiB limit. The same colors always produce the same bytes.
- It does not edit the manifest: add `"icon": "assets/icon.png"` yourself. Published versions never change, so adding or changing an icon needs a new `version`.
- Run it again after changing a theme's colors.

## How the catalog works

| What | Where |
| --- | --- |
| Extension sources | `extensions/<id>/` (`main` branch) |
| Published files and index | `gh-pages` branch: `index.json` and `extensions/<id>/<version>/…` |
| Version revocation | `revoked.json` (a list of `{ id, versions, reason }`) |
| PR checks | `.github/workflows/pr-check.yml` |
| Publishing | `.github/workflows/deploy.yml` |

The app reads `index.json` and downloads a version's files by relative `baseUrl`, verifying the size and sha256 of every file. The index keeps at most the five latest versions of an extension; older directories stay in `gh-pages`.

## For maintainers

- **Revoking a version.** Add an entry to `revoked.json`, for example `{ "id": "acme.tool", "versions": "<1.2.0", "reason": "..." }`. Ranges `<`, `<=`, `>`, `>=`, `=` and their space-separated combinations are allowed. After the merge CI rebuilds the index; apps disable installed revoked versions on their next check.
- **GitHub Pages.** The source is the `gh-pages` branch, root directory. The free GitHub plan serves Pages only from public repositories, so the repository must be public before the first publication.
- **Branch protection.** Enable protection for `main` (required `PR check` status, merge only through a pull request) wherever your plan allows it.
- **The index the app reads:** `https://dolphy-app.github.io/dolphy-extensions/index.json`.
