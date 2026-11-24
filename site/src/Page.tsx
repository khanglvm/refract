// The landing page: hero, live demo, example code, features and footer.
import { CopyCommand } from './CopyCommand'
import { Demo } from './Demo'
import { Logo } from './Logo'
import { Features } from './Features'
import { BookIcon, GithubIcon } from './icons'

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
