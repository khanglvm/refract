# Update state

`setState` accepts a partial object or an Immer draft function, and the snapshot getter reads the latest state between updates. The store deep-copies the values in a partial object and freezes all state, which limits what you can keep in it.

## Partial objects and drafts

The examples use the profile store from the [quick start](quickstart.md).

```tsx
const setState = useSetProfile()

// Partial object: replaces the listed top-level fields.
setState({ status: 'saving' })

// Draft function: change nested data in place; Immer produces the next state.
setState(draft => {
  draft.profile.name = draft.draftName
  draft.status = 'saved'
})
```

A partial object replaces each listed top-level field as a whole; it does not merge into nested objects. To change `profile.name` and keep `profile.id`, use a draft.

`useSetProfile()` does not subscribe the component to changes. Use it for buttons and handlers that write without reading. To read and write in one component, use `useProfileState`:

```tsx
function NameField() {
  const [draftName, setState] = useProfileState(state => state.draftName)
  return <input value={draftName} onChange={e => setState({ draftName: e.target.value })} />
}
```

The setter is stable for the life of the Provider, so it is safe in dependency arrays.

## Keep state to plain data

Values passed in a partial object are deep-copied before they go into the store. The copy handles plain objects, arrays, primitives, `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, typed arrays and cycles. Functions, `AbortSignal` and `FormData` are kept by reference. Anything else throws `Unsupported type`: an `Error`, a `Promise`, a `WeakMap`, a `URL` or a `Blob`, for example. A class instance is copied as a plain object, so its methods and prototype are lost.

Store `String(error)` rather than the error itself. Values you assign inside a draft are not copied; Immer keeps them as they are and freezes them.

## The state is frozen

The state is frozen from the moment the Provider mounts: `initialState` is deep-frozen in place, and every later state comes frozen from Immer. An object you put in the store, through `initialState` or a draft (an API response, a default constant), is frozen in place too, so other code that still holds it can no longer mutate it. Copy it first if something else changes it later.

Like Immer, the freeze does not reach class instances, the keys and values inside a `Map` or `Set` (the collection itself is frozen), or the children of an object that was already frozen with `Object.freeze`. Edit those through the setter too.

## When subscribers see the change

The state changes immediately, so the snapshot getter sees it on the next line. Subscribers are notified right away, and React batches the renders, so several `setState` calls in one handler cause one rerender pass. A store with a [post-flush callback](post-flush.md) notifies once per batch instead.

## Read the latest state in handlers

A value from render can be stale in an async handler. `useProfileSnapshot()` returns a getter that reads the current state when called, without subscribing:

```tsx
const getSnapshot = useProfileSnapshot()

async function save() {
  const { profile, draftName } = getSnapshot()
  // or with a selector: getSnapshot(state => state.draftName)
  await api.saveName(profile.id, draftName)
}
```

Use it to guard duplicate requests too:

```tsx
async function saveOnce() {
  if (getSnapshot(state => state.status === 'saving')) return
  // ...
}
```

`useProfileState` returns a getter that works the same way as its third item.

The snapshot is the store's current object, not a copy, so reading it costs nothing and its references stay stable between reads. Because the state is frozen, changing it throws a `TypeError` instead of silently skipping the subscribers. For an editable copy, use `structuredClone(getSnapshot())`, then write changes back with `setState`.

The getter function itself is created again on each render. Read it inside handlers rather than listing it as an effect dependency that should stay the same.

Next: [Optimistic updates with revert](rollback.md).
