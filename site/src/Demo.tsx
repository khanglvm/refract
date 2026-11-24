// Live demo built on the library source: three components subscribe to different slices of one store,
// and each card counts its own renders, so a click shows which components an update actually reached.
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createContextState } from 'refract-state'
import { UndoIcon } from './icons'

type DemoState = {
  profile: { name: string }
  cart: { items: string[] }
  theme: 'light' | 'dark'
}

const NAMES = ['Linh', 'Minh', 'An', 'Bao', 'Chi']
const ITEMS = ['Keyboard', 'Mouse', 'Monitor', 'Lamp', 'Desk mat', 'Cable']
const MAX_ITEMS = 4

const demo = createContextState<DemoState>('refract-site-demo')

/** Card that counts its renders and replays a highlight each time it renders again. */
export function SubscriberCard({ title, selector, children }: { title: string; selector: string; children: ReactNode }) {
  const renders = useRef(0)
  renders.current += 1
  return (
    <div className="card" key={renders.current} data-fresh={renders.current > 1 || undefined}>
      <div className="card-head">
        <span className="card-name">{title}</span>
        <span className="card-count" aria-label={`Rendered ${renders.current} times`}>{renders.current} {renders.current === 1 ? 'render' : 'renders'}</span>
      </div>
      <code className="card-selector">{selector}</code>
      <div className="card-value">{children}</div>
    </div>
  )
}

function ProfileCard() {
  const name = demo.useContextStateValue(state => state.profile.name)
  return <SubscriberCard title="Profile" selector="s => s.profile.name">{name}</SubscriberCard>
}

function CartCard() {
  const count = demo.useContextStateValue(state => state.cart.items.length)
  return <SubscriberCard title="Cart" selector="s => s.cart.items.length">{count} {count === 1 ? 'item' : 'items'}</SubscriberCard>
}

function ThemeCard() {
  const theme = demo.useContextStateValue(state => state.theme)
  return <SubscriberCard title="Theme" selector="s => s.theme">{theme}</SubscriberCard>
}

/** Buttons that update one slice each; every update's revert goes on a stack for the Undo button. */
function Controls() {
  const setState = demo.useSetContextState()
  const getSnapshot = demo.useStateSnapshotGetter()
  const [reverts, setReverts] = useState<Array<() => void>>([])

  const run = (update: (draft: DemoState) => void) => {
    const revert = setState(update)
    setReverts(stack => [...stack, revert])
  }
  const undo = () => {
    const last = reverts[reverts.length - 1]
    if (!last) return
    last()
    setReverts(stack => stack.slice(0, -1))
  }
  const nextName = () => NAMES[(NAMES.indexOf(getSnapshot(s => s.profile.name)) + 1) % NAMES.length]
  const cartFull = () => getSnapshot(s => s.cart.items.length) >= MAX_ITEMS

  return (
    <div className="controls">
      <button type="button" onClick={() => run(d => { d.profile.name = nextName() })}>Rename user</button>
      <button type="button" onClick={() => { if (!cartFull()) run(d => { d.cart.items.push(ITEMS[d.cart.items.length % ITEMS.length]) }) }}>Add to cart</button>
      <button type="button" onClick={() => run(d => { d.theme = d.theme === 'light' ? 'dark' : 'light' })}>Toggle theme</button>
      <button type="button" className="ghost" onClick={undo} disabled={reverts.length === 0}>
        <UndoIcon width={16} height={16} /> Undo
      </button>
    </div>
  )
}

export function Demo() {
  return (
    <demo.Provider initialState={{ profile: { name: NAMES[0] }, cart: { items: [] }, theme: 'light' }}>
      <div className="demo">
        <Controls />
        <div className="cards">
          <ProfileCard />
          <CartCard />
          <ThemeCard />
        </div>
      </div>
    </demo.Provider>
  )
}
