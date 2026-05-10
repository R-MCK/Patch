import type { CSSProperties, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import CottageBackdrop from '../components/CottageBackdrop'

interface CottageLayoutProps {
  header?: ReactNode
  sidebar?: ReactNode
  children?: ReactNode
  style?: CSSProperties
}

export default function CottageLayout({ header, sidebar, children, style }: CottageLayoutProps) {
  const body = children ?? <Outlet />

  if (sidebar) {
    return (
      <CottageBackdrop style={{ display: 'grid', gridTemplateColumns: '72px 1fr', ...style }}>
        {sidebar}
        <div style={{ minWidth: 0 }}>
          {header}
          {body}
        </div>
      </CottageBackdrop>
    )
  }

  return (
    <CottageBackdrop style={style}>
      {header}
      {body}
    </CottageBackdrop>
  )
}
