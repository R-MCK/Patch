interface Props {
  count?: number
}

const OverdueBadge = ({ count }: Props) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        background: 'var(--ink-overdue-soft)',
        color: 'var(--ink-overdue)',
        border: '1px solid var(--ink-overdue)',
        borderRadius: 999,
        fontFamily: 'var(--font-slab)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      Overdue{count !== undefined ? ` · ${count}` : ''}
    </span>
  )
}

export default OverdueBadge
