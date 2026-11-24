# Wrap a component with its Provider

`withContextProvider` returns a component that renders its own Provider, with initial state derived from its props. Use it when every instance of a component needs its own store.

## Derive initial state from props

The example uses the profile store from the [quick start](quickstart.md).

```tsx
type ProfileHeaderProps = { profile: ProfileState['profile'] }

export const ProfileHeader = withProfileProvider<ProfileHeaderProps>(
  function ProfileHeaderView() {
    const name = useProfileValue(state => state.profile.name)
    return <h2>{name}</h2>
  },
  {
    initialState: props => ({ profile: props.profile, draftName: props.profile.name, status: 'idle' }),
  },
)

// <ProfileHeader profile={profile} />, each instance with its own store
```

The type parameter describes the component's props, not the store. The wrapper passes every prop and a forwarded ref to the wrapped component.

The `initialState` function runs on each render of the wrapper, but the Provider reads its result only on mount, like any `initialState`.

## Copy props into the store after mount

An optional `bindPropToState(draft, props)` copies props into the store when a prop value changes after mount. Props are compared key by key with `Object.is`, so a parent rerender with the same values does nothing. When a value does change, the callback overwrites the fields it writes, including local edits to them.

Inline functions, JSX `children` and inline objects or arrays are new values on every render, so they count as changes. Memoize them with `useCallback` or `useMemo`, or keep them out of the wrapped component's props.

`StateSynchronizer` exposes the same mechanism as a component that you render under an existing Provider. It compares its `data` prop the same way: an inline object of primitive values is fine, while a `Date`, `Map`, `Set` or class instance compares by reference. It renders nothing.

Export it from the store module, next to the other renamed members:

```ts
export const {
  // ...the members from the quick start
  StateSynchronizer: ProfileSynchronizer,
} = createContextState<ProfileState>('profile')
```

Then render it anywhere under that store's Provider:

```tsx
<ProfileSynchronizer
  data={{ name }}
  updateStateOnDataChanged={(draft, data) => { draft.draftName = data.name }}
/>
```

Both `bindPropToState` and `StateSynchronizer` are experimental. Prefer seeding with `initialState` and writing from event handlers.
