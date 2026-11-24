// Playground for server rendering: renderToString runs in the browser here, the same call a server
// makes per request. Each render seeds a fresh store, so one request never sees another's state.
import { useRef, useState } from 'react'
import { createContextState } from 'refract-state'

type State = { user: string }

const store = createContextState<State>('refract-site-server')

function Greeting() {
  const user = store.useContextStateValue(s => s.user)
  return <p>Hello, {user}</p>
}

type Render = { id: number; user: string; html: string }
const USERS = ['Linh', 'Minh', 'An']
/** How many past renders the list keeps. */
const MAX_RENDERS = 3

export function ServerRenderPlayground() {
  const [renders, setRenders] = useState<Render[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const nextId = useRef(0)

  // react-dom/server loads only when someone asks for a render, so the page stays light.
  // A failed chunk load (offline, stale deploy) shows a message and frees the buttons for a retry.
  const renderRequest = async (user: string) => {
    setBusy(true)
    setError('')
    try {
      const { renderToString } = await import('react-dom/server')
      const html = renderToString(<store.Provider initialState={{ user }}><Greeting /></store.Provider>)
      const id = ++nextId.current
      setRenders(list => [{ id, user, html }, ...list].slice(0, MAX_RENDERS))
    } catch {
      setError('Could not load react-dom/server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="play-split">
      <div>
        <div className="controls">
          {USERS.map(user => (
            <button type="button" key={user} disabled={busy} onClick={() => renderRequest(user)}>Request as {user}</button>
          ))}
        </div>
        <pre className="code small"><code>{`// app/page.tsx, a server component
const user = await getUser()
return (
  <UserProvider initialState={{ user }}>
    <Greeting />
  </UserProvider>
)`}</code></pre>
      </div>
      <ol className="requests" aria-live="polite">
        {error && <li className="requests-empty">{error}</li>}
        {renders.length === 0 && !error && <li className="requests-empty">Pick a user to render a request.</li>}
        {renders.map(r => (
          <li key={r.id}>
            <span className="compare-label">HTML for {r.user}</span>
            <code>{r.html}</code>
          </li>
        ))}
      </ol>
    </div>
  )
}
