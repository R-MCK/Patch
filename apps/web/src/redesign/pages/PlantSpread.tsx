import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { isOverdue, isDueToday, type CareTask, type Observation, type Plant, type WikiEntry } from '@patch/core'

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
  const [observations, setObservations] = useState<Observation[]>([])
  const [wikiEntry, setWikiEntry] = useState<WikiEntry | null>(null)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [observationsLoading, setObservationsLoading] = useState(false)
  const [wikiLoading, setWikiLoading] = useState(false)

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
        const raw = await api.getTasks(plantId)
        if (cancelled) return
        const mapped = Array.isArray(raw) ? raw : []
        setTasks(mapped)
      } catch {
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setTasksLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [plantId])

  useEffect(() => {
    if (!plantId) return
    let cancelled = false
    void (async () => {
      try {
        setObservationsLoading(true)
        const rows = await api.getPlantObservations(plantId)
        if (cancelled) return
        setObservations(rows)
      } catch {
        if (!cancelled) setObservations([])
      } finally {
        if (!cancelled) setObservationsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [plantId])

  const plant = useMemo(() => plants.find((p) => p.id === plantId), [plants, plantId])
  const garden = useMemo(() => plant?.gardenId ? gardens.find((g) => g.id === plant.gardenId) : undefined, [plant, gardens])

  useEffect(() => {
    if (!plant) return
    const speciesHint = (plant.species ?? plant.scientificName ?? '').trim().toLowerCase()
    if (!speciesHint) return

    let cancelled = false
    void (async () => {
      try {
        setWikiLoading(true)
        const entries = await api.getWikiEntries()
        if (cancelled) return
        const match = entries.find((entry) => {
          const scientific = entry.scientificName?.trim().toLowerCase()
          const common = entry.commonName?.trim().toLowerCase()
          return scientific === speciesHint
            || common === speciesHint
            || speciesHint.includes(common ?? '')
            || speciesHint.includes(scientific ?? '')
        }) ?? null
        setWikiEntry(match)
      } catch {
        if (!cancelled) setWikiEntry(null)
      } finally {
        if (!cancelled) setWikiLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [plant])

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
  const speciesLabel = plant.species ?? plant.scientificName

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
          <a href="/today" style={{ color: 'var(--ink-soft)' }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}>Plants</a>
          <a href="/dashboard/map" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/dashboard/almanac" style={{ color: 'var(--ink-soft)' }}>Almanac</a>
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
        <SectionHeader title="Observations" trailing={`${observations.length} ENTRIES`} />
        {observationsLoading ? (
          <p style={{ marginTop: 14, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)' }}>
            Loading observations…
          </p>
        ) : observations.length === 0 ? (
          <p style={{ marginTop: 14, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
            No observations yet for <strong>{plant.name}</strong>. Use Capture to add notes, photos, or task milestones.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 10 }}>
            {observations.slice(0, 8).map((observation) => (
              <li
                key={observation.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 14,
                  border: '1px solid var(--rule)',
                  background: 'var(--cream)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                  {observation.observationType.toUpperCase()}
                  <div style={{ marginTop: 4 }}>{observation.observedAt.toLocaleDateString()}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink)' }}>
                  {observation.textContent
                    || (observation.observationType === 'photo'
                      ? 'Photo capture'
                      : observation.observationType === 'taskComplete'
                        ? 'Task marked complete'
                        : 'Observation')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: '28px 36px' }}>
        <SectionHeader title="Wiki Reference" trailing={speciesLabel ? 'BY SPECIES' : 'NO SPECIES'} />
        {wikiLoading ? (
          <p style={{ marginTop: 14, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)' }}>
            Looking up wiki guidance…
          </p>
        ) : speciesLabel && wikiEntry ? (
          <div style={{ marginTop: 14, maxWidth: 700 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, color: 'var(--ink-2)' }}>
              {wikiEntry.commonName ?? wikiEntry.title}
            </h4>
            {wikiEntry.scientificName && (
              <div style={{ marginTop: 2, fontFamily: 'var(--font-display)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-faint)' }}>
                {wikiEntry.scientificName}
              </div>
            )}
            <p style={{ marginTop: 10, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              {wikiEntry.entryDescription ?? wikiEntry.content}
            </p>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
              {wikiEntry.sunlight ? `SUNLIGHT: ${wikiEntry.sunlight} · ` : ''}
              {wikiEntry.watering ? `WATERING: ${wikiEntry.watering}` : ''}
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 14, fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
            {speciesLabel
              ? `No wiki entry matched "${speciesLabel}" yet.`
              : 'Wiki cross-reference will appear once this plant has a species recorded.'}
          </p>
        )}
      </section>
    </AlmanacLayout>
  )
}
