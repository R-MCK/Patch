import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { isOverdue, isDueToday, type CareTask, type Plant } from '@patch/core'

import { Monogram, SearchGlyph, PlusGlyph, SunGlyph, DropGlyph, CalendarGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import LabeledIconButton from '../components/LabeledIconButton'
import SummaryStat from '../components/SummaryStat'
import UrgencyBadge from '../components/UrgencyBadge'
import EmptyState from '../components/EmptyState'

import { usePlantStore } from '@/stores/plantStore'
import { useGardenStore } from '@/stores/gardenStore'
import { api } from '@/lib/api'

// --- helpers ----------------------------------------------------------------

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
  const hit = ILLUST_KINDS.find((k) => haystack.includes(k))
  return hit ?? 'sunflower'
}

const colorForPlant = (p: Plant): string => {
  let hash = 0
  for (const ch of p.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

const familyTag = (p: Plant): string => {
  const sci = p.scientificName ?? p.species ?? ''
  const first = sci.split(/\s+/)[0]
  return (first || p.name.split(/\s+/)[0] || 'PLANT').toUpperCase()
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
}

const computeUrgency = (tasks: CareTask[], now = new Date()): UrgencyInfo => {
  const open = tasks.filter((t) => !t.completedDate)
  if (open.length === 0) return { level: 'none' }
  const sorted = [...open].sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  const next = sorted[0]
  if (isOverdue(next, now)) {
    const daysOverdue = Math.max(1, Math.floor((now.getTime() - next.scheduledDate.getTime()) / 86_400_000))
    return { level: 'overdue', daysOverdue, nextTaskDate: next.scheduledDate }
  }
  if (isDueToday(next, now)) return { level: 'due-today', nextTaskDate: next.scheduledDate }
  const sevenDays = 7 * 86_400_000
  if (next.scheduledDate.getTime() - now.getTime() < sevenDays) {
    return { level: 'soon', nextTaskDate: next.scheduledDate }
  }
  return { level: 'none', nextTaskDate: next.scheduledDate }
}

// --- card -------------------------------------------------------------------

interface CardProps {
  plant: Plant
  gardenName?: string
  urgency: UrgencyInfo
}

const SeedPacket = ({ plant, gardenName, urgency }: CardProps) => {
  const color = colorForPlant(plant)
  const illust = inferIllust(plant)
  const tag = familyTag(plant)
  const ageDays = daysSince(plant.plantedDate ?? plant.plantingDate)
  const water = plant.wateringFrequency ?? 3
  const sun = plant.sunRequirement ?? 'full'
  const stage = plant.growthStage ?? 'seedling'

  return (
    <Link to={`/plants/${encodeURIComponent(plant.id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article className="packet-lift" style={{
        background: 'var(--cream)',
        border: '1.5px solid var(--ink)',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '2px 3px 0 var(--ink-soft)',
        cursor: 'pointer',
      }}>
        <div style={{ background: color, color: 'var(--cream)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em' }}>
          <span>{(gardenName ?? plant.location ?? 'PATCH').toUpperCase()}</span>
          <span>{tag}</span>
        </div>

        <div style={{ padding: '14px 14px 6px', display: 'flex', justifyContent: 'center', background: 'var(--paper)', borderBottom: '1px solid var(--rule)' }}>
          <PlantArt kind={illust} size={110} color={color} />
        </div>

        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant.name}</div>
              {plant.scientificName && (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faint)', marginTop: 2 }}>{plant.scientificName}</div>
              )}
            </div>
            {urgency.level !== 'none' && (
              <UrgencyBadge level={urgency.level} daysOverdue={urgency.daysOverdue} />
            )}
          </div>

          {gardenName && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', border: '1px solid var(--rule)', borderRadius: 999, fontFamily: 'var(--font-slab)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink-soft)', background: 'var(--paper-2)' }}>
              {gardenName}
            </div>
          )}

          <hr className="dotted-rule" style={{ margin: '10px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>SUN</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <SunGlyph size={14} color={sun === 'full' ? 'var(--honey)' : 'var(--ink-soft)'} />
                <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>{sun === 'full' ? 'Full' : sun === 'partial' ? 'Part' : 'Shade'}</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>WATER</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <DropGlyph size={14} color="var(--sky)" />
                <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>{water}d</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>AGE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <CalendarGlyph size={12} color="var(--ink-soft)" />
                <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>{ageDays ?? '—'}{ageDays !== null ? 'd' : ''}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '6px 8px', background: color, color: 'var(--cream)', borderRadius: 2, fontFamily: 'var(--font-slab)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>STAGE</span>
            <span>{stage}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// --- page -------------------------------------------------------------------

export const PlantTrackerPackets = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gardenFilter = searchParams.get('garden') ?? ''

  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)
  const isLoading = usePlantStore((s) => s.isLoading)

  const gardens = useGardenStore((s) => s.gardens)
  const fetchGardens = useGardenStore((s) => s.fetchGardens)

  const [tasksByPlant, setTasksByPlant] = useState<Record<string, CareTask[]>>({})

  useEffect(() => {
    void fetchPlants()
    void fetchGardens()
  }, [fetchPlants, fetchGardens])

  // Fetch tasks for each plant in parallel after plants land. Best-effort —
  // a single failed fetch shouldn't blank the whole grid.
  useEffect(() => {
    if (plants.length === 0) return
    let cancelled = false
    void (async () => {
      const entries = await Promise.all(
        plants.map(async (p) => {
          try {
            const raw = await api.getTasks(p.id)
            const mapped = Array.isArray(raw) ? raw : []
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

  const visiblePlants = useMemo(
    () => gardenFilter ? plants.filter((plant) => plant.gardenId === gardenFilter) : plants,
    [plants, gardenFilter],
  )

  const urgencyByPlant = useMemo(() => {
    const map = new Map<string, UrgencyInfo>()
    const now = new Date()
    for (const p of visiblePlants) {
      map.set(p.id, computeUrgency(tasksByPlant[p.id] ?? [], now))
    }
    return map
  }, [visiblePlants, tasksByPlant])

  const overdueCount = useMemo(
    () => visiblePlants.filter((p) => urgencyByPlant.get(p.id)?.level === 'overdue').length,
    [visiblePlants, urgencyByPlant],
  )
  const needWaterCount = useMemo(
    () => visiblePlants.filter((p) => {
      const lvl = urgencyByPlant.get(p.id)?.level
      return lvl === 'overdue' || lvl === 'due-today'
    }).length,
    [visiblePlants, urgencyByPlant],
  )

  const filters = ['All plants', ...gardens.slice(0, 6).map((g) => g.name)]

  return (
    <AlmanacLayout header={
      <header style={{ padding: '20px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Monogram letter="P" size={38} color="var(--forest)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Patch</div>
        </div>
        <nav style={{ display: 'flex', gap: 26, fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <a href="/today" style={{ color: 'var(--ink-soft)' }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}>Plants</a>
          <a href="/dashboard/map" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/dashboard/almanac" style={{ color: 'var(--ink-soft)' }}>Almanac</a>
          <a href="/design" style={{ color: 'var(--ink-soft)' }}>Designer</a>
        </nav>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--terracotta)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16 }}>R</div>
      </header>
    }>
      <section style={{ padding: '36px 36px 0' }}>
        <HeroCard
          eyebrow={`The Patch · ${visiblePlants.length} in care · ${gardens.length} ${gardens.length === 1 ? 'garden' : 'gardens'}`}
          title="The seed drawer"
          subtitle="Every plant on the patch, kept like a vintage packet on the shelf. Click one to open its long story."
          trailing={<>
            <Link to="/plants/ledger" className="btn-ghost" style={{ textDecoration: 'none' }}>Ledger view</Link>
            <LabeledIconButton variant="ghost" icon={<SearchGlyph size={14} />} label="Search" />
            <LabeledIconButton variant="primary" icon={<PlusGlyph size={14} />} label="New plant" onClick={() => navigate('/capture')} />
          </>}
        />

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--rule)', background: 'var(--cream)' }}>
          <SummaryStat label="Total in care" value={visiblePlants.length} caption={gardenFilter ? 'filtered garden' : 'all beds & pots'} valueColor="var(--ink-2)" style={{ borderRight: '1px solid var(--rule)' }} />
          <SummaryStat label="Overdue" value={overdueCount} caption={overdueCount === 0 ? 'all caught up' : 'past their care date'} valueColor={overdueCount > 0 ? 'var(--ink-overdue)' : 'var(--moss)'} style={{ borderRight: '1px solid var(--rule)' }} />
          <SummaryStat label="Need water" value={needWaterCount} caption="due today or earlier" valueColor="var(--sky)" />
        </div>
      </section>

      <div style={{ padding: '24px 36px 18px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--rule)', overflowX: 'auto' }}>
        {filters.map((f, i) => (
          <button key={f} style={{
            padding: '7px 14px',
            border: '1.5px solid var(--ink)',
            background: i === 0 ? 'var(--ink)' : 'transparent',
            color: i === 0 ? 'var(--cream)' : 'var(--ink)',
            fontFamily: 'var(--font-slab)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: 999,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>SORT · BY GARDEN</span>
      </div>

      {visiblePlants.length === 0 && !isLoading ? (
        <section style={{ padding: '60px 36px' }}>
          <EmptyState
            illustration={<PlantArt kind="sunflower" size={120} color="var(--moss)" />}
            title="Plant your first seed"
            body="Your seed drawer is empty. Add a plant to start its long story — every watering, every flower, every harvest."
            cta={{ label: 'New plant', onClick: () => navigate('/capture') }}
          />
        </section>
      ) : (
        <section style={{ padding: '28px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {visiblePlants.map((p) => (
            <SeedPacket
              key={p.id}
              plant={p}
              gardenName={p.gardenId ? gardenNameById.get(p.gardenId) : undefined}
              urgency={urgencyByPlant.get(p.id) ?? { level: 'none' }}
            />
          ))}
        </section>
      )}
    </AlmanacLayout>
  )
}
