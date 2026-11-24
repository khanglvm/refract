# Refract for coding agents

This page is for a coding agent that adds or changes Refract stores in a React or Next.js app. It lists the install step, the one import, every member the factory returns with its exact signature, the rules that prevent the usual bugs, and the limits.

## Setup

- Check the project first: React 18 or 19 is required. Note whether it is a client-only app (Vite or similar) or the Next.js App Router.
- Install with the project's package manager, for example `npm i refract-state`. Immer comes with it; React is a peer dependency.
- The installed package carries these docs at `node_modules/refract-state/docs/` and an index at `node_modules/refract-state/llms.txt`, matching the installed version. Online, the pages are at https://github.com/khanglvm/refract/tree/main/docs.
- Typecheck with `tsc --noEmit` after a change. An `interface` used as `State`, a wrong value type in a partial object, and a partial object with only unknown keys are compile errors. An unknown key next to valid ones in a partial object compiles, so check field names yourself.

## The import

There is one entry point and nothing else to import:

```ts
import { createContextState } from 'refract-state'
import type { TContextState, TDeepReadonly, TDeepMutable } from 'refract-state'
```

The package exports no helpers. Do not import `deepClone`, `deepEqual`, `createStateManager`, a translator or an event API from it; none exist. For an editable copy of state, use `structuredClone`.

## Choose where state goes

- State one component owns: `useState`.
- Data several components of one feature render or edit: a Refract store.
- Server cache concerns (refetching, retries, invalidation): the app's data-fetching library. Copy its results into a store only when components edit them.

## Write a store module

```ts
// feature/feature-store.ts
'use client'

import { createContextState } from 'refract-state'

export type FeatureState = {
  items: { id: string; done: boolean }[]
  status: 'idle' | 'saving' | 'failed'
}

export const {
  Provider: FeatureProvider,
  useContextState: useFeatureState,
  useContextStateValue: useFeatureValue,
  useSetContextState: useSetFeature,
  useStateSnapshotGetter: useFeatureSnapshot,
  useSetPostFlush: useSetFeaturePostFlush,
  withContextProvider: withFeatureProvider,
  StateSynchronizer: FeatureSynchronizer,
} = createContextState<FeatureState>('feature')
```

Export only the members the feature uses.

## Factory

`createContextState<State extends Record<string | number, unknown>>(instanceId?: string)`

- Call at module level, once per store. Never inside a component.
- `State` must be a `type` alias. An `interface` fails the constraint.
- `instanceId`: optional. Use a distinct string per store, or none. In the browser, two factory calls with the same ID share one React context. During server rendering it has no effect.

## Members and signatures

| Member | Exact signature | Notes |
| --- | --- | --- |
| `Provider` | `NamedExoticComponent<PropsWithChildren<{ initialState?: Partial<State> }>>` | Reads `initialState` once on mount and deep-freezes it; without it the state is `{}` |
| `useContextState` | `<ComputedValue = State>(compute?: (state: TDeepReadonly<State>) => ComputedValue, enableRevert?: boolean) => [TDeepMutable<ComputedValue>, setState, getSnapshot]` | Subscribes. `enableRevert` defaults to `true`. No purity check |
| `useContextStateValue` | `<ComputedValue = State>(compute?: (state: TDeepReadonly<State>) => ComputedValue) => TDeepMutable<ComputedValue>` | Subscribes. Purity check in development |
| `useSetContextState` | `(enableRevert?: boolean) => setState` | No subscription. `enableRevert` defaults to `true` |
| `useStateSnapshotGetter` | `() => getSnapshot` | No subscription |
| `useSetPostFlush` | `() => (callback: (draft: Draft<State>) => void) => void` | Returned function is stable |
| `withContextProvider` | `<ComponentProps>(WrappedComponent: ComponentType<ComponentProps>, config?: { initialState?: (props: PropsWithoutRef<ComponentProps>) => Partial<State>; bindPropToState?: (draft: Draft<State>, props: PropsWithoutRef<ComponentProps>) => void }) => ForwardRefExoticComponent<PropsWithoutRef<ComponentProps> & RefAttributes<unknown>>` | Renders its own Provider, forwards props and ref |
| `StateSynchronizer` | `<ComponentProps>(props: { data?: ComponentProps; updateStateOnDataChanged?: (draft: Draft<State>, data: ComponentProps) => void }) => null` | Experimental |
| `withStateProvider` | Same function as `withContextProvider` | Deprecated name; do not use in new code |

Functions the hooks return:

| Function | Exact signature | Notes |
| --- | --- | --- |
| `setState` | `<T extends Partial<State> \| ((draft: Draft<State>) => void)>(valueOrUpdater: T) => () => void` | Stable for the life of the Provider. Returns `revert` |
| `getSnapshot` | `(): State` and `<R>(compute: (input: State) => R): R` | Reads at call time. Created again on each render |
| `revert` | `() => void` | Undoes that one update. A no-op when the setter came from `enableRevert = false` |

`Draft` is Immer's draft type. `TContextState` is `ReturnType<typeof createContextState>`.

## Rules

Selectors:

- Selectors must be pure: no `Date.now()`, `new Date()`, `Math.random()` or side effects. When `process.env.NODE_ENV === 'development'`, `useContextStateValue` calls the selector twice on every render and throws if the results differ by value. Generate random values and timestamps in handlers or effects, store them, and select the stored value.
- Object and array results are compared by value with the previous result, so `state => ({ a: state.a, b: state.b })` is fine. Keep results small; the comparison walks the whole result and does not handle cycles.
- A hook without a selector returns the whole state and rerenders on every change.

State shape and updates:

- Keep state plain data: objects, arrays, primitives, `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, typed arrays. Values in a partial object are deep-copied. `Error`, `Promise`, `WeakMap`, `WeakSet`, `URL` and `Blob` throw `Unsupported type`. Class instances are copied as plain objects and lose their prototype. Functions, `AbortSignal` and `FormData` are kept by reference. Store `String(error)`, not the error.
- `setState({ field })` replaces whole top-level fields and never merges nested objects. Use `setState(draft => { ... })` for nested edits. A draft function returns nothing.
- State changes synchronously and subscribers are notified right away; React batches the renders, so several updates in one handler render once. With a post-flush callback registered, notifications wait for one microtask per batch.
- Each update runs every subscriber's selector. Change many items in one `setState` draft, not one call per item. An update that changes nothing notifies no one.
- Call `setState` from handlers, effects or async code, never during render.

Freezing:

- `initialState` is deep-frozen in place on mount. A default constant or an API response passed as `initialState`, or assigned in a draft, is frozen too; copy it first if other code mutates it.
- Every later state is frozen by Immer. Snapshots, and selected values that point into state, are the live frozen objects, not copies, even though selected values are typed `TDeepMutable`. Writing to them throws a `TypeError`. An object or array a selector builds itself is not frozen, but writing to it changes nothing in the store. Use `structuredClone` for an editable copy and write back with `setState`.
- Class instances and the contents of a `Map` or `Set` are not frozen. Still change them only through `setState`.

Provider:

- Every hook needs a Provider from the same factory call above it. There is no error when it is missing: the hook gets a fallback store where selectors read `{}`, setters do nothing, and a nested read such as `state => state.a.b` throws a `TypeError`. Development builds log one warning per store. When updates vanish, check Provider placement first.
- `initialState` is read once on mount. Prop changes are ignored. Remount with `key` to reset. Provide every field; the prop is typed `Partial<State>` but selectors read fields that must exist.
- Placement decides scope: root layout for app-wide state, a route layout for a flow, inside a repeated component for per-instance state.

Revert:

- `revert()` applies the inverse patches of that one update to the current state. Fields changed only by other updates keep their values. A field this update changed and a later update changed again is set back to its value before this update, overwriting the later change.
- Reverts are independent. There is no history stack or redo.
- Post-flush changes are not part of any revert.
- Pass `enableRevert = false` (`useSetContextState(false)`, `useContextState(selector, false)`) when the code never reverts; it skips patch recording.

Async code:

- Read current values in handlers and async functions with `getSnapshot`, not with values captured at render.
- Guard duplicate requests with `if (getSnapshot(state => state.isLoading)) return`.
- Do not list `getSnapshot` as an effect dependency expecting it to stay the same; it is recreated each render. `setState` and the `useSetPostFlush` function are stable.

Prop syncing (`bindPropToState`, `StateSynchronizer`):

- Experimental. Prefer `initialState` plus writes from event handlers.
- They run after mount when a prop value changes, compared key by key with `Object.is`, and overwrite the fields they write, including local edits.
- Inline callbacks, `children` and inline objects or arrays are new on every render and count as changes. Memoize them or keep them out of the props.
- `withContextProvider`'s `initialState(props)` runs on each render; only the mount result is used.

Post-flush:

- Register once, from one component inside the Provider, in an effect. Each Provider holds one callback; registering again replaces it; there is no unregister.
- Use it to recompute derived data once per batch: updates set a stale flag, the callback checks the flag and recomputes.
- A read before the batch (a render or a snapshot getter call) runs the callback early, so derived values are never behind. Reading between a handler's own updates runs it once per read.

## Next.js App Router

- Put `'use client'` at the top of every file that calls `createContextState` and every component that calls its hooks. The package's own modules already carry the directive.
- Server components may render a store's `Provider` and pass serializable `initialState` (plain objects, arrays, strings, numbers, booleans, `null`). They must not call the hooks.
- Keep types, constants and helper functions in files without `'use client'`. A server component cannot call a function exported from a client file.
- Pass the same initial values on the server and the client so hydration matches. After `router.refresh()`, a mounted store ignores new `initialState`; remount with `key` to take new data.
- Each Provider gets its own store per server render; requests never share state.

## Limits

| Limit | Detail |
| --- | --- |
| Exports | `createContextState`, `TContextState`, `TDeepReadonly`, `TDeepMutable` only |
| `State` type | Must satisfy `Record<string \| number, unknown>`; interfaces do not |
| Change tracking | Selector-level, not field-level; every subscriber's selector runs on each update, or on each batch when a post-flush callback is registered |
| Selected values | Compared by value; no cycles |
| Partial-object values | Deep-copied; unsupported types throw `Unsupported type` |
| Revert | One update at a time; no history, no redo |
| Post-flush | One callback per Provider; no unregister |
| Missing Provider | No error; fallback store, one development warning |
| `initialState` | Read on mount only |
| Development checks | Only when `process.env.NODE_ENV === 'development'` |

## Related pages

- [API reference](api.md) for each member in detail.
- [How it works](how-it-works.md) for the read and update cycle.
- [Next.js](nextjs.md) for file layout and troubleshooting.
