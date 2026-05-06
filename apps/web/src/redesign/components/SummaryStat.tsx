import type { CSSProperties, ReactNode } from 'react'

interface Props {
  label: ReactNode
  value: ReactNode
  caption?: ReactNode
  valueColor?: string
  style?: CSSProperties
}

const SummaryStat = ({ label, value, caption, valueColor = 'var(--terracotta)', style }: Props) => {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="numeral" style={{ fontSize: 36, lineHeight: 0.9, color: valueColor }}>{value}</span>
        <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{label}</span>
      </div>
      {caption !== undefined && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 4, letterSpacing: '0.06em' }}>{caption}</span>
      )}
    </div>
  )
}

export default SummaryStat
