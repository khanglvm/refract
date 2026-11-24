# Install Refract

Refract is published on npm as `refract-state`. It needs React 18 or 19 and brings Immer as its only dependency.

## Install from npm

```sh
npm i refract-state
```

React is a peer dependency (`^18.0.0 || ^19.0.0`), so the app supplies it. Immer (`^10.1.1`) is installed with Refract.

## What the package contains

- One entry point, `refract-state`. It exports `createContextState` and the types `TContextState`, `TDeepReadonly` and `TDeepMutable`.
- ES modules with TypeScript declarations.
- `'use client'` at the top of every module, so the Next.js App Router treats the package as client code. Your own store files still need the directive; see [Next.js](nextjs.md).
- These docs and `llms.txt`, under `node_modules/refract-state/`, matching the installed version.

## Development checks

Refract runs two checks only when `process.env.NODE_ENV === 'development'`: `useContextStateValue` throws on an impure selector, and a hook used outside its Provider logs a one-time warning. Vite, webpack and Next.js set that value in dev and replace it in production builds, so the checks run while you develop and are skipped in production builds. Node and test runners read `NODE_ENV` from the environment. Without a bundler and without a global `process`, the checks stay off.

## Next step

[Quick start](quickstart.md) builds a counter, then a store module you can copy.
