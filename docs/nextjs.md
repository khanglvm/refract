# Next.js App Router

Brivo stores and their hooks run in client components; a server component can only render a Provider and pass it `initialState`. Most App Router problems with Brivo come from putting a hook or a helper on the wrong side of that line.

## What runs where

| Piece | Server components | Client components |
| --- | --- | --- |
| `createContextState` and the hooks it returns | No | Yes |
| The `Provider` it returns | Render it and pass serializable `initialState` | Yes |

Every module in the package starts with `'use client'`.

## Rules for your own files

1. Files that call `createContextState` start with `'use client'`. Server components import their Provider from these files.
2. Every component that calls the hooks is a client component.
3. Keep types, constants and plain helpers in files without `'use client'`. Every export of a client file is a client reference on the server: a server component can render a client component from it but cannot call its functions. For example, keep `profileStateFrom(profile)` in `profile/profile.ts`, not in the store file.

A layout that follows these rules:

```text
profile/
  profile.ts          # types and helpers: server + client
  profile-store.ts    # 'use client': createContextState
  profile-card.tsx    # 'use client': components that call the hooks
app/
  layout.tsx          # server: renders app-wide Providers
  page.tsx            # server: fetches data, renders ProfileProvider
```

## Seed a store from the server

A server component can fetch data and pass it to a Provider. The store keeps it as initial state, and all later changes happen on the client.

```tsx
// app/profile/page.tsx (server component)
import { ProfileProvider } from '@/profile/profile-store'
import { profileStateFrom } from '@/profile/profile' // plain module, not 'use client'
import { ProfileCard } from '@/profile/profile-card'

export default async function Page() {
  const profile = await getProfile()
  return (
    <ProfileProvider initialState={profileStateFrom(profile)}>
      <ProfileCard />
    </ProfileProvider>
  )
}
```

- Pass serializable data: plain objects, arrays, strings, numbers, booleans, `null`.
- Pass the same initial values on the server and on the client so hydration matches.
- The Provider reads `initialState` once. A later `router.refresh()` renders the server component again with new props, and the mounted store ignores them, so edits survive. Use `key` to remount when you want the new data.
- Put app-wide Providers in `app/layout.tsx` and route-group Providers in the group's `layout.tsx`. Layout state survives navigation between child routes.

## Server rendering

- Each Provider creates its own store during server rendering. Two requests never share state, even with the same instance ID.
- Selected values are cached per hook, so a finished server render releases them without effect cleanup.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "Attempted to call ...() from the server but ... is on the client" | A server component called a function exported from a `'use client'` file; move the function to a plain module |
| `useContext` or hook errors in a server component | A hook from a store was called on the server; move that code to a client component |
| Hydration mismatch | The server and the client passed different `initialState` values |
| An update does nothing | The component is outside the Provider of that store, so it got the no-op fallback store; see [Scope, nesting and several stores](scopes.md#outside-the-provider) |
