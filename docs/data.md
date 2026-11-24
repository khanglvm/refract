# Seed and load data

A store can start from data you already have, or fetch data into itself after it mounts. This page covers `initialState`, resetting a store, and keeping loading flags next to the data.

## Seed the store with initialState

`initialState` is read once, when the Provider mounts. Later changes to the prop do not reset the store, so edits in progress survive parent rerenders.

In a client-rendered React app, mount the Provider when the data is ready. The example uses the profile store from the [quick start](quickstart.md).

```tsx
function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState['profile'] | null>(null)
  useEffect(() => { getProfile().then(setProfile) }, [])

  if (!profile) return <Spinner />
  return (
    <ProfileProvider initialState={{ profile, draftName: profile.name, status: 'idle' }}>
      <ProfileCard />
    </ProfileProvider>
  )
}
```

In the Next.js App Router, a server component can fetch the data and pass it to the Provider; see [Next.js](nextjs.md#seed-a-store-from-the-server).

Give the Provider a complete initial state. `initialState` is typed as `Partial<State>`, but selectors read fields that must exist.

To start over with fresh data, remount the Provider, for example with `key={profile.id}`.

## Load data into the store

A store can hold fetched data next to the UI state that edits it. Keep the loading flag in the store too, and read it with the snapshot getter to skip a request that is already running.

```tsx
// notifications/notification-store.ts
'use client'

import { createContextState } from 'refract-state'

export type Notification = { id: string; text: string; read: boolean }

export type NotificationState = {
  items: Notification[]
  page: number
  isLoading: boolean
  error: string | null
}

export const {
  Provider: NotificationProvider,
  useContextStateValue: useNotificationValue,
  useSetContextState: useSetNotifications,
  useStateSnapshotGetter: useNotificationSnapshot,
} = createContextState<NotificationState>('notifications')
```

```tsx
function useLoadNotifications() {
  const setState = useSetNotifications()
  const getSnapshot = useNotificationSnapshot()

  return async function loadNotifications(page: number) {
    if (getSnapshot(state => state.isLoading)) return // already loading

    setState({ isLoading: true })
    try {
      const result = await api.notifications(page)
      setState(draft => {
        draft.items.push(...result.items)
        draft.page = page
        draft.isLoading = false
      })
    } catch (error) {
      setState({ isLoading: false, error: String(error) })
    }
  }
}
```

If you already use React Query, SWR or Apollo, let it own server data and caching, and use a store for the editable copy or the UI state around it.
