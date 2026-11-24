# Changelog

## 1.0.1

Docs only. The README, the docs overview and `llms.txt` now describe what the engine does: rerenders limited to components whose selected value changed, nested updates without spreading, Next.js App Router and server rendering support, and undo. No code changes.

## 1.0.0

First standalone release. Refract is `createContextState` extracted from `@khanglvm/react` 1.3.0, with the same behavior.

- Exports `createContextState` and the types `TContextState`, `TDeepReadonly` and `TDeepMutable` from a single entry, `refract-state`. Every module ships with `'use client'`.
- Migrating from `@khanglvm/react`: change the import to `from 'refract-state'`. Code that uses only `createContextState` and its types needs no other change.
- Not included, and still in `@khanglvm/react`: the deprecated `createStateManager` wrapper and its `TStateManager` type, the translator, events and the `helpers` entry. `deepEqual` and `deepClone` are internal now and not exported; use `structuredClone` for an editable copy of state.
