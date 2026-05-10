import type { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function GlassCard({ children, style, className }: GlassCardProps) {
  return (
    <section
      className={className}
      style={{
        borderRadius: 'var(--cottage-radius-xl)',
        border: '1px solid color-mix(in srgb, white 65%, var(--cottage-stone) 35%)',
        background: 'color-mix(in srgb, white 78%, var(--cottage-cream) 22%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 28px color-mix(in srgb, var(--cottage-ink) 10%, transparent)',
        ...style,
      }}
    >
      {children}
    </section>
  )
}
