# Refract: product

## Who it is for
React and Next.js developers who share state across the components of one feature (a form, an editor, a page's filters, the app shell) and want it scoped to a Provider instead of a global store.

## What it does
- One factory, `createContextState<State>()`, gives a typed Provider and hooks.
- Components subscribe through selectors and rerender only when the selected value changes.
- Updates are partial objects or Immer drafts; each returns a function that undoes it, for optimistic updates.
- Each Provider owns its state, so the same store can be mounted several times, nested, or reset by remounting.
- Works with React 18 and 19, server rendering and the Next.js App Router.

## What it leaves out
Server cache concerns (refetching, retries, invalidation), devtools, persistence and middleware. Pair it with a data-fetching library.

## Surfaces
- npm: `refract-state`
- GitHub: https://github.com/khanglvm/refract
- Landing page: https://refract.khangle.dev
- Docs: https://docs.khangle.dev/refract
