# Spirula extension catalog

This repository holds the sources of the extensions that can be installed from the Spirula app (“Settings → Extensions → Catalog”). An extension enters the catalog through a pull request, passes automated checks and review, and after the merge CI builds and publishes it.

- What an extension is and how to write one: [docs/design/extensions.md](https://github.com/spirula-app/spirula/blob/develop/docs/design/extensions.md) in the main repository.
- Review rules: [skills/extension-reviewer/SKILL.md](skills/extension-reviewer/SKILL.md) and [rules/rules.json](rules/rules.json).

## How to install an extension

In the app, open “Settings → Extensions → Catalog”, find the extension and click “Install”. Before installing, the app shows the permissions the extension requests. Extensions from the catalog run in isolation; its limits are described in ADR 0003 of the main repository.

## How to publish an extension

1. Create a project: `npx --package=@spirula-app/create-extension create-spirula-extension <directory> --id <id>`. The packages live in GitHub Packages: you need a personal access token (classic) with the `read:packages` scope, the line `//npm.pkg.github.com/:_authToken=<TOKEN>` in `~/.npmrc`, and `@spirula-app:registry=https://npm.pkg.github.com` (the generated project already contains it).
2. Finish the extension and check it with `npx spirula-ext build` and `npx spirula-ext validate dist-ext/<id>`.
3. Fork this repository and put the project in `extensions/<id>/`, where `<id>` is exactly the `id` from `extension.json`. The project must contain:
   - `extension.json` with `name`, `description` and `author` (your GitHub login), and a version greater than the published one;
   - `README.md` — what the extension does and why it needs its permissions;
   - `package.json` and a lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` or `bun.lock`); dependencies only from the registry, no `postinstall`, `prepare` or similar scripts.
4. Check locally: `npx spirula-ext catalog check extensions --ids <id> --skip-github-check`. List the rules with `npx spirula-ext catalog check --list-rules`.
5. Open a pull request. CI runs the checks and a trial build. A maintainer performs a semantic review against the rules in `rules/rules.json`.
6. After the merge into `main`, CI builds the extension and adds its version to the catalog.

Published versions never change. To ship a fix, bump `version` and open a new pull request.

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
- **CI access to packages.** The tools (`@spirula-app/extension-tools`) are installed from GitHub Packages with `GITHUB_TOKEN`. Grant this repository access to the package: Package settings → Manage Actions access → add `spirula-extensions` with the Read role.
- **GitHub Pages.** The source is the `gh-pages` branch, root directory. The free GitHub plan serves Pages only from public repositories, so the repository must be public before the first publication.
- **Branch protection.** Enable protection for `main` (required `PR check` status, merge only through a pull request) wherever your plan allows it.
- **The index the app reads:** `https://spirula-app.github.io/spirula-extensions/index.json`.
