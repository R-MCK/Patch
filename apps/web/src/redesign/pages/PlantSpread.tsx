import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mapDbCareTaskToCareTask, isOverdue, isDueToday, type CareTask, type DbCareTask, type Plant } from '@patch/core'

import { ChevronLeftGlyph, PencilGlyph, PlusGlyph, DropGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'
import LabeledIconButton from '../components/LabeledIconButton'
import UrgencyBadge from '../components/UrgencyBadge'

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

const formatDate = (d?: Date): string => d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

interface UrgencyInfo {
  level: 'overdue' | 'due-today' | 'soon' | 'none'
  daysOverdue?: number
}

const taskUrgency = (t: CareTask, now = new Date()): UrgencyInfo => {
  if (t.completedDate) return { level: 'none' }
  if (isOverdue(t, now)) {
    const daysOverdue = Math.max(1, Math.floor((now.getTime() - t.scheduledDate.getTime()) / 86_400_000))
    return { level: 'overdue', daysOverdue }
  }
  if (isDueToday(t, now)) return { level: 'due-today' }
  const sevenDays = 7 * 86_400_000
  if (t.scheduledDate.getTime() - now.getTime() < sevenDays) return { level: 'soon' }
  return { level: 'none' }
}

// --- page -------------------------------------------------------------------

export const PlantSpread = () => {
  const { id } = useParams()
  const plantId = id ?? ''

  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)
  const isLoading = usePlantStore((s) => s.isLoading)
  const waterPlant = api.waterPlant

  const gardens = useGardenStore((s) => s.gardens)
  const fetchGardens = useGardenStore((s) => s.fetchGardens)

  const [tasks, setTasks] = useState<CareTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)

  useEffect(() => {
    if (plants.length === 0) void fetchPlants()
    void fetchGardens()
  }, [plants.length, fetchPlants, fetchGardens])

  useEffect(() => {
    if (!plantId) return
    let cancelled = false
    void (async () => {
      try {
        setTasksLoading(true)
        const raw = (await api.getTasks(plantId)) as DbCareTask[]
        if (cancelled) return
        const mapped = Array.isArray(raw) ? raw.map(mapDbCareTaskToCareTask) : []
        setTasks(mapped)
      } catch {
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setTasksLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [plantId])

  const plant = useMemo(() => plants.find((p) => p.id === plantId), [plants, plantId])
  const garden = useMemo(() => plant?.gardenId ? gardens.find((g) => g.id === plant.gardenId) : undefined, [plant, gardens])

  // Loading / not-found shells
  if (!plant) {
    return (
      <AlmanacLayout header={
        <header style={{ padding: '14px 36px', borderBottom: '1px solid var(--rule)' }}>
          <Link to="/plants" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>
            <ChevronLeftGlyph size={14} /> ALL PLANTS
          </Link>
        </header>
      }>
        <section style={{ padding: '60px 36px', textAlign: 'center' }}>
          {isLoading ? (
            <div style={{ fontFamily: 'var(--font-slab)', color: 'var(--ink-soft)' }}>Opening the spread…</div>
          ) : (
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--ink-2)' }}>No such entry</h1>
              <p style={{ fontFamily: 'var(--font-slab)', fontSize: 14, color: 'var(--ink-soft)', marginTop: 12 }}>
                We couldn't find a plant with id <code>{plantId}</code>. <Link to="/plants" style={{ color: 'var(--terracotta)' }}>Back to the seed drawer →</Link>
              </p>
            </div>
          )}
        </section>
      </AlmanacLayout>
    )
  }

  const color = colorForPlant(plant)
  const illust = inferIllust(plant)
  const ageDays = daysSince(plant.plantedDate ?? plant.plantingDate)

  const sortedTasks = [...tasks].sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
  const lastWatering = tasks
    .filter((t) => t.taskType === 'Watering' && t.completedDate)
    .sort((a, b) => b.completedDate!.getTime() - a.completedDate!.getTime())[0]

  const heroStats = [
    { label: 'Garden', value: garden?.name ?? plant.location ?? '—' },
    { label: 'Planted', value: formatDate(plant.plantedDate ?? plant.plantingDate) },
    { label: 'Age', value: ageDays !== null ? `${ageDays} d` : '—' },
    { label: 'Stage', value: plant.growthStage ?? '—' },
  ]

  return (
    <AlmanacLayout header={
      <header style={{ padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
        <Link to="/plants" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>
          <ChevronLeftGlyph size={14} /> ALL PLANTS · {(garden?.name ?? plant.location ?? 'Patch').toUpperCase()} · {plant.name.toUpperCase()}
        </Link>
        <nav style={{ display: 'flex', gap: 24, fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <a href="/" style={{ color: 'var(--ink-soft)' }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}>Plants</a>
          <a href="/gardens" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/wiki" style={{ color: 'var(--ink-soft)' }}>Wiki</a>
        </nav>
      </header>
    }>
      <section style={{ padding: '36px 36px 0', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, borderBottom: '1px solid var(--rule)', paddingBottom: 36 }}>
        <div>
          <HeroCard
            accent="drop-cap"
            eyebrow={`Entry · ${plant.name.toUpperCase()}`}
            title={plant.name}
            subtitle={plant.scientificName ?? plant.species ?? undefined}
            stats={heroStats}
          />
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <LabeledIconButton variant="ghost" icon={<PencilGlyph size={12} />} label="Edit plant" />
            <LabeledIconButton
              variant="primary"
              icon={<DropGlyph size={12} />}
              label="Mark watered"
              onClick={() => { void waterPlant(plant.id).catch(() => {/* TODO surface errors */}) }}
            />
            <LabeledIconButton variant="ghost" icon={<PlusGlyph size={12} />} label="Log entry" />
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, background: 'var(--cream)', border: '1px solid var(--rule)' }}>
          <div className="botanical-placeholder" style={{ position: 'absolute', inset: 0 }} />
          <PlantArt kind={illust} size={260} color={color} />
          <div className="stamp" style={{ position: 'absolute', top: 18, right: 18, color }}>
            Specimen<br />· {plant.healthStatus ?? 'good'} ·
          </div>
        </div>
      </section>

      <section style={{ padding: '28px 36px', borderBottom: '1px solid var(--rule)' }}>
        <SectionHeader
          title="Care Schedule"
          trailing={`${tasks.length} TASK${tasks.length === 1 ? '' : 'S'}`}
        />
        <div style={{ marginTop: 18 }}>
          {tasksLoading ? (
            <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)' }}>Looking up scheduled care…</p>
          ) : sortedTasks.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)' }}>
              No care tasks scheduled. <span style={{ color: 'var(--ink-faint)' }}>Use “Log entry” above to add one.</span>
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {sortedTasks.map((t) => {
                const u = taskUrgency(t)
                const done = Boolean(t.completedDate)
                return (
                  <li key={t.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr auto',
                    alignItems: 'center',
                    gap: 16,
                    padding: '10px 14px',
                    border: '1px solid var(--rule)',
                    background: done ? 'var(--paper-2)' : 'var(--cream)',
                    opacity: done ? 0.7 : 1,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                      {t.scheduledDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {t.isRecurring && t.frequency ? ` · ${t.frequency}` : ''}
                    </span>
                    <span style={{ fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                      {t.taskType}
                      {done && <span style={{ marginLeft: 8, color: 'var(--moss)', fontSize: 11, fontWeight: 500 }}>· completed {formatDate(t.completedDate)}</span>}
                    </span>
                    {!done && u.level !== 'none' && (
                      <UrgencyBadge level={u.level} daysOverdue={u.daysOverdue} />
                    )}
                    {done && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--moss)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Done</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {lastWatering && (
          <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
            LAST WATERED · {formatDate(lastWatering.completedDate)}
          </div>
        )}
      </section>

      <section style={{ padding: '28px 36px', borderBottom: '1px solid var(--rule)' }}>
        <SectionHeader title="Notes & Photos" trailing="PHASE 5" />
        <p style={{ marginTop: 14, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          Observations land in Phase 5. Soon this section will hold the journal of waterings,
          notes, photos, and harvests for <strong>{plant.name}</strong> — every entry kept on the same
          paper as the rest of the spread.
        </p>
      </section>

      <section style={{ padding: '28px 36px' }}>
        <SectionHeader title="Wiki Reference" trailing={(plant.species ?? plant.scientificName) ? 'BY SPECIES' : 'PHASE 5'} />
        <p style={{ marginTop: 14, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          {(plant.species ?? plant.scientificName)
            ? `When the wiki store is wired, we'll cross-reference "${plant.species ?? plant.scientificName}" and pull sunlight, watering, soil, and companion plant guidance here.`
            : 'Wiki cross-reference will appear once this plant has a species recorded.'}
        </p>
      </section>
    </AlmanacLayout>
  )
}
