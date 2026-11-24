# Brivo: architecture

## Store
A Provider keeps the current state in a ref and a set of subscribers. Hooks subscribe with `useSyncExternalStore`. Synchronous updates are batched and subscribers are notified once per microtask.

## Reads
Each hook runs its selector against the latest snapshot. The result is compared with the previous one by value (`deepEqual`); an equal result keeps the previous reference, so a selector that builds a new object does not rerender on every change. In development, a selector that returns different values for the same snapshot throws, because it would loop.

## Writes
`setState` takes a partial object (deep-copied) or an Immer draft function. With revert enabled, Immer patches are recorded and the returned function applies the inverse patches. State is deep-frozen from mount.

## Server rendering
Server snapshots are cached per Provider and released after hydration. Every built module carries "use client" so Next.js App Router treats the package as a client boundary.

## Build
Vite library mode with `preserveModules`; React, React DOM and Immer stay external. `vite-plugin-dts` emits the types.

## Landing page
`site/` is a static page served by a Cloudflare Worker with static assets at brivo.khangle.dev.
