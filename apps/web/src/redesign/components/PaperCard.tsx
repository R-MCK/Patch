import { createElement } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

type Hover = 'lift' | 'packet-lift' | 'none'

interface Props {
  as?: ElementType
  hover?: Hover
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

const PaperCard = ({ as = 'div', hover = 'none', children, className, style, onClick }: Props) => {
  const classes = ['card-paper']
  if (hover === 'lift') classes.push('lift')
  if (hover === 'packet-lift') classes.push('packet-lift')
  if (className) classes.push(className)

  return createElement(
    as,
    { className: classes.join(' '), style, onClick },
    children,
  )
}

export default PaperCard
