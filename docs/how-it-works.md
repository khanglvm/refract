# How it works

This page explains what Refract does on each read and update, what that costs, and the limits that follow. Read it before you put a large or unusual value in a store.

## Reads

The Provider keeps the state in a ref, next to a set of subscribers. Hooks subscribe through React's `useSyncExternalStore`. On a change, every subscriber of that Provider runs its selector, and a component rerenders only if its selected value differs by value from the previous one. Each hook caches its last selected value and returns that same reference while the content is unchanged, which `useSyncExternalStore` needs to avoid rerendering in a loop.

This is selector-level filtering, not field-level dependency tracking. Many subscribers with heavy selectors still cost work on each update.

The value comparison descends into plain objects and arrays, compares `Date` by time, `RegExp` by text, and `Map` and `Set` by contents with native key identity. Symbol and non-enumerable properties are ignored, and there is no cycle detection.

## Updates

Every update goes through Immer. The default setter records patches so the update can be reverted; the setter from `enableRevert = false` does not. The new state replaces the old one in the ref immediately, so the snapshot getter sees it on the next line.

Notifications are batched. The first update in a tick queues a microtask; when it runs, the post-flush callback (if one is registered) applies its changes, and then every subscriber is notified once. The microtask runs before the browser paints.

A partial object is turned into a draft function that assigns a deep copy of each listed field. The copy rules are in [Update state](updates.md#keep-state-to-plain-data).

Refract enables Immer's `Map`/`Set` and patches plugins when it loads.

## Freezing

`initialState` is deep-frozen in place when the Provider mounts, and Immer freezes every later state. Snapshots, and selected values that point into state, are parts of that frozen state, not copies, so writing to one throws a `TypeError`. A new object or array built by a selector is not frozen. The freeze does not reach class instances, the keys and values inside a `Map` or `Set`, or the children of an object that was already frozen.

## Instance IDs and the browser

In the browser, the factory keeps its React context in `window.__CONTEXT_STATE__`, a `Map` keyed by the instance ID, or by a fresh symbol when there is none. A module evaluated twice with the same ID gets the same context, so its Providers and hooks still match. The state itself lives in each Provider, not in that map. Refract's type declarations add `__CONTEXT_STATE__` to the global `Window` interface.

During server rendering, each factory call creates its own context and each Provider its own store, so requests never share state.

## Outside a Provider

A hook with no matching Provider above it gets a fallback store: selectors read `{}`, the snapshot getter returns `{}`, and setters and `useSetPostFlush` do nothing. Development builds log `ContextState not found for <instanceId>. Returning dummy context.` once per store; a store without an ID logs `unknown` in place of the ID.

## Limits

- No cycles in selected values.
- No history stack or redo; each `revert` is independent and can overwrite later writes to the same fields.
- One post-flush callback per Provider, with no unregister.
- No missing-Provider error; a nested read on the fallback store throws a `TypeError`.
- Partial-object values must be plain data; `Error`, `Promise`, `WeakMap`, `URL` and `Blob` throw `Unsupported type`, and class instances lose their prototype.
- `initialState` changes after mount are ignored.

## Checklist

- Call `createContextState` at module level.
- Declare `State` with a `type` alias.
- Provide every field in `initialState`.
- Keep selectors pure and their results small.
- Use drafts for nested updates; partial objects replace top-level fields.
- Use the snapshot getter, not render values, inside async code.
- Treat snapshots and selected values as read-only; they are frozen. Copy before editing.
- Remount the Provider (`key`) to reset it; changing `initialState` does nothing after mount.
- Check Provider placement when updates seem to do nothing.
