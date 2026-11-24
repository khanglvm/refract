// Playground for revert: Save applies the new title at once, then a fake request fails or succeeds.
// On failure revert() undoes only the title, so likes added while it was saving stay.
import { useEffect, useRef, useState } from 'react'
import { createContextState } from 'refract-state'

type State = { title: string; likes: number }

const store = createContextState<State>('refract-site-undo')
/** How long the fake save request takes, in milliseconds. */
const SAVE_MS = 1400
const TITLES = ['Launch notes', 'Release plan', 'Team update']

function Post() {
  const [{ title, likes }, setState, getSnapshot] = store.useContextState(s => s)
  const [failNext, setFailNext] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  // Switching tabs unmounts the playground; drop a pending fake request with it.
  useEffect(() => () => clearTimeout(timer.current), [])

  // The outcome is fixed when the request starts, so the fail switch is locked while it is pending.
  const save = () => {
    const current = getSnapshot(s => s.title)
    const next = TITLES[(TITLES.indexOf(current) + 1) % TITLES.length]
    const revert = setState(d => { d.title = next })
    setSaving(true)
    setStatus('Saving…')
    timer.current = setTimeout(() => {
      setSaving(false)
      if (failNext) { revert(); setStatus('The request failed, so revert() put the old title back. Your likes stayed.') }
      else setStatus('Saved.')
    }, SAVE_MS)
  }

  return (
    <div className="play-split">
      <div className="post">
        <span className="post-title">{title}</span>
        <span className="post-likes">{likes} likes</span>
        <div className="controls">
          <button type="button" onClick={save} disabled={saving}>Rename and save</button>
          <button type="button" className="ghost" onClick={() => setState(d => { d.likes += 1 })}>Like</button>
        </div>
        <label className="check">
          <input type="checkbox" checked={failNext} disabled={saving} onChange={e => setFailNext(e.target.checked)} />
          <span>Make the save fail</span>
        </label>
        <p className="play-log" aria-live="polite">{status || 'Rename and save, then press Like while it is saving.'}</p>
      </div>
      <pre className="code small"><code>{`const revert = setState(draft => {
  draft.title = next
})
try {
  await saveTitle(next)
} catch {
  revert() // undoes the title only
}`}</code></pre>
    </div>
  )
}

export function UndoPlayground() {
  return (
    <store.Provider initialState={{ title: TITLES[0], likes: 3 }}>
      <Post />
    </store.Provider>
  )
}

