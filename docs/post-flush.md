# Post-flush callbacks

A post-flush callback recomputes an expensive derived value once per batch of updates instead of once per update. It runs after all updates in a microtask and before subscribers are notified, and it receives an Immer draft. Registering one switches that Provider from notifying on every update to notifying once per batch. A read of the state before the batch, through a hook or the snapshot getter, runs the callback first, so derived values are never behind.

## Register the callback

```tsx
// builder/builder-store.ts
'use client'

import { createContextState } from 'refract-state'

export type Block = { id: string; parentId: string | null }

export type BuilderState = {
  blocks: Block[]
  hierarchy: Record<string, string[]>
  hierarchyStale: boolean
}

export const {
  Provider: BuilderProvider,
  useSetContextState: useSetBuilder,
  useSetPostFlush: useSetBuilderPostFlush,
} = createContextState<BuilderState>('builder')
```

```tsx
function HierarchyRegistrar() {
  const setPostFlush = useSetBuilderPostFlush()
  useEffect(() => {
    setPostFlush(draft => {
      if (!draft.hierarchyStale) return
      draft.hierarchy = buildHierarchy(draft.blocks)
      draft.hierarchyStale = false
    })
  }, [setPostFlush])
  return null
}

// Updates only mark the value stale:
setState(draft => {
  draft.blocks.push(block)
  draft.hierarchyStale = true
})
```

## Rules

- Render the registrar once inside the Provider.
- Each Provider holds one callback. Registering again replaces it, and there is no unregister function.
- Changes made by the callback are not part of any revert.
- Updates made before registration, such as one in a sibling's mount effect, are notified right away. Registering the callback then queues one batch, so it also runs for them.
- Read state after all of a handler's updates, not between them. Each read between updates runs the callback again.
- Controlled text inputs that read from this store move their caret to the end while you type, because the store notifies a microtask after the input event. Give such a field local `useState` or make it uncontrolled.
