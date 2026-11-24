# Changelog

## 1.2.0

- An update that changes nothing, such as assigning a field the value it already has, no longer notifies subscribers, so their selectors do not run.
- On a store with a post-flush callback, a read before the batch runs the callback first. Before, a component that rerendered for another reason in the same event, or a snapshot getter call in the handler, could see derived values from before the update. The callback still runs once per batch unless something reads between updates. A callback that throws now throws in that read, such as during the render, instead of in the microtask.
- The docs now say how to keep update cost low: change many items in one `setState` draft, call `setState` outside render, and use `createRoot` for batching outside event handlers.

## 1.1.0

Controlled inputs keep their caret. Before, typing in the middle of an `<input value={…}>` that read from a store moved the caret to the end, because subscribers heard about the update one microtask after the input event.

- Stores without a post-flush callback now notify subscribers synchronously on every update. React still batches the renders, so several updates in one event handler render once. Calling `setState` or `revert` during a render now gets React's "Cannot update a component while rendering a different component" warning when the update changes what a mounted component selects; move that call into an effect or an event handler.
- With `createRoot`, updates outside event handlers (`setTimeout`, after `await`) still render once, because React batches them. A React 18 legacy root (`ReactDOM.render`) batches only inside its event handlers, so several updates in a timeout or after `await` now render once each; wrap them in `unstable_batchedUpdates` or move to `createRoot`.
- Stores with a post-flush callback keep the microtask batching, so the callback still runs once per batch before subscribers are notified. Updates made before the callback is registered get one batch when it registers. Controlled text inputs on those stores still move the caret; see [Post-flush callbacks](docs/post-flush.md).

## 1.0.1

Docs only. The README, the docs overview and `llms.txt` now describe what the engine does: rerenders limited to components whose selected value changed, nested updates without spreading, Next.js App Router and server rendering support, and undo. No code changes.

## 1.0.0

First standalone release. Refract is `createContextState` extracted from `@khanglvm/react` 1.3.0, with the same behavior.

- Exports `createContextState` and the types `TContextState`, `TDeepReadonly` and `TDeepMutable` from a single entry, `refract-state`. Every module ships with `'use client'`.
- Migrating from `@khanglvm/react`: change the import to `from 'refract-state'`. Code that uses only `createContextState` and its types needs no other change.
- Not included, and still in `@khanglvm/react`: the deprecated `createStateManager` wrapper and its `TStateManager` type, the translator, events and the `helpers` entry. `deepEqual` and `deepClone` are internal now and not exported; use `structuredClone` for an editable copy of state.
