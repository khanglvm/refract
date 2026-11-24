// Playground for server rendering: renderToString runs in the browser here, the same call a server
// makes per request. Each render seeds a fresh store, so one request never sees another's state.
import { useState } from 'react'
import { createContextState } from 'refract-state'

type State = { user: string }

const store = createContextState<State>('refract-site-server')

function Greeting() {
  const user = store.useContextStateValue(s => s.user)
  return <p>Hello, {user}</p>
}

type Render = { user: string; html: string }
const USERS = ['Linh', 'Minh', 'An']

export function ServerRenderPlayground() {
  const [renders, setRenders] = useState<Render[]>([])
  const [busy, setBusy] = useState(false)

  // react-dom/server loads only when someone asks for a render, so the page stays light.
  const renderRequest = async (user: string) => {
    setBusy(true)
    const { renderToString } = await import('react-dom/server')
    const html = renderToString(<store.Provider initialState={{ user }}><Greeting /></store.Provider>)
    setRenders(list => [{ user, html }, ...list].slice(0, 3))
    setBusy(false)
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
        {renders.length === 0 && <li className="requests-empty">Pick a user to render a request.</li>}
        {renders.map((r, i) => (
          <li key={renders.length - i}>
            <span className="compare-label">HTML for {r.user}</span>
            <code>{r.html}</code>
          </li>
        ))}
      </ol>
    </div>
  )
}
