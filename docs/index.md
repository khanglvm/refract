# Refract

Refract is scoped, typed state for React. Each Provider owns a store, components subscribe to the parts they need through selectors, updates go through Immer drafts, and every update returns a function that undoes it.

It is for state that several components of one feature share: a form, an editor, a page's filters, or the app shell (user, language, permissions). State that one component owns belongs in `useState`. Server cache concerns such as refetching, retries and cache invalidation belong in a data-fetching library; write its results into a store only when components edit them.

Refract works with React 18 and 19, and with the Next.js App Router. The patterns in these guides come from production React and Next.js apps.

## What you get

`createContextState<State>()` returns a Provider and a set of hooks typed to `State`:

- Selectors pick a slice of state, and a component rerenders only when its selected value changes. Results are compared by value, so a selector can return a new object.
- Updates take a partial object or an Immer draft function. Each one returns a `revert` function for optimistic updates.
- A snapshot getter reads the current state inside async handlers without subscribing the component.
- State lives in the Provider, so where you place it decides who shares it: the whole app, one route, or each card in a list.
- During server rendering, each Provider creates its own store, so two requests never share state.

## Where to go next

| You want to | Read |
| --- | --- |
| Add Refract to a project | [Install](install.md) |
| Build a first store | [Quick start](quickstart.md) |
| Pick what a component reads | [Read with selectors](selectors.md) |
| Change state | [Update state](updates.md) |
| Show a change before the server confirms it | [Optimistic updates with revert](rollback.md) |
| Start a store from data, or fetch into it | [Seed and load data](data.md) |
| Give components named hooks instead of selectors | [Feature hooks](feature-hooks.md) |
| Decide where Providers go | [Scope, nesting and several stores](scopes.md) |
| Give a component its own store | [Wrap a component with its Provider](wrap-components.md) |
| Recompute derived data once per batch | [Post-flush callbacks](post-flush.md) |
| Use it in the App Router | [Next.js](nextjs.md) |
| Look up a hook or a type | [API reference](api.md) |
| Know the costs and the edge cases | [How it works](how-it-works.md) |
| Let a coding agent write the code | [Refract for coding agents](agents.md) |
