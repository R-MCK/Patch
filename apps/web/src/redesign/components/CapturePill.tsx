import type { ReactNode } from 'react'

interface Props {
  label?: ReactNode
  icon?: ReactNode
  onClick?: () => void
}

const CapturePill = ({ label = 'Capture', icon, onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="stamp"
      style={{
        position: 'fixed',
        right: 32,
        bottom: 32,
        zIndex: 50,
        cursor: 'pointer',
        background: 'var(--cream)',
        color: 'var(--terracotta)',
        padding: '10px 18px',
        fontSize: 12,
        boxShadow: '2px 4px 0 var(--ink-soft)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export default CapturePill
