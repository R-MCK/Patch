import type { ReactNode } from 'react'

interface Props {
  temp: ReactNode
  condition: ReactNode
  icon?: ReactNode
}

const WeatherChip = ({ temp, condition, icon }: Props) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        background: 'var(--cream)',
        border: '1px solid var(--sky)',
        borderRadius: 999,
        color: 'var(--sky)',
      }}
    >
      {icon && <span style={{ display: 'inline-flex', color: 'var(--sky)' }}>{icon}</span>}
      <span className="numeral" style={{ fontSize: 18, lineHeight: 1, color: 'var(--terracotta)' }}>{temp}</span>
      <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, color: 'var(--ink-soft)' }}>{condition}</span>
    </span>
  )
}

export default WeatherChip
