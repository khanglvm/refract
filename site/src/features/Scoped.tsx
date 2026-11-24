// Playground for scoped stores: the same store renders three Providers, and each card keeps its own count.
import { createContextState } from 'refract-state'

type State = { count: number }

const store = createContextState<State>('refract-site-scoped')
const CARDS = ['Card A', 'Card B', 'Card C']

function Counter({ name }: { name: string }) {
  const [count, setState] = store.useContextState(s => s.count)
  return (
    <div className="card">
      <div className="card-head"><span className="card-name">{name}</span></div>
      <div className="card-value">{count}</div>
      <div className="controls tight">
        <button type="button" onClick={() => setState(d => { d.count += 1 })}>Add one</button>
      </div>
    </div>
  )
}

export function ScopedPlayground() {
  return (
    <div className="play-split">
      <div className="cards">
        {CARDS.map(name => (
          <store.Provider key={name} initialState={{ count: 0 }}>
            <Counter name={name} />
          </store.Provider>
        ))}
      </div>
      <pre className="code small"><code>{`{cards.map(card => (
  <CounterProvider key={card.id} initialState={{ count: 0 }}>
    <Counter />
  </CounterProvider>
))}`}</code></pre>
    </div>
  )
}
