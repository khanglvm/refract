# Quick start

This page builds a counter in one file, then shows the store module layout the rest of the guides use. It assumes Brivo is installed; see [Install](install.md).

## A counter

```tsx
'use client' // only needed in the Next.js App Router

import { createContextState } from 'brivo'

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

Clicking the button rerenders `Count`. `AddOne` does not subscribe, so the store never rerenders it.

## Create a store module

Give each store its own file. Call the factory at module level, never inside a component, and rename the hooks after the feature so call sites read clearly.

```ts
// profile/profile-store.ts
'use client'

import { createContextState } from 'brivo'

export type ProfileState = {
  profile: { id: string; name: string }
  draftName: string
  status: 'idle' | 'saving' | 'saved' | 'failed'
}

export const {
  Provider: ProfileProvider,
  useContextState: useProfileState,           // [value, setState, getSnapshot]
  useContextStateValue: useProfileValue,      // value only
  useSetContextState: useSetProfile,          // setState only, no subscription
  useStateSnapshotGetter: useProfileSnapshot, // read without subscribing
  withContextProvider: withProfileProvider,
} = createContextState<ProfileState>('profile')
```

Declare the state with a `type` alias, as above. The factory requires `State extends Record<string | number, unknown>`, and an `interface` does not satisfy that constraint, so `createContextState<SomeInterface>()` fails to compile.

The optional argument (`'profile'`) is an instance ID. In the browser it keeps the same React context when a module is evaluated twice, for example after a hot reload or when two bundles load the same file. Stores created with the same ID share that context, so use a distinct ID for each store, or leave it out.

In Next.js, everything exported from a `'use client'` file is a client reference, so a server component cannot call a helper function from it. Keep types and plain helpers that server components need in a separate file.

The guides use this profile store. Start with [Read with selectors](selectors.md).
