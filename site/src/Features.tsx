// "What you get": a tab per strength, each with a live playground that runs the library source.
import { useEffect, useRef, useState } from 'react'
import type { ComponentType, KeyboardEvent, SVGProps } from 'react'
import { FilterIcon, LayersIcon, PenIcon, ServerIcon, UndoIcon } from './icons'
import { RerendersPlayground } from './features/Rerenders'
import { NoSpreadingPlayground } from './features/NoSpreading'
import { ServerRenderPlayground } from './features/ServerRender'
import { UndoPlayground } from './features/Undo'
import { ScopedPlayground } from './features/Scoped'

type Feature = { id: string; title: string; body: string; icon: ComponentType<SVGProps<SVGSVGElement>>; Playground: ComponentType }

const FEATURES: Feature[] = [
  { id: 'rerenders', title: 'Fine-grained rerenders', icon: FilterIcon, Playground: RerendersPlayground,
    body: 'A component rerenders only when the value its selector returns changes, compared by value. Writer-only components never subscribe, and updates in one click notify once.' },
  { id: 'drafts', title: 'No spreading', icon: PenIcon, Playground: NoSpreadingPlayground,
    body: 'Assign to a nested field on the draft and Immer builds the next state. Type a city and compare the two updates.' },
  { id: 'server', title: 'Next.js ready', icon: ServerIcon, Playground: ServerRenderPlayground,
    body: "Every module ships with 'use client'. A server component seeds the Provider, and each server render gets a fresh store. These requests render with the real renderToString." },
  { id: 'undo', title: 'Undo any update', icon: UndoIcon, Playground: UndoPlayground,
    body: 'Every update returns revert, which undoes only the fields that update changed. Here a failed save rolls back the title and keeps the likes.' },
  { id: 'scoped', title: 'Scoped stores', icon: LayersIcon, Playground: ScopedPlayground,
    body: 'State lives in the Provider. Render one per card, route or app, and each keeps its own state.' }
]

export function Features() {
  const [active, setActive] = useState(0)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const feature = FEATURES[active]
  const Playground = feature.Playground

  // On narrow screens the tabs scroll sideways; keep the selected one in view without moving the page.
  useEffect(() => {
    const tab = tabs.current[active]
    const row = tab?.parentElement
    if (!tab || !row || row.scrollWidth <= row.clientWidth) return
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2
    row.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [active])

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (active + step + FEATURES.length) % FEATURES.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section className="section">
      <h2>What you get</h2>
      <div className="explorer">
        <div className="feature-tabs" role="tablist" aria-label="Features" onKeyDown={onKeyDown}>
          {FEATURES.map(({ id, title, icon: Icon }, i) => (
            <button key={id} ref={el => { tabs.current[i] = el }} type="button" role="tab" id={`tab-${id}`}
              aria-selected={i === active} aria-controls={`panel-${id}`} tabIndex={i === active ? 0 : -1}
              className="feature-tab" onClick={() => setActive(i)}>
              <span className="tile"><Icon /></span>
              <span>{title}</span>
            </button>
          ))}
        </div>
        <div className="feature-panel" role="tabpanel" id={`panel-${feature.id}`} aria-labelledby={`tab-${feature.id}`}>
          <h3>{feature.title}</h3>
          <p>{feature.body}</p>
          <Playground />
        </div>
      </div>
    </section>
  )
}
