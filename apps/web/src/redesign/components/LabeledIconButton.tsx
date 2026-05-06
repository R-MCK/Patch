import type { CSSProperties, ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  variant?: 'primary' | 'ghost'
  onClick?: () => void
  disabled?: boolean
  style?: CSSProperties
  type?: 'button' | 'submit' | 'reset'
}

const LabeledIconButton = ({
  icon,
  label,
  variant = 'primary',
  onClick,
  disabled,
  style,
  type = 'button',
}: Props) => {
  if (!label) {
    throw new Error('LabeledIconButton requires a non-empty label')
  }
  const className = variant === 'ghost' ? 'btn-ghost' : 'btn-primary'
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled} style={style}>
      {icon}
      {' '}
      {label}
    </button>
  )
}

export default LabeledIconButton
