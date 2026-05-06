import type { CSSProperties, ReactNode } from 'react'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  trailing?: ReactNode
  titleSize?: number
  marginBottom?: number
  ruleMarginBottom?: number
  style?: CSSProperties
}

const SectionHeader = ({
  title,
  subtitle,
  eyebrow,
  trailing,
  titleSize = 28,
  marginBottom = 14,
  ruleMarginBottom,
  style,
}: Props) => {
  return (
    <div style={style}>
      {eyebrow !== undefined && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
          {eyebrow}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: titleSize, color: 'var(--ink-2)' }}>
          {title}
        </h2>
        {trailing !== undefined && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
            {trailing}
          </span>
        )}
      </div>
      <hr className="dotted-rule" style={ruleMarginBottom !== undefined ? { marginBottom: ruleMarginBottom } : undefined} />
      {subtitle !== undefined && (
        <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
