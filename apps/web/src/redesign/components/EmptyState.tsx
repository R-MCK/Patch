import type { ReactNode } from 'react'

interface CTA {
  label: string
  onClick: () => void
}

interface Props {
  illustration: ReactNode
  title: ReactNode
  body: ReactNode
  cta?: CTA
}

const EmptyState = ({ illustration, title, body, cta }: Props) => {
  return (
    <div style={{
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 14,
    }}>
      <div className="illust-sway" style={{ color: 'var(--moss)' }}>{illustration}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-2)', margin: 0 }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', maxWidth: 360, lineHeight: 1.55, margin: 0 }}>{body}</p>
      {cta && (
        <button type="button" className="btn-primary" onClick={cta.onClick} style={{ marginTop: 8 }}>
          {cta.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
