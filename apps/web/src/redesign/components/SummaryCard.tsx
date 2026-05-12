import type { CSSProperties, ReactNode } from 'react'

interface SummaryCardProps {
  value: ReactNode
  label: ReactNode
  style?: CSSProperties
}

export default function SummaryCard({ value, label, style }: SummaryCardProps) {
  return (
    <article
      style={{
        border: '1px solid var(--rule)',
        background: 'var(--cottage-cream)',
        borderRadius: 'var(--cottage-radius-lg)',
        padding: 'var(--cottage-space-md)',
        ...style,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1, color: 'var(--cottage-ink)' }}>
        {value}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--cottage-stone)' }}>
        {label}
      </div>
    </article>
  )
}
