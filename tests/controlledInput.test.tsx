// Controlled inputs that read from a store keep the typed value and the caret through the input event.
// React DOM decides at load whether it runs in a browser, so this file builds the DOM before importing
// it; with React DOM loaded first (as in createContextState.test.tsx), jsdom skips the value restore
// that caused the bug and cannot show it.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as React from 'react'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: false })
const { createRoot } = await import('react-dom/client')
const { flushSync } = await import('react-dom')
const { createContextState } = await import('../src/createContextState')

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

test('typing mid-string in a controlled input keeps the value and the caret', async () => {
  const store = createContextState<{ city: string }>()
  function Field() {
    const [city, setState] = store.useContextState(s => s.city)
    return <input value={city} onChange={e => { const next = e.target.value; setState(d => { d.city = next }) }} />
  }
  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)
  try {
    // flushSync commits the tree and runs its effects, so the field is subscribed before typing.
    flushSync(() => root.render(<store.Provider initialState={{ city: 'Hue' }}><Field /></store.Provider>))
    const input = container.querySelector('input')!
    // The prototype setter bypasses React's value tracker, as a keystroke does.
    const setValue = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!
    setValue.call(input, 'Hxue')
    input.setSelectionRange(2, 2)
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    // A store that notifies after the event lets React put 'Hue' back here, and the later render
    // moves the caret to the end.
    assert.equal(input.value, 'Hxue')
    await tick()
    assert.equal(input.value, 'Hxue')
    assert.equal(input.selectionStart, 2)
  } finally {
    root.unmount()
    container.remove()
    dom.window.close()
  }
})
