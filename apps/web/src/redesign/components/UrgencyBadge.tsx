type Level = 'overdue' | 'due-today' | 'soon' | 'none'

interface Props {
  level: Level
  daysOverdue?: number
}

const palette: Record<Level, { bg: string; fg: string; border: string; label: (n?: number) => string } | null> = {
  overdue: {
    bg: 'var(--ink-overdue-soft)',
    fg: 'var(--ink-overdue)',
    border: 'var(--ink-overdue)',
    label: (n) => (n && n > 0 ? `Overdue · ${n}d` : 'Overdue'),
  },
  'due-today': {
    bg: 'var(--cream)',
    fg: 'var(--terracotta)',
    border: 'var(--terracotta)',
    label: () => 'Due today',
  },
  soon: {
    bg: 'var(--cream)',
    fg: 'var(--ink-soft)',
    border: 'var(--rule)',
    label: () => 'Soon',
  },
  none: null,
}

const UrgencyBadge = ({ level, daysOverdue }: Props) => {
  const tone = palette[level]
  if (!tone) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        background: tone.bg,
        color: tone.fg,
        border: `1px solid ${tone.border}`,
        borderRadius: 999,
        fontFamily: 'var(--font-slab)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {tone.label(daysOverdue)}
    </span>
  )
}

export default UrgencyBadge
