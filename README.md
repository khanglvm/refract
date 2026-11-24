<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/khanglvm/refract/main/assets/banner-dark.png">
    <img src="https://raw.githubusercontent.com/khanglvm/refract/main/assets/banner-light.png" alt="Refract: React state that rerenders only what changed" width="640">
  </picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/refract-state"><img src="https://img.shields.io/npm/v/refract-state" alt="npm version"></a>
  <a href="https://github.com/khanglvm/refract/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://refract.khangle.dev">Website</a> | <a href="https://docs.khangle.dev/refract">Docs</a>
</p>

Refract is React state for a feature that several components share, such as a form, an editor, a cart or a page's filters. Each component reads the value it needs through a selector and rerenders only when that value changes. You write updates as plain assignments on an Immer draft, so nested changes need no spreading, and by default each update returns a function that undoes it. It works in the Next.js App Router and in server rendering.

`createContextState<State>()` returns a Provider and hooks typed to `State`. Each Provider you render holds its own store.

## Install

```sh
npm i refract-state
```

Refract needs React 18 or 19, and Immer is its only dependency.

## Example

```tsx
'use client' // only needed in the Next.js App Router

import { createContextState } from 'refract-state'

const counter = createContextState<{ count: number }>()

function Count() {
  const count = counter.useContextStateValue(state => state.count)
  return <p>Count: {count}</p>
}

function AddOne() {
  const setState = counter.useSetContextState()
  return <button onClick={() => setState(draft => { draft.count += 1 })}>Add one</button>
}

export default function App() {
  return (
    <counter.Provider initialState={{ count: 0 }}>
      <Count />
      <AddOne />
    </counter.Provider>
  )
}
```

Clicking the button rerenders `Count`, which selects `state.count`. `AddOne` only gets the setter, so it does not subscribe and the store never rerenders it.

## Why Refract

### Components rerender only for what they read

When the value of a plain React context changes, every component that reads that context rerenders. A Refract hook subscribes to the result of its selector instead, and compares each new result with the previous one by value:

- A component that reads `state.user.address.city` does not rerender when `state.filter` changes.
- A selector can return derived data such as `state.todos.filter(t => t.done)`. The component rerenders when the list of done todos changes, not every time the selector builds a new array.
- A component that only calls `useSetContextState()` never subscribes, so no update rerenders it.
- Several `setState` calls in the same synchronous code, such as one event handler, notify subscribers once.
- The Provider compares `initialState` and `children` by value, so a parent that rerenders and passes an equal `initialState` object does not rerender the tree below it.

In development builds, `useContextStateValue` runs each selector twice and throws if the two results differ. This catches a selector such as `s => ({ id: Math.random() })`, which would otherwise rerender in a loop.

### Read and write nested state without spreading

`setState` takes an Immer draft, so a nested change is one assignment:

```tsx
// useState
setUser(user => ({ ...user, address: { ...user.address, city: 'Hanoi' } }))

// Refract
setState(draft => { draft.user.address.city = 'Hanoi' })
```

To replace top-level keys, pass a partial object: `setState({ filter: 'done' })` sets `filter` and keeps every other key. To read, select the value itself (`s => s.user.address.city`) instead of taking the whole state and destructuring it. `useContextState` returns the value, the setter and a snapshot getter in one tuple:

```tsx
const [city, setState, getSnapshot] = store.useContextState(s => s.user.address.city)
```

`getSnapshot(s => s.cart)` reads the latest state at the moment you call it, for example after an `await` in an async handler, so the handler never works from a stale value, and reading it does not subscribe the component.

### Built for the Next.js App Router

- Every module in the package starts with `'use client'`. Put `'use client'` at the top of your own store file too, and a server component can render that store's Provider and pass it data it fetched as `initialState`.
- During server rendering, each Provider creates its own store, so two requests never share state. The hooks give React a server snapshot, so the page hydrates from the same `initialState`.
- Give a store an ID, as in `createContextState<State>('cart')`, and a store module that runs twice in the browser, because it landed in two chunks or hot reload ran it again, still finds the same Provider.

### Undo any update

Every `setState` returns `revert`. It undoes only the fields that update changed and leaves later, unrelated updates in place, so an optimistic save can show the change at once and call `revert()` if the request fails. Pass `false` to `useSetContextState` or as the second argument of `useContextState` to skip that tracking where you never undo.

### Scope state by where you put the Provider

State lives in the Provider, not in a module-level store. Render one Provider for the whole app, one per route, or one per card in a list, and each gets its own state. `withContextProvider` wraps a component with its own Provider and can copy changed props into its state.

## Docs

- [Quick start](https://docs.khangle.dev/refract/quickstart): the counter, then a store module to copy.
- [Read with selectors](https://docs.khangle.dev/refract/selectors) and [Update state](https://docs.khangle.dev/refract/updates).
- [Optimistic updates with revert](https://docs.khangle.dev/refract/rollback)
- [Next.js App Router](https://docs.khangle.dev/refract/nextjs)
- [API reference](https://docs.khangle.dev/refract/api) and [How it works](https://docs.khangle.dev/refract/how-it-works), for the costs and edge cases.
- For coding agents: [Refract for coding agents](https://docs.khangle.dev/refract/agents) and [llms.txt](https://github.com/khanglvm/refract/blob/main/llms.txt), a plain-text index of the docs. The package also ships both under `node_modules/refract-state/`, matching the installed version.

Refract was extracted from [@khanglvm/react](https://github.com/khanglvm/react), whose `createContextState` now comes from this package. To move code over, change the import to `from 'refract-state'`.

## Develop

```sh
npm ci
npm test
npm run build && npm run test:package
```

`npm test` runs the unit tests. `test:package` imports the built package by name, renders it on the server and checks that every built module starts with `'use client'`.

To release, bump `version` in `package.json` on `main` and add its entry to `CHANGELOG.md`. CI then publishes that version with npm trusted publishing: npm accepts the package from this repository's GitHub workflow, so the repository stores no npm token.

## License

MIT. See [LICENSE](https://github.com/khanglvm/refract/blob/main/LICENSE).
