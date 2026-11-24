// The landing page: hero, live demo, example code, features and footer.
import { CopyCommand } from './CopyCommand'
import { Demo } from './Demo'
import { Logo } from './Logo'
import { BookIcon, FilterIcon, GithubIcon, LayersIcon, PenIcon, ServerIcon, UndoIcon } from './icons'

const DOCS_URL = 'https://docs.khangle.dev/refract'
const GITHUB_URL = 'https://github.com/khanglvm/refract'
const NPM_URL = 'https://www.npmjs.com/package/refract-state'

const EXAMPLE = `'use client'
import { createContextState } from 'refract-state'

const counter = createContextState<{ count: number }>()

function Count() {
  const count = counter.useContextStateValue(s => s.count)
  return <p>Count: {count}</p>
}

function AddOne() {
  const setState = counter.useSetContextState()
  return <button onClick={() => setState(d => { d.count += 1 })}>Add one</button>
}

export default function App() {
  return (
    <counter.Provider initialState={{ count: 0 }}>
      <Count />
      <AddOne />
    </counter.Provider>
  )
}`

const FEATURES = [
  { icon: FilterIcon, title: 'Fine-grained rerenders', body: 'A component rerenders only when the value its selector returns changes, compared by value, so derived arrays and objects are safe. Writer-only components never subscribe.' },
  { icon: PenIcon, title: 'No spreading', body: 'Write draft.user.address.city = "Hanoi" and Immer builds the next state. A partial object replaces only the top-level keys you pass.' },
  { icon: ServerIcon, title: 'Next.js ready', body: "Every module ships with 'use client'. Seed a Provider from a server component, and each server render gets its own store." },
  { icon: UndoIcon, title: 'Undo any update', body: 'Every update returns revert, which undoes only what that update changed. Optimistic saves take a few lines.' },
  { icon: LayersIcon, title: 'Scoped stores', body: 'State lives in the Provider. Mount one per app, per route or per list item, and nest them freely.' },
]

function Header() {
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="Refract home"><Logo size={22} /><span>Refract</span></a>
      <nav>
        <a href={DOCS_URL}>Docs</a>
        <a href={NPM_URL}>npm</a>
        <a href={GITHUB_URL} aria-label="GitHub"><GithubIcon /></a>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-mark"><Logo size={96} /></div>
      <h1>React state that rerenders only what changed</h1>
      <p className="lead">
        Each component reads the value it needs and rerenders only when that value changes. Write nested updates as plain
        assignments, undo any of them, and use the same store in the Next.js App Router.
      </p>
      <CopyCommand command="npm i refract-state" />
      <div className="actions">
        <a className="button" href={`${DOCS_URL}/quickstart`}><BookIcon /> Quick start</a>
        <a className="button ghost" href={GITHUB_URL}><GithubIcon /> GitHub</a>
      </div>
    </section>
  )
}

function DemoSection() {
  return (
    <section className="section">
      <h2>One store, only the selected parts react</h2>
      <p>Each card below subscribes to a different slice of the same store and counts its own renders. Click a button and only the card that reads that slice renders again. Undo reverts the last update.</p>
      <Demo />
    </section>
  )
}

function ExampleSection() {
  return (
    <section className="section">
      <h2>A store in a few lines</h2>
      <p>Clicking the button rerenders <code>Count</code>. <code>AddOne</code> only writes, so it never subscribes.</p>
      <pre className="code"><code>{EXAMPLE}</code></pre>
    </section>
  )
}

function Features() {
  return (
    <section className="section">
      <h2>What you get</h2>
      <ul className="features">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <li key={title}><span className="tile"><Icon /></span><h3>{title}</h3><p>{body}</p></li>
        ))}
      </ul>
    </section>
  )
}

export function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <DemoSection />
        <ExampleSection />
        <Features />
      </main>
      <footer className="footer">
        <span>MIT licence. Made by <a href="https://khangle.dev">Khang Le</a>.</span>
        <span><a href={DOCS_URL}>Docs</a> · <a href={GITHUB_URL}>GitHub</a> · <a href={NPM_URL}>npm</a></span>
      </footer>
    </>
  )
}
