// design-slop-ok: drawn-art — logo: the Refract mark (outline prism, one beam, three rays)
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size * 4 / 3} height={size} viewBox="0 0 160 120" fill="none" aria-hidden="true">
      <path d="M70 12 L120 104 L20 104 Z" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
      <path d="M0 70 L42.8 62" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M42.8 62 L92.8 54" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      <path d="M92.8 54 L156 38" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      <path d="M92.8 54 L156 56" stroke="var(--accent)" strokeOpacity=".45" strokeWidth="7" strokeLinecap="round" />
      <path d="M92.8 54 L156 74" stroke="var(--accent)" strokeOpacity=".2" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
