# Working on Refract

Refract is a React state library: `createContextState<State>()` returns a Provider and hooks for one typed store. Components read through selectors, update with Immer drafts, and can undo each update. It was extracted from `@khanglvm/react` (khanglvm/react), which now depends on it.

## Layout

- `src/createContextState.tsx`: the engine (Provider, hooks, revert, SSR snapshots).
- `src/internal/`: deepClone, deepEqual, the selector cache and memo comparison. Not exported.
- `src/types.ts`: `TDeepReadonly` and `TDeepMutable`, exported for hook signatures.
- `src/index.ts`: the one public entry.
- `tests/`: unit tests (`*.test.tsx`), the built-package smoke test and the "use client" check.
- `site/`: the landing page at https://refract.khangle.dev, a Vite + React page whose demo imports `src/` directly. `npm run site:build` builds it into `site/dist`; `npm run site:deploy` builds and deploys it with wrangler (Cloudflare Worker `refract-site`, static assets, custom domain). Deploy after any change to `site/` or to behaviour the demo shows. Design rules: DESIGN.md.
- `assets/`: logo, banners and icon (see DESIGN.md).
- `docs/`: the docs, published on docs.khangle.dev.

## Checks

- `npm test`: unit tests.
- `npm run build && npm run test:package`: build, then import the package by name, render it on the server and check every built module starts with "use client".
- `npm run type-check`.

Install dependencies with `project-deps install` (npm, `package-lock.json`).

## Docs

`docs/` is the source of truth for this tool's documentation. docs.khangle.dev publishes the pages `docs/meta.json` lists, and llms.txt is built from the same pages for coding agents. The contract is in https://github.com/khanglvm/docs/blob/main/docs/CONTRACT.md.

- When a change adds, removes or changes a command, flag, option, config key, output format, exported API or default, update the docs page that covers it in the same commit. Add a page and list it in `docs/meta.json` when none covers it.
- Keep `docs/agents.md` exact: commands, flags, output shapes and limits, written for a coding agent.
- README sections between `<!-- docs:begin PAGE -->` and `<!-- docs:end -->` are generated. Edit the page in `docs/`, then run `node scripts/docs-readme.mjs`.
- Run `node scripts/docs-readme.mjs --check` before committing. CI runs the same check.
- Do not move or rename a published page without updating `docs/meta.json` and links to it.
- A change is finished when GitHub, docs.khangle.dev and the npm page all show it. npm takes the README only from a published version, so a change to README.md ships with a new version (see Releases). After pushing and releasing, run `node scripts/docs-surfaces.mjs` until it exits 0.

## Releases

The `Publish npm package` workflow (`.github/workflows/npm-auto-publish.yml`) publishes with npm trusted publishing when a push to `main` changes `version` in `package.json` and that version is not on npm yet. Bump the version in the same change as the work it releases and add its entry to `CHANGELOG.md`. A docs-only change still needs a patch release so the npm page shows the new README.

After a release, update the `refract-state` dependency range in khanglvm/react when the change matters to its users.
