import type { CSSProperties, ReactNode } from 'react'

interface CottageBackdropProps {
  children: ReactNode
  style?: CSSProperties
}

export default function CottageBackdrop({ children, style }: CottageBackdropProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 800px at 15% 8%, color-mix(in srgb, var(--cottage-rust) 10%, transparent), transparent 60%), radial-gradient(900px 700px at 84% 80%, color-mix(in srgb, var(--cottage-moss) 12%, transparent), transparent 65%), linear-gradient(165deg, var(--cottage-bg-1) 0%, var(--cottage-bg-2) 50%, var(--cottage-bg-3) 100%)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
