// Imports the built package by name, as a consumer would, and renders a store on the server.
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createContextState } from 'brivo'
import type { TContextState, TDeepReadonly } from 'brivo'

const store = createContextState<{ count: number }>()
function Value() { const count = store.useContextStateValue(s => s.count); return createElement('span', null, count) }
if (renderToString(createElement(store.Provider, { initialState: { count: 42 } }, createElement(Value))) !== '<span>42</span>') throw new Error('SSR consumer failed')

const typed: TContextState = store as unknown as TContextState
const readonlyState: TDeepReadonly<{ a: { b: number } }> = { a: { b: 1 } }
void typed; void readonlyState
console.log('Package entry and SSR passed')
