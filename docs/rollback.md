# Optimistic updates with revert

Every `setState` call returns a function that undoes that one update. This page shows the optimistic update pattern and exactly what a revert restores.

## Show the change, undo it on failure

The example uses the profile store from the [quick start](quickstart.md), with `setState` from `useSetProfile()` and `getSnapshot` from `useProfileSnapshot()`.

```tsx
async function save() {
  const { profile, draftName } = getSnapshot()

  const revert = setState(draft => {
    draft.profile.name = draftName
    draft.status = 'saving'
  })

  try {
    await api.saveName(profile.id, draftName)
    setState({ status: 'saved' })
  } catch {
    revert() // profile.name and status return to their values before this update
    setState({ status: 'failed' })
  }
}
```

## What a revert restores

The revert applies Immer's inverse patches for that one update to the current state:

- Fields changed only by other updates keep their new values.
- A field changed by this update and then changed again is set back to the value before this update, overwriting the later change.
- Revert functions are independent. There is no history stack or redo.
- A revert notifies subscribers like any other update.

If two saves can overlap on the same field, queue them or disable the button while one is pending.

## Skip patch recording

Pass `false` when you never revert. The setter then skips recording patches, and the function it returns does nothing:

```tsx
const setState = useSetProfile(false)
const [draftName, setFast] = useProfileState(state => state.draftName, false)
```
