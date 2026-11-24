import { useState } from 'react'
import { CheckIcon, CopyIcon } from './icons'

const COPIED_RESET_MS = 1600

/** A shell command with a copy button; falls back silently when the clipboard is unavailable. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the command stays selectable.
    }
  }
  return (
    <div className="command">
      <code><span className="prompt">$</span> {command}</code>
      <button type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy command'}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  )
}
