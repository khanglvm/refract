// Playground for fine-grained rerenders: two readers of one store count their renders while the
// buttons make updates that do, or do not, change what each reader selected.
import { useState } from 'react'
import { createContextState } from 'refract-state'
import { SubscriberCard } from '../Demo'

type Todo = { id: number; title: string; done: boolean }
type State = { todos: Todo[]; filter: 'all' | 'open' | 'done' }

const store = createContextState<State>('refract-site-rerenders')
const INITIAL: State = {
  todos: [
    { id: 1, title: 'Write the spec', done: true },
    { id: 2, title: 'Review the PR', done: false },
    { id: 3, title: 'Ship it', done: false }
  ],
  filter: 'all'
}
const FILTERS: State['filter'][] = ['all', 'open', 'done']

function DoneList() {
  const done = store.useContextStateValue(s => s.todos.filter(t => t.done))
  return (
    <SubscriberCard title="Done list" selector="s => s.todos.filter(t => t.done)">
      {done.length} done
    </SubscriberCard>
  )
}

function FilterLabel() {
  const filter = store.useContextStateValue(s => s.filter)
  return <SubscriberCard title="Filter" selector="s => s.filter">{filter}</SubscriberCard>
}

/** Writes only, so it never subscribes; its own render count stays at 1. */
function Buttons({ onLog }: { onLog: (line: string) => void }) {
  const setState = store.useSetContextState()
  const getSnapshot = store.useStateSnapshotGetter()
  const renameOpen = () => {
    setState(d => { d.todos[1].title += '!' })
    onLog('Renamed an open todo. The done list is equal by value, so neither card rendered.')
  }
  const toggleLast = () => {
    setState(d => { d.todos[2].done = !d.todos[2].done })
    onLog('Toggled "Ship it". Only the done list changed, so only it rendered.')
  }
  // Three writes in one click; the last one always differs from the current filter, so the card
  // has something to show and renders once for all three.
  const threeUpdates = () => {
    const current = getSnapshot(s => s.filter)
    const [a, b] = FILTERS.filter(f => f !== current)
    setState({ filter: a })
    setState({ filter: b })
    setState({ filter: a })
    onLog('Ran setState three times in one click. The filter card rendered once.')
  }
  return (
    <div className="controls">
      <button type="button" onClick={renameOpen}>Rename an open todo</button>
      <button type="button" onClick={toggleLast}>Toggle a todo</button>
      <button type="button" onClick={threeUpdates}>Three updates at once</button>
    </div>
  )
}

export function RerendersPlayground() {
  const [log, setLog] = useState('Each card counts its own renders. Try a button.')
  // The log sits outside the Provider: a changing child there would rerender the whole tree below it
  // and spoil the render counts this playground is showing.
  return (
    <>
      <store.Provider initialState={INITIAL}>
        <Buttons onLog={setLog} />
        <div className="cards two">
          <DoneList />
          <FilterLabel />
        </div>
      </store.Provider>
      <p className="play-log" aria-live="polite">{log}</p>
    </>
  )
}
