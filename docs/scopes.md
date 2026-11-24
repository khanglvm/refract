# Scope, nesting and several stores

Each Provider owns separate state, so where you place it decides who shares it. Providers of different stores nest freely, and a component outside its Provider gets a silent fallback store.

## Place the Provider

- App-wide state (user, language, permissions): one Provider in the root layout.
- A page or flow: a Provider in that route's layout, so the state survives navigation between its child routes.
- Per instance: a Provider inside a repeated component, so each card or dialog has its own state. [Wrap a component with its Provider](wrap-components.md) does this for you.

## Nest several stores

Providers of different stores nest freely. A component reads each store through its own hooks:

```tsx
<AppShellProvider initialState={shell}>
  <ChatProvider initialState={{ messages: [] }}>
    <JobEditorProvider initialState={job}>
      <Page />
    </JobEditorProvider>
  </ChatProvider>
</AppShellProvider>
```

When a handler in an inner feature needs a value from an outer store, read it with the outer store's snapshot getter instead of subscribing.

Two Providers of the same store can nest as well. A hook reads the nearest one above it.

## Outside the Provider

A component outside its matching Provider gets an empty fallback store: selectors read `{}` and setters do nothing. Brivo raises no missing-Provider error, but a selector that reads a nested field, such as `state => state.profile.name`, throws a `TypeError`. Development builds log a one-time warning per store.

If an update seems to vanish, check that the component sits under the Provider created by the same factory call.
