# Каталог расширений Spirula

Здесь лежат исходники расширений, которые можно поставить из приложения Spirula («Настройки → Расширения → Каталог»). Расширение попадает в каталог pull request'ом, проходит автоматические проверки и ревью, а после слияния CI собирает его и публикует.

- Что такое расширение и как его написать: [docs/design/extensions.md](https://github.com/spirula-app/spirula/blob/develop/docs/design/extensions.md) в основном репозитории.
- Правила ревью: [skills/extension-reviewer/SKILL.md](skills/extension-reviewer/SKILL.md) и [rules/rules.json](rules/rules.json).

## Как установить расширение

Откройте в приложении «Настройки → Расширения → Каталог», найдите расширение и нажмите «Установить». Перед установкой приложение показывает разрешения, которые просит расширение. Расширения из каталога работают в изоляции; о её пределах — в ADR 0003 основного репозитория.

## Как опубликовать расширение

1. Создайте проект: `npx --package=@spirula-app/create-extension create-spirula-extension <id>`. Пакеты лежат в GitHub Packages: нужен персональный токен (classic) с правом `read:packages`, строка `//npm.pkg.github.com/:_authToken=<TOKEN>` в `~/.npmrc` и `@spirula-app:registry=https://npm.pkg.github.com` (создаваемый проект её уже содержит).
2. Доработайте расширение, проверяйте его `npx spirula-ext build` и `npx spirula-ext validate dist-ext/<id>`.
3. Сделайте форк этого репозитория и положите проект в `extensions/<id>/`, где `<id>` — точно `id` из `extension.json`. В проекте обязательны:
   - `extension.json` с `name`, `description` и `author` (ваш логин GitHub), версией больше опубликованной;
   - `README.md` — что делает расширение и зачем нужны его разрешения;
   - `package.json` и lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` или `bun.lock`), зависимости только из реестра, без скриптов `postinstall`, `prepare` и подобных.
4. Проверьте локально: `npx spirula-ext catalog check extensions --ids <id> --skip-github-check`. Список правил: `npx spirula-ext catalog check --list-rules`.
5. Откройте pull request. CI запустит проверку и пробную сборку. Мейнтейнер проведёт смысловое ревью по правилам из `rules/rules.json`.
6. После слияния в `main` CI соберёт расширение и добавит его версию в каталог.

Опубликованные версии не меняются. Чтобы выпустить исправление, поднимите `version` и откройте новый pull request.

## Как устроен каталог

| Что | Где |
| --- | --- |
| Исходники расширений | `extensions/<id>/` (ветка `main`) |
| Опубликованные файлы и индекс | ветка `gh-pages`: `index.json` и `extensions/<id>/<версия>/…` |
| Отзыв версий | `revoked.json` (список `{ id, versions, reason }`) |
| Проверки PR | `.github/workflows/pr-check.yml` |
| Публикация | `.github/workflows/deploy.yml` |

Приложение читает `index.json` и скачивает файлы версии по относительному `baseUrl`, проверяя размер и sha256 каждого файла. Индекс хранит не более пяти последних версий расширения; старые каталоги остаются в `gh-pages`.

## Для мейнтейнеров

- **Отзыв версии.** Добавьте запись в `revoked.json`, например `{ "id": "acme.tool", "versions": "<1.2.0", "reason": "..." }`. Допустимы диапазоны `<`, `<=`, `>`, `>=`, `=` и их пробельные сочетания. После слияния CI пересоберёт индекс; приложения отключат установленные отозванные версии при следующей проверке.
- **Доступ CI к пакетам.** Инструменты (`@spirula-app/extension-tools`) ставятся из GitHub Packages с `GITHUB_TOKEN`. Пакету нужно выдать доступ этому репозиторию: Package settings → Manage Actions access → добавить `spirula-extensions` с правом Read.
- **GitHub Pages.** Источник — ветка `gh-pages`, корень. Бесплатный план GitHub отдаёт Pages только из публичных репозиториев, поэтому репозиторий должен быть публичным до первой публикации.
- **Защита веток.** Включите защиту `main` (обязательные проверки `PR check`, merge только через pull request) там, где тариф это позволяет.
- **Индекс, который читает приложение:** `https://spirula-app.github.io/spirula-extensions/index.json`.
