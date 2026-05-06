import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PatchApiClient } from '@patch/api'
import {
  Monogram,
  SearchGlyph,
  SunGlyph,
  DropGlyph,
  LeafGlyph,
  PlusGlyph,
  SproutGlyph,
} from '../glyphs'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'
import PaperCard from '../components/PaperCard'
import EmptyState from '../components/EmptyState'
import { usePlantStore } from '@/stores/plantStore'
import type { Plant } from '@/types'
import type { CareTask } from '@patch/core'

// --- Static helpers ---

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const getAuthToken = () => {
  const stored = localStorage.getItem('auth-storage')
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored) as { state?: { token?: string | null } }
    return parsed.state?.token ?? null
  } catch {
    return null
  }
}
const almanacApiClient = new PatchApiClient({ baseUrl: apiBaseUrl, getAuthToken })

const monthAnchorId = (monthIndex: number) => `almanac-month-${monthIndex}`

interface PlantingEntry {
  kind: 'planting'
  date: Date
  plant: Plant
}

interface CareEntry {
  kind: 'care'
  date: Date
  plant: Plant
  taskType: string
}

type MonthEntry = PlantingEntry | CareEntry

// --- Page ---

export const DashboardAlmanac = () => {
  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)

  const [careTasks, setCareTasks] = useState<CareTask[]>([])
  const fetchedRef = useRef(false)

  useEffect(() => {
    fetchPlants().catch(() => { /* error captured into store */ })
  }, [fetchPlants])

  // Fetch care tasks for all plants once they're loaded.
  // TODO Phase 5 — replace per-plant fan-out with a single backend
  // /api/care/timeline?year= aggregation endpoint.
  useEffect(() => {
    if (fetchedRef.current) return
    if (plants.length === 0) return
    fetchedRef.current = true
    let cancelled = false
    Promise.all(
      plants.map((p) =>
        almanacApiClient.getPlantTasks(p.id).catch(() => [] as CareTask[]),
      ),
    ).then((results) => {
      if (cancelled) return
      setCareTasks(results.flat())
    })
    return () => {
      cancelled = true
    }
  }, [plants])

  const year = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const entriesByMonth = useMemo(() => {
    const buckets: MonthEntry[][] = Array.from({ length: 12 }, () => [])
    for (const p of plants) {
      const planted = p.plantingDate ?? p.plantedDate
      if (planted && planted.getFullYear() === year) {
        buckets[planted.getMonth()].push({ kind: 'planting', date: planted, plant: p })
      }
    }
    for (const t of careTasks) {
      if (!t.completedDate) continue
      if (t.completedDate.getFullYear() !== year) continue
      const plant = plants.find((p) => p.id === t.plantId)
      if (!plant) continue
      buckets[t.completedDate.getMonth()].push({
        kind: 'care',
        date: t.completedDate,
        plant,
        taskType: t.taskType,
      })
    }
    for (const list of buckets) {
      list.sort((a, b) => a.date.getTime() - b.date.getTime())
    }
    return buckets
  }, [plants, careTasks, year])

  const totalEntries = entriesByMonth.reduce((sum, list) => sum + list.length, 0)

  const handleMonthChipClick = (monthIndex: number) => {
    const el = document.getElementById(monthAnchorId(monthIndex))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AlmanacLayout header={<AlmanacHeader />}>
      <div style={{ padding: '32px 40px 56px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <HeroCard
          eyebrow={`Volume MMXXVI · ${year}`}
          title={
            <>
              The <em style={{ color: 'var(--terracotta)' }}>almanac.</em>
            </>
          }
          subtitle="A month-by-month account of what was planted, what was tended, and what the patch returned."
          titleSize={64}
        />

        <nav
          aria-label="Jump to month"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 6,
            padding: '12px 14px',
            border: '1px solid var(--rule)',
            background: 'var(--cream)',
            borderRadius: 4,
          }}
        >
          {MONTH_NAMES.map((m, i) => {
            const isCurrent = i === currentMonth
            const count = entriesByMonth[i].length
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleMonthChipClick(i)}
                style={{
                  border: isCurrent ? '1.5px solid var(--terracotta)' : '1px solid var(--rule)',
                  background: isCurrent ? 'var(--cream)' : 'transparent',
                  color: isCurrent ? 'var(--terracotta)' : 'var(--ink)',
                  padding: '8px 4px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  fontFamily: 'var(--font-slab)',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>{m}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: count > 0 ? 'var(--ink-soft)' : 'var(--ink-faint)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </nav>

        {totalEntries === 0 ? (
          <PaperCard style={{ padding: 0 }}>
            <EmptyState
              illustration={<SproutGlyph size={64} color="var(--moss)" />}
              title="Capture your first event"
              body="Add a plant or complete a care task and it will be inscribed here, month by month."
              cta={{
                label: 'Capture event',
                // TODO Phase 5 — wire to capture flow.
                onClick: () => { /* stub */ },
              }}
            />
          </PaperCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {entriesByMonth.map((entries, i) => {
              if (entries.length === 0) return null
              return (
                <section
                  key={i}
                  id={monthAnchorId(i)}
                  style={{ scrollMarginTop: 24 }}
                >
                  <SectionHeader
                    eyebrow={`№ ${String(i + 1).padStart(2, '0')}`}
                    title={
                      <>
                        {MONTH_LONG[i]}
                        {i === currentMonth && (
                          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--terracotta)', marginLeft: 12 }}>
                            ~ this month ~
                          </span>
                        )}
                      </>
                    }
                    trailing={`${entries.length} ENTR${entries.length === 1 ? 'Y' : 'IES'}`}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 14 }}>
                    {entries.map((e, j) => <AlmanacEntryCard key={j} entry={e} />)}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </AlmanacLayout>
  )
}

// --- Subcomponents ---

const AlmanacHeader = () => (
  <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Monogram letter="P" size={48} color="var(--forest)" />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--ink)' }}>Patch</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 4 }}>The Gardener's Almanac</div>
      </div>
    </div>
    <nav style={{ display: 'flex', gap: 28, fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 500 }}>
      <Link to="/" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Today</Link>
      <Link to="/plants" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Plants</Link>
      <Link to="/dashboard/almanac" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4, textDecoration: 'none' }}>Almanac</Link>
      <Link to="/dashboard/seasons" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Seasons</Link>
      <Link to="/design" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Designer</Link>
    </nav>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <button type="button" className="btn-ghost" aria-label="Search"><SearchGlyph size={14} /></button>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-soft)', border: '1.5px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--forest)' }}>R</div>
    </div>
  </header>
)

const renderCareIcon = (taskType: string, size = 12) => {
  if (taskType === 'Watering') return <DropGlyph size={size} />
  if (taskType === 'Harvesting') return <LeafGlyph size={size} />
  if (taskType === 'Transplanting') return <SproutGlyph size={size} />
  if (taskType === 'Fertilizing') return <SunGlyph size={size} />
  return <LeafGlyph size={size} />
}

interface EntryProps {
  entry: MonthEntry
}

const AlmanacEntryCard = ({ entry }: EntryProps) => {
  const dateLabel = entry.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  if (entry.kind === 'planting') {
    return (
      <PaperCard hover="lift" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--terracotta)', textTransform: 'uppercase' }}>
          <PlusGlyph size={12} />
          PLANTED · {dateLabel.toUpperCase()}
        </div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', margin: '6px 0 2px' }}>{entry.plant.name}</h4>
        {entry.plant.scientificName && (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faint)' }}>{entry.plant.scientificName}</div>
        )}
        {entry.plant.location && (
          <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{entry.plant.location}</div>
        )}
      </PaperCard>
    )
  }

  return (
    <PaperCard hover="lift" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--moss)', textTransform: 'uppercase' }}>
        {renderCareIcon(entry.taskType)}
        {entry.taskType.toUpperCase()} · {dateLabel.toUpperCase()}
      </div>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', margin: '6px 0 2px' }}>{entry.plant.name}</h4>
      {entry.plant.scientificName && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faint)' }}>{entry.plant.scientificName}</div>
      )}
    </PaperCard>
  )
}
