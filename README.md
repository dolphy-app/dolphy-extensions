# Dolphy extension catalog

This repository holds the sources of the extensions that can be installed from the Dolphy app (“Settings → Extensions → Catalog”). An extension enters the catalog through a pull request, passes automated checks and review, and after the merge CI builds and publishes it. The catalog works with Dolphy 0.5.0 and newer; apps older than 0.5 keep seeing the 1.x versions of the themes that were published before.

- What an extension is and how to write one: [docs/design/extensions.md](https://github.com/dolphy-app/dolphy/blob/develop/docs/design/extensions.md) in the main repository.
- Review rules: [skills/extension-reviewer/SKILL.md](skills/extension-reviewer/SKILL.md) and [rules/rules.json](rules/rules.json).

## How to install an extension

In the app, open “Settings → Extensions → Catalog”, find the extension and click “Install”. The extension starts working at once, without a restart.

Extensions run with the rights of the app: there is no sandbox and no permission prompt, and an extension can reach files, processes, the network and your learning data. What protects you is the review: every extension and every new version enters the catalog through a pull request that passes automated checks and a maintainer's review against [rules/rules.json](rules/rules.json). The review reads the code, but it is not a guarantee, so install only what you need.

## How to publish an extension

1. Create a project, either from the template repository [`dolphy-app/dolphy-extension-template`](https://github.com/dolphy-app/dolphy-extension-template) (“Use this template”; every folder in its `extensions/` can be moved into this repository as it is), or with `npx --package=@dolphy-app/create-extension create-dolphy-extension <directory> --id <id>`.
2. Write the extension and check that it builds: `npx dolphy-ext build` (writes `dist-ext/<id>/`).
3. Fork this repository and put the project in `extensions/<id>/`, where `<id>` is exactly the `id` from `extension.json`.
4. Check it as the catalog will: `npx dolphy-ext catalog check extensions --ids <id> --skip-github-check`. List the rules with `npx dolphy-ext catalog check --list-rules`.
5. Open a pull request. CI runs the checks and a trial build. A maintainer reviews the change against the rules in `rules/rules.json`.
6. After the merge into `main`, CI builds the extension and adds its version to the catalog.

Published versions never change. To ship a fix, bump `version` and open a new pull request.

### The extension format

An extension is a project with an `extension.json` and `src/index.ts`. The manifest holds identity and metadata only: `id`, `version`, `apiVersion`, `name`, `description`, `author`, `minAppVersion`, `icon`, `tags` and `dependencies`. It declares no contributions and no permissions; a manifest with a `contributes` key is rejected.

`src/index.ts` has two optional exports, and at least one must exist. `server` runs in the extension host and registers exercise types, grade policies, commands, schedules, importers, exporters, settings and event handlers; `client` runs in the app window and adds panels, injections, answer views, markdown renderers, themes and client commands. `dolphy-ext build` bundles them into `main.mjs` and `client.mjs` and writes the matching `main` and `client` fields into the built manifest. For example, a theme is only this:

```ts
export const client = (c: { addTheme(theme: object): unknown }): void => {
  c.addTheme({ id: 'acme.dawn', label: 'Dawn', dark: false, colors: { background: '#FBF6F0', surface: '#FFFFFF', primary: '#B45309', 'on-primary': '#FFFFFF' } });
};
```

The themes in this repository keep the theme in `src/theme.json` and register it from `src/index.ts`.

### What the catalog requires

`dolphy-ext catalog check` (and the pull request check) requires, per extension:

- `extension.json` with `name`, `description` (at least 20 characters), `author` (your GitHub login) and a `version` greater than the published one; set `minAppVersion` (`0.5.0` or newer) and `tags`;
- `README.md` that says what the extension does and what it accesses (files, processes, the network, learning data);
- `package.json` and a lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` or `bun.lock`) inside the extension directory, even if there are no dependencies;
- dependencies from the registry only, no `postinstall`, `prepare` or similar lifecycle scripts;
- limits: at most 200 files and 5 MB, no symbolic links, no executables, the icon a square PNG or WebP of 64–512 px up to 16 KiB.

## Theme icons

An extension can have an icon (`"icon": "assets/icon.png"` in `extension.json`); the app shows it in the catalog, the install dialog and the list of installed extensions. For a theme the icon is a miniature of the app drawn from the theme's own colors: a backdrop in `background`, a `surface` card, a `primary` button, a `secondary` accent dot and text lines in `on-surface` / `on-surface-variant`.

Generate it with the script of this repository (plain Node 22.12 or newer, no dependencies):

```sh
node scripts/theme-icon.mjs extensions/<id> [extensions/<id> ...]
```

- It reads the theme from `extensions/<id>/src/theme.json` (an object with `colors`, optional `variables` and `dark`, as passed to `addTheme`) and writes `extensions/<id>/assets/icon.png`: 128×128, an opaque rounded square with transparent corners, well under the 16 KiB limit. The same colors always produce the same bytes.
- It does not edit the manifest: add `"icon": "assets/icon.png"` yourself. Published versions never change, so adding or changing an icon needs a new `version`.
- Run it again after changing a theme's colors.

## How the catalog works

| What | Where |
| --- | --- |
| Extension sources | `extensions/<id>/` (`main` branch) |
| Published files and index | `gh-pages` branch: `index.v2.json` and `extensions/<id>/<version>/…` |
| Version revocation | `revoked.json` (a list of `{ id, versions, reason }`) |
| PR checks | `.github/workflows/pr-check.yml` |
| Publishing | `.github/workflows/deploy.yml` |

The app reads `index.v2.json` and downloads a version's files by relative `baseUrl`, verifying the size and sha256 of every file. The index keeps at most the five latest versions of an extension; older directories stay in `gh-pages`. The app picks the newest version it is compatible with (`minAppVersion`, platform). The `index.json` of the 0.4 format is no longer written; the copy that is still in `gh-pages` is what apps older than 0.5 read.

The first 0.5 publication replaces the `index.v2.json` written by the 0.4 tools (the 0.5 tools cannot read it); `scripts/legacy-index.mjs` detects it and both workflows handle it.

## For maintainers

- **Revoking a version.** Add an entry to `revoked.json`, for example `{ "id": "acme.tool", "versions": "<1.2.0", "reason": "..." }`. Ranges `<`, `<=`, `>`, `>=`, `=` and their space-separated combinations are allowed. After the merge CI rebuilds the index; apps disable installed revoked versions on their next check.
- **GitHub Pages.** The source is the `gh-pages` branch, root directory. The free GitHub plan serves Pages only from public repositories, so the repository must be public before the first publication.
- **Branch protection.** Enable protection for `main` (required `PR check` status, merge only through a pull request) wherever your plan allows it.
- **The index the app reads:** `https://dolphy-app.github.io/dolphy-extensions/index.v2.json`.
