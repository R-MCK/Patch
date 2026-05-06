import type { CSSProperties, ReactNode } from 'react'
import PaperBackdrop from './PaperBackdrop'

interface Props {
  header?: ReactNode
  sidebar?: ReactNode
  variant?: 'paper' | 'cream'
  style?: CSSProperties
  children: ReactNode
}

const AlmanacLayout = ({ header, sidebar, variant, style, children }: Props) => {
  if (sidebar) {
    return (
      <PaperBackdrop variant={variant} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', ...style }}>
        {sidebar}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {header}
          {children}
        </div>
      </PaperBackdrop>
    )
  }
  return (
    <PaperBackdrop variant={variant} style={style}>
      {header}
      {children}
    </PaperBackdrop>
  )
}

export default AlmanacLayout
