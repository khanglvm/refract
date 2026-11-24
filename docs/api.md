# API reference

Refract exports one function, `createContextState`, and three types. This page lists the signature and behavior of each member the factory returns.

## createContextState

```ts
import { createContextState } from 'refract-state'
import type { TContextState, TDeepReadonly, TDeepMutable } from 'refract-state'
```

```ts
createContextState<State extends Record<string | number, unknown>>(instanceId?: string)
```

It returns an object with the members listed below.

- Call it at module level, once per store.
- `State` must be a `type` alias or an object literal type. An `interface` does not satisfy `Record<string | number, unknown>` and fails to compile.
- `instanceId` is optional. In the browser, stores created with the same ID share one React context, which survives a module being evaluated twice (a hot reload, two bundles). Without an ID, each call gets a unique symbol. During server rendering the ID has no effect.

## Members

| Member | Signature | Subscribes |
| --- | --- | --- |
| `Provider` | `<Provider initialState?={Partial<State>}>{children}</Provider>` | |
| `useContextState` | `(selector?, enableRevert = true) => [value, setState, getSnapshot]` | Yes |
| `useContextStateValue` | `(selector?) => value` | Yes |
| `useSetContextState` | `(enableRevert = true) => setState` | No |
| `useStateSnapshotGetter` | `() => getSnapshot` | No |
| `useSetPostFlush` | `() => (callback: (draft: Draft<State>) => void) => void` | No |
| `withContextProvider` | `(Component, { initialState?, bindPropToState? }) => Component` | |
| `StateSynchronizer` | `<StateSynchronizer data? updateStateOnDataChanged? />` | No |
| `withStateProvider` | Same function as `withContextProvider` | |

### Provider

```ts
Provider: NamedExoticComponent<PropsWithChildren<{ initialState?: Partial<State> }>>
```

Owns one store. It reads `initialState` once, on mount, and deep-freezes it in place. Later changes to the prop are ignored; remount with `key` to reset. Without `initialState`, the store starts as `{}`.

### useContextState

```ts
useContextState<ComputedValue = State>(
  selector?: (state: TDeepReadonly<State>) => ComputedValue,
  enableRevert?: boolean, // default true
): [TDeepMutable<ComputedValue>, setState, getSnapshot]
```

Returns the selected value, the setter and the snapshot getter. The component rerenders when the selected value changes by value. Without a selector, the value is the whole state. With `enableRevert = false`, the setter skips patch recording and returns a function that does nothing. It does not run the development purity check.

### useContextStateValue

```ts
useContextStateValue<ComputedValue = State>(
  selector?: (state: TDeepReadonly<State>) => ComputedValue,
): TDeepMutable<ComputedValue>
```

Returns the selected value only. In development builds it runs the selector twice on every render and throws if the results differ by value.

### useSetContextState

```ts
useSetContextState(enableRevert?: boolean /* default true */): setState
```

Returns the setter without subscribing the component.

### setState

```ts
setState<T extends Partial<State> | ((draft: Draft<State>) => void)>(valueOrUpdater: T): () => void
```

- A partial object replaces each listed top-level field with a deep copy of the value. Nested objects are not merged.
- A function receives an Immer draft; change it in place and return nothing.
- The state changes synchronously and subscribers are notified right away, so a controlled input keeps its caret. React batches the renders, so several updates in one event handler render once. A Provider with a post-flush callback batches notifications into one microtask instead; see `useSetPostFlush`.
- Returns `revert`. Calling it applies the inverse patches of that update to the current state and notifies subscribers. When the setter came from `enableRevert = false`, `revert` does nothing.
- The setter is stable for the life of the Provider.

### getSnapshot

```ts
getSnapshot(): State
getSnapshot<ComputedSnapshotValue>(selector: (state: State) => ComputedSnapshotValue): ComputedSnapshotValue
```

Reads the current state, or the selector's result, at call time without subscribing. It returns the store's live frozen object, not a copy. The getter returned by `useStateSnapshotGetter` and by `useContextState` is created again on each render.

### useSetPostFlush

```ts
useSetPostFlush(): (callback: (draft: Draft<State>) => void) => void
```

Returns a stable function that registers the Provider's post-flush callback. The callback runs once per microtask batch, after the batch's updates and before subscribers are notified. While a callback is registered, that Provider notifies once per batch instead of on every update, so a controlled text input that reads from it moves its caret to the end as you type; give such a field local state or make it uncontrolled. Each Provider holds one callback; registering replaces it, and there is no unregister. Its changes are not part of any revert. See [Post-flush callbacks](post-flush.md).

### withContextProvider

```ts
withContextProvider<ComponentProps>(
  WrappedComponent: ComponentType<ComponentProps>,
  config?: {
    initialState?: (props: PropsWithoutRef<ComponentProps>) => Partial<State>
    bindPropToState?: (draft: Draft<State>, props: PropsWithoutRef<ComponentProps>) => void
  },
): ForwardRefExoticComponent<PropsWithoutRef<ComponentProps> & RefAttributes<unknown>>
```

Returns a component that renders its own Provider around `WrappedComponent`, passing every prop and the forwarded ref. `initialState(props)` runs on each render; the Provider reads its result on mount only. `bindPropToState` is experimental and works like `StateSynchronizer` with the props as `data`. See [Wrap a component with its Provider](wrap-components.md).

### StateSynchronizer

```ts
StateSynchronizer<ComponentProps>(props: {
  data?: ComponentProps
  updateStateOnDataChanged?: (draft: Draft<State>, data: ComponentProps) => void
}): null
```

Experimental. Render it under an existing Provider. The `data` seen at mount is the baseline. After mount, when `data` changes (compared key by key with `Object.is` for plain objects and arrays, by reference otherwise), it calls `updateStateOnDataChanged` through a reverting setter. Nothing runs when either prop is missing.

### withStateProvider

Deprecated name for `withContextProvider`. It is the same function.

## Types

| Type | Meaning |
| --- | --- |
| `TContextState` | `ReturnType<typeof createContextState>`, the factory's return type with the default `State` |
| `TDeepReadonly<T>` | `T` with every nested property, array and collection read-only. Functions and built-ins such as `Date`, `RegExp`, `URL`, `Promise` and `Error` stay as they are |
| `TDeepMutable<T>` | Removes `readonly` from objects and arrays at every level. Functions, built-ins and collections stay as they are |

Selectors receive `TDeepReadonly<State>`. Selected values are typed `TDeepMutable<ComputedValue>`, but any part of them that points into state is frozen at runtime, so treat them as read-only.
