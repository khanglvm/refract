// Playground for draft updates: typing a city writes one nested field, and the panel shows the
// useState spread you would otherwise write next to the one-line draft assignment.
import { createContextState } from 'refract-state'

type State = { user: { name: string; address: { city: string; country: string } } }

const store = createContextState<State>('refract-site-drafts')

function Editor() {
  const [city, setState] = store.useContextState(s => s.user.address.city)
  const user = store.useContextStateValue(s => s.user)
  const value = JSON.stringify(city)
  return (
    <div className="play-split">
      <div>
        <label className="field">
          <span>City</span>
          <input value={city} maxLength={24} onChange={e => { const next = e.target.value; setState(d => { d.user.address.city = next }) }} />
        </label>
        <pre className="state-view" aria-label="Current state"><code>{JSON.stringify({ user }, null, 2)}</code></pre>
      </div>
      <div className="compare">
        <div>
          <span className="compare-label">With useState</span>
          <pre className="code small"><code>{`setUser(user => ({
  ...user,
  address: { ...user.address, city: ${value} }
}))`}</code></pre>
        </div>
        <div>
          <span className="compare-label accent">With Refract</span>
          <pre className="code small"><code>{`setState(draft => {
  draft.user.address.city = ${value}
})`}</code></pre>
        </div>
      </div>
    </div>
  )
}

export function NoSpreadingPlayground() {
  return (
    <store.Provider initialState={{ user: { name: 'Linh', address: { city: 'Hue', country: 'Vietnam' } } }}>
      <Editor />
    </store.Provider>
  )
}
