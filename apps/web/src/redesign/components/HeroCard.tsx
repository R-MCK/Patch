import type { CSSProperties, ReactNode } from 'react'

interface Stat {
  label: string
  value: ReactNode
}

type Accent = 'drop-cap' | 'hand-underline' | 'book-frame' | 'none'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  stats?: Stat[]
  trailing?: ReactNode
  accent?: Accent
  titleSize?: number
  style?: CSSProperties
}

const HeroCard = ({
  title,
  subtitle,
  eyebrow,
  stats,
  trailing,
  accent = 'none',
  titleSize = 64,
  style,
}: Props) => {
  const titleClasses: string[] = []
  if (accent === 'drop-cap') titleClasses.push('drop-cap')
  if (accent === 'hand-underline') titleClasses.push('hand-underline')

  const wrapperClass = accent === 'book-frame' ? 'book-frame' : undefined

  return (
    <div className={wrapperClass} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, ...style }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow !== undefined && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            {eyebrow}
          </div>
        )}
        <h1
          className={titleClasses.join(' ') || undefined}
          style={{ fontFamily: 'var(--font-display)', fontSize: titleSize, lineHeight: 1, marginTop: 6, color: 'var(--ink-2)' }}
        >
          {title}
        </h1>
        {subtitle !== undefined && (
          <p style={{ fontFamily: 'var(--font-slab)', fontSize: 15, color: 'var(--ink-soft)', marginTop: 8, maxWidth: 540, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        {stats && stats.length > 0 && (
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 0, border: '1px solid var(--rule)', background: 'var(--cream)' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRight: i < stats.length - 1 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>{s.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 14, fontWeight: 600, marginTop: 4, color: 'var(--ink)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {trailing !== undefined && (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{trailing}</div>
      )}
    </div>
  )
}

export default HeroCard
