# Read with selectors

A selector is a function from state to the value a component needs. The component rerenders only when that value changes, so selectors decide both what a component reads and how often it renders.

## Pick what a component needs

The examples use the profile store from the [quick start](quickstart.md).

```tsx
const name = useProfileValue(state => state.profile.name)
const isSaving = useProfileValue(state => state.status === 'saving')
const nameLength = useProfileValue(state => state.draftName.trim().length)
```

A selector can return a new object or array. The store compares the result with the previous one by value and keeps the previous reference when they match, so this does not rerender on every change:

```tsx
const { name, status } = useProfileValue(state => ({
  name: state.profile.name,
  status: state.status,
}))
```

The comparison descends into plain objects and arrays, compares `Date` values by time and `RegExp` values by their text, and compares `Map` and `Set` contents. Map keys and Set members that are objects must be the same references. Objects with different constructors are never equal.

Without a selector, the hook returns the whole state, and the component rerenders on any change.

To read and write in one component, `useProfileState(selector)` returns `[value, setState, getSnapshot]`. See [Update state](updates.md).

## Rules for selectors

- Keep them pure: the same state gives the same result, with no `Date.now()`, random values or side effects. In development builds (`process.env.NODE_ENV === 'development'`), `useContextStateValue` runs each selector twice on every render and throws if the two results differ. `useContextState` does not run this check. [Install](install.md#development-checks) explains when development builds apply.
- Treat the result as read-only. It is typed as mutable, but whatever it takes from state is frozen at runtime, and writing to that throws a `TypeError`. An object the selector builds itself is not frozen, but writing to it changes nothing in the store. Change state through the setter.
- Prefer small results. Comparing a large selected tree on every update costs time, and the comparison does not support cyclic data.

If you need a random value or a timestamp, create it in an event handler or effect, store it, and select the stored value.
