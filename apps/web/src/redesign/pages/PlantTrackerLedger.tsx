import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mapDbCareTaskToCareTask, isOverdue, isDueToday, type CareTask, type DbCareTask, type Plant } from '@patch/core'

import { Monogram, SearchGlyph, PlusGlyph, SunGlyph, ChevronRightGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'
import AlmanacLayout from '../components/AlmanacLayout'
import LabeledIconButton from '../components/LabeledIconButton'
import UrgencyBadge from '../components/UrgencyBadge'
import EmptyState from '../components/EmptyState'

import { usePlantStore } from '@/stores/plantStore'
import { useGardenStore } from '@/stores/gardenStore'
import { api } from '@/lib/api'

// --- helpers (kept local — Phase 2 scope; harmonize across pages later) -----

type IllustKind = 'tomato' | 'pea' | 'basil' | 'chard' | 'lavender' | 'kale' | 'strawberry' | 'beet' | 'sunflower' | 'rosemary' | 'mint'

const ILLUST_KINDS: IllustKind[] = [
  'tomato', 'pea', 'basil', 'chard', 'lavender', 'kale', 'strawberry', 'beet', 'sunflower', 'rosemary', 'mint',
]

const PALETTE = [
  'var(--terracotta)', 'var(--berry)', 'var(--moss)', 'var(--rust)',
  'var(--plum)', 'var(--forest)', 'var(--honey)', 'var(--sky)',
]

const inferIllust = (p: Plant): IllustKind => {
  const haystack = `${p.name} ${p.species ?? ''} ${p.scientificName ?? ''}`.toLowerCase()
  return ILLUST_KINDS.find((k) => haystack.includes(k)) ?? 'sunflower'
}

const colorForPlant = (p: Plant): string => {
  let hash = 0
  for (const ch of p.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

const daysSince = (date?: Date): number | null => {
  if (!date) return null
  const ms = Date.now() - date.getTime()
  if (Number.isNaN(ms) || ms < 0) return 0
  return Math.floor(ms / 86_400_000)
}

interface UrgencyInfo {
  level: 'overdue' | 'due-today' | 'soon' | 'none'
  daysOverdue?: number
  nextTaskDate?: Date
  nextTaskLabel?: string
}

const computeUrgency = (tasks: CareTask[], now = new Date()): UrgencyInfo => {
  const open = tasks.filter((t) => !t.completedDate)
  if (open.length === 0) return { level: 'none' }
  const sorted = [...open].sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  const next = sorted[0]
  const label = next.taskType
  if (isOverdue(next, now)) {
    const daysOverdue = Math.max(1, Math.floor((now.getTime() - next.scheduledDate.getTime()) / 86_400_000))
    return { level: 'overdue', daysOverdue, nextTaskDate: next.scheduledDate, nextTaskLabel: label }
  }
  if (isDueToday(next, now)) return { level: 'due-today', nextTaskDate: next.scheduledDate, nextTaskLabel: label }
  const sevenDays = 7 * 86_400_000
  if (next.scheduledDate.getTime() - now.getTime() < sevenDays) {
    return { level: 'soon', nextTaskDate: next.scheduledDate, nextTaskLabel: label }
  }
  return { level: 'none', nextTaskDate: next.scheduledDate, nextTaskLabel: label }
}

const HealthDot = ({ h }: { h?: string }) => {
  const map: Record<string, string> = {
    excellent: 'var(--moss)', good: 'var(--sage)', fair: 'var(--honey)', poor: 'var(--terracotta)', critical: 'var(--ink-overdue)',
  }
  const key = (h ?? 'good').toLowerCase()
  const color = map[key] ?? 'var(--sage)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 2px ${color}33` }} />
      {key}
    </span>
  )
}

// --- sort -------------------------------------------------------------------

type SortKey = 'name' | 'garden' | 'planted' | 'lastWatered' | 'nextTask'
type SortDir = 'asc' | 'desc'

interface Row {
  plant: Plant
  gardenName: string
  illust: IllustKind
  color: string
  ageDays: number | null
  urgency: UrgencyInfo
  lastWateredAt?: Date
}

const compareRows = (a: Row, b: Row, key: SortKey): number => {
  switch (key) {
    case 'name': return a.plant.name.localeCompare(b.plant.name)
    case 'garden': return a.gardenName.localeCompare(b.gardenName)
    case 'planted': {
      const av = a.plant.plantedDate?.getTime() ?? 0
      const bv = b.plant.plantedDate?.getTime() ?? 0
      return av - bv
    }
    case 'lastWatered': {
      const av = a.lastWateredAt?.getTime() ?? 0
      const bv = b.lastWateredAt?.getTime() ?? 0
      return av - bv
    }
    case 'nextTask': {
      const av = a.urgency.nextTaskDate?.getTime() ?? Number.POSITIVE_INFINITY
      const bv = b.urgency.nextTaskDate?.getTime() ?? Number.POSITIVE_INFINITY
      return av - bv
    }
  }
}

// --- page -------------------------------------------------------------------

export const PlantTrackerLedger = () => {
  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)
  const isLoading = usePlantStore((s) => s.isLoading)

  const gardens = useGardenStore((s) => s.gardens)
  const fetchGardens = useGardenStore((s) => s.fetchGardens)

  const [tasksByPlant, setTasksByPlant] = useState<Record<string, CareTask[]>>({})
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  useEffect(() => {
    void fetchPlants()
    void fetchGardens()
  }, [fetchPlants, fetchGardens])

  useEffect(() => {
    if (plants.length === 0) return
    let cancelled = false
    void (async () => {
      const entries = await Promise.all(
        plants.map(async (p) => {
          try {
            const raw = (await api.getTasks(p.id)) as DbCareTask[]
            const mapped = Array.isArray(raw) ? raw.map(mapDbCareTaskToCareTask) : []
            return [p.id, mapped] as const
          } catch {
            return [p.id, [] as CareTask[]] as const
          }
        }),
      )
      if (cancelled) return
      const next: Record<string, CareTask[]> = {}
      for (const [id, list] of entries) next[id] = list
      setTasksByPlant(next)
    })()
    return () => { cancelled = true }
  }, [plants])

  const gardenNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const g of gardens) map.set(g.id, g.name)
    return map
  }, [gardens])

  const rows = useMemo<Row[]>(() => {
    const now = new Date()
    return plants.map((p) => {
      const tasks = tasksByPlant[p.id] ?? []
      const completedWaterings = tasks
        .filter((t) => t.taskType === 'Watering' && t.completedDate)
        .sort((a, b) => (b.completedDate!.getTime()) - (a.completedDate!.getTime()))
      return {
        plant: p,
        gardenName: (p.gardenId && gardenNameById.get(p.gardenId)) || p.location || '—',
        illust: inferIllust(p),
        color: colorForPlant(p),
        ageDays: daysSince(p.plantedDate ?? p.plantingDate),
        urgency: computeUrgency(tasks, now),
        lastWateredAt: completedWaterings[0]?.completedDate,
      }
    })
  }, [plants, tasksByPlant, gardenNameById])

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => compareRows(a, b, sortKey))
    return sortDir === 'asc' ? sorted : sorted.reverse()
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortIndicator = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const headers: { l: string; w: string; sort?: SortKey }[] = [
    { l: '№', w: '40px' },
    { l: 'Plant', w: 'auto', sort: 'name' },
    { l: 'Garden', w: '140px', sort: 'garden' },
    { l: 'Stage', w: '110px' },
    { l: 'Sun', w: '60px' },
    { l: 'Planted', w: '90px', sort: 'planted' },
    { l: 'Age', w: '60px' },
    { l: 'Health', w: '110px' },
    { l: 'Last watered', w: '120px', sort: 'lastWatered' },
    { l: 'Status', w: '120px' },
    { l: 'Next task', w: '160px', sort: 'nextTask' },
  ]

  return (
    <AlmanacLayout variant="cream" header={
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Monogram letter="P" size={38} color="var(--forest)" />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Patch · Field Ledger</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>VOL II · NO. 19 · MMXXVI</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 26, fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <a href="/" style={{ color: 'var(--ink-soft)' }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}>Plants</a>
          <a href="/gardens" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/wiki" style={{ color: 'var(--ink-soft)' }}>Wiki</a>
          <a href="/design" style={{ color: 'var(--ink-soft)' }}>Designer</a>
        </nav>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--terracotta)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16 }}>R</div>
      </header>
    }>
      <section style={{ padding: '32px 40px 18px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 24, borderBottom: '1px solid var(--rule)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>An Index of Living Things</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 0.95, marginTop: 4, color: 'var(--ink-2)' }}>
            The Plant Ledger
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--rule)', borderRight: '1px solid var(--rule)', padding: '0 28px' }}>
          <span className="numeral" style={{ fontSize: 64, lineHeight: 1, color: 'var(--terracotta)' }}>{plants.length.toString().padStart(2, '0')}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>ENTRIES IN BOOK</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8, lineHeight: 1.5 }}>Browse, search, and tend. Click any row to open the long story for that plant.</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Link to="/plants" className="btn-ghost" style={{ textDecoration: 'none' }}>Packet view</Link>
            <LabeledIconButton variant="ghost" icon={<SearchGlyph size={12} />} label="Search" />
            <LabeledIconButton variant="primary" icon={<PlusGlyph size={12} />} label="New entry" />
          </div>
        </div>
      </section>

      <div style={{ padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--rule)', background: 'var(--paper-2)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['All', 'Vegetables', 'Herbs', 'Fruit', 'Flowers'].map((f, i) => (
            <button key={f} style={{
              padding: '5px 12px',
              fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              border: 'none', cursor: 'pointer',
              background: i === 0 ? 'var(--ink)' : 'transparent',
              color: i === 0 ? 'var(--cream)' : 'var(--ink-soft)',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
          <span>VIEW · LEDGER</span>
          <span style={{ color: 'var(--rule)' }}>·</span>
          <span>SORT · {sortKey.toUpperCase()} · {sortDir.toUpperCase()}</span>
        </div>
      </div>

      {plants.length === 0 && !isLoading ? (
        <section style={{ padding: '60px 40px' }}>
          <EmptyState
            illustration={<PlantArt kind="sunflower" size={120} color="var(--moss)" />}
            title="No entries in the book yet"
            body="Once you add a plant, it will be catalogued here with its bed, age, and care log."
            cta={{ label: 'New plant', onClick: () => { /* TODO */ } }}
          />
        </section>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr style={{ background: 'var(--ink)', color: 'var(--cream)', position: 'sticky', top: 0, zIndex: 1 }}>
              {headers.map((h, i) => {
                const sortable = h.sort !== undefined
                return (
                  <th
                    key={i}
                    onClick={sortable ? () => toggleSort(h.sort!) : undefined}
                    style={{
                      width: h.w,
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      cursor: sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: 'sticky',
                      top: 0,
                      background: 'var(--ink)',
                    }}
                  >
                    {h.l}{sortable ? sortIndicator(h.sort!) : ''}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r, i) => (
              <tr key={r.plant.id} className="row-hover" style={{
                background: i % 2 === 0 ? 'transparent' : 'var(--paper-2)',
                borderBottom: '1px solid var(--rule)',
                cursor: 'pointer',
              }} onClick={() => { window.location.href = `/plants/${encodeURIComponent(r.plant.id)}` }}>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-display)', fontSize: 16, fontStyle: 'italic', color: 'var(--terracotta)' }}>{(i+1).toString().padStart(2, '0')}</td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 4, background: 'var(--cream)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PlantArt kind={r.illust} size={36} color={r.color} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.1 }}>{r.plant.name}</div>
                      {r.plant.scientificName && (
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontStyle: 'italic', color: 'var(--ink-faint)', marginTop: 2 }}>{r.plant.scientificName}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', border: '1px solid var(--rule)', borderRadius: 999, fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', background: 'var(--paper-2)' }}>{r.gardenName}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: r.color, borderBottom: `2px solid ${r.color}`, paddingBottom: 2 }}>{r.plant.growthStage ?? '—'}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <SunGlyph size={16} color={r.plant.sunRequirement === 'full' ? 'var(--honey)' : 'var(--ink-soft)'} />
                </td>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                  {r.plant.plantedDate ? r.plant.plantedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.ageDays !== null ? `${r.ageDays}d` : '—'}</td>
                <td style={{ padding: '14px 12px' }}><HealthDot h={r.plant.healthStatus} /></td>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sky)' }}>
                  {r.lastWateredAt ? r.lastWateredAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  {r.urgency.level !== 'none' ? <UrgencyBadge level={r.urgency.level} daysOverdue={r.urgency.daysOverdue} /> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>—</span>}
                </td>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, color: 'var(--terracotta)', letterSpacing: '0.04em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{r.urgency.nextTaskLabel ?? 'No task scheduled'}</span>
                    <ChevronRightGlyph size={14} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
        <span>Showing {sortedRows.length} of {plants.length}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ padding: '6px 12px', border: '1px solid var(--ink)', background: 'var(--cream)', cursor: 'pointer', fontFamily: 'var(--font-slab)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>‹ Prev</button>
          <button style={{ padding: '6px 12px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--cream)', cursor: 'pointer', fontFamily: 'var(--font-slab)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next ›</button>
        </div>
        <span>Tended by R. (you)</span>
      </footer>
    </AlmanacLayout>
  )
}
