import type { CSSProperties, ReactNode } from 'react'

type Variant = 'paper' | 'cream'

interface Props {
  variant?: Variant
  children: ReactNode
  style?: CSSProperties
}

const PaperBackdrop = ({ variant = 'paper', children, style }: Props) => {
  const className = variant === 'cream' ? 'paper-bg-cream' : 'paper-bg'
  return (
    <div
      className={className}
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default PaperBackdrop
