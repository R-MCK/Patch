import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Monogram,
  HomeGlyph,
  LeafGlyph,
  MapGlyph,
  BookGlyph,
  PencilGlyph,
  HeartGlyph,
  PlusGlyph,
  SunGlyph,
  ChevronRightGlyph,
  SproutGlyph,
} from '../glyphs'
import PaperBackdrop from '../components/PaperBackdrop'
import PaperCard from '../components/PaperCard'
import HeroCard from '../components/HeroCard'
import WeatherChip from '../components/WeatherChip'
import OverdueBadge from '../components/OverdueBadge'
import EmptyState from '../components/EmptyState'
import CapturePill from '../components/CapturePill'
import { usePlantStore } from '@/stores/plantStore'
import { useGardenStore } from '@/stores/gardenStore'
import type { Plant, Garden } from '@/types'

// --- Static helpers (hoisted out of render to satisfy react-hooks/static-components) ---

const NAV_ITEMS = [
  { Icon: HomeGlyph, active: true,  label: 'Today',     href: '/' },
  { Icon: LeafGlyph, active: false, label: 'Plants',    href: '/plants' },
  { Icon: MapGlyph,  active: false, label: 'Gardens',   href: '/dashboard/seasons' },
  { Icon: BookGlyph, active: false, label: 'Almanac',   href: '/dashboard/almanac' },
  { Icon: PencilGlyph, active: false, label: 'Designer', href: '/design' },
  { Icon: HeartGlyph,  active: false, label: 'Community', href: '#' },
] as const

const greeting = (): string => {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

const seasonLabel = (): string => {
  // Northern hemisphere — Phase 5 will hook UserProfile.
  const m = new Date().getMonth() // 0-11
  if (m >= 2 && m <= 4) return 'Spring'
  if (m >= 5 && m <= 7) return 'Summer'
  if (m >= 8 && m <= 10) return 'Autumn'
  return 'Winter'
}

const formattedDate = (): string => {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

// Heuristic placeholder for overdue count: count plants in garden where last activity is missing
// or planting_date is older than 14 days and there's no recent watering signal in the Plant model.
// TODO: replace with backend aggregation or per-plant CareTask scan in Phase 5.
const overdueHeuristic = (plants: Plant[]): number => {
  const now = Date.now()
  const fortnight = 14 * 24 * 60 * 60 * 1000
  return plants.filter((p) => {
    const planted = p.plantingDate ?? p.plantedDate
    if (!planted) return false
    return now - planted.getTime() > fortnight
  }).length
}

// --- Page ---

export const DashboardMap = () => {
  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)
  const isLoadingPlants = usePlantStore((s) => s.isLoading)

  const gardens = useGardenStore((s) => s.gardens)
  const fetchGardens = useGardenStore((s) => s.fetchGardens)

  useEffect(() => {
    fetchPlants().catch(() => { /* error captured into store */ })
    fetchGardens().catch(() => { /* error captured into store */ })
  }, [fetchPlants, fetchGardens])

  const plantsByGarden = useMemo(() => {
    const map = new Map<string, Plant[]>()
    for (const p of plants) {
      const key = p.gardenId ?? '__unassigned__'
      const list = map.get(key) ?? []
      list.push(p)
      map.set(key, list)
    }
    return map
  }, [plants])

  const hasGardens = gardens.length > 0

  return (
    <PaperBackdrop style={{ display: 'grid', gridTemplateColumns: '64px 1fr' }}>
      <aside style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
        <Monogram letter="P" size={42} color="var(--forest)" />
        <div style={{ flex: 1, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ Icon, active, label, href }) => (
            <Link
              key={label}
              to={href}
              title={label}
              style={{
                width: 44,
                height: 44,
                textDecoration: 'none',
                cursor: 'pointer',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink-soft)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} />
            </Link>
          ))}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-soft)', border: '1.5px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--forest)' }}>R</div>
      </aside>

      <main style={{ padding: '32px 40px 56px', display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
        <HeroCard
          eyebrow={`${formattedDate()} · ${seasonLabel()}`}
          title={
            <>
              {greeting()},{' '}
              <em style={{ color: 'var(--terracotta)' }}>gardener.</em>
            </>
          }
          subtitle={
            hasGardens
              ? `Tending ${plants.length} plant${plants.length === 1 ? '' : 's'} across ${gardens.length} garden${gardens.length === 1 ? '' : 's'}.`
              : 'Mark your first patch to begin the field journal.'
          }
          titleSize={56}
          trailing={
            <WeatherChip
              icon={<SunGlyph size={16} color="var(--honey)" />}
              temp="72°"
              condition="Partly sunny"
            />
          }
        />

        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink-2)', margin: 0 }}>Your gardens</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-faint)' }}>
              {hasGardens ? `${gardens.length} GARDEN${gardens.length === 1 ? '' : 'S'} · ${plants.length} PLANT${plants.length === 1 ? '' : 'S'}` : 'NONE YET'}
            </span>
          </div>
          <hr className="dotted-rule" style={{ marginBottom: 20 }} />

          {hasGardens ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {gardens.map((g) => {
                const gardenPlants = plantsByGarden.get(g.id) ?? []
                const overdue = overdueHeuristic(gardenPlants)
                return (
                  <GardenCard
                    key={g.id}
                    garden={g}
                    plantCount={gardenPlants.length}
                    overdueCount={overdue}
                  />
                )
              })}
            </div>
          ) : (
            <PaperCard style={{ padding: 0 }}>
              <EmptyState
                illustration={<SproutGlyph size={64} color="var(--moss)" />}
                title="Mark your first garden"
                body="Sketch a bed, name it, and Patch will start keeping its journal alongside yours."
                cta={{
                  label: 'New garden',
                  // TODO Phase 5 — wire to creation flow / Capture modal.
                  onClick: () => { /* stub */ },
                }}
              />
            </PaperCard>
          )}

          {isLoadingPlants && (
            <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-faint)' }}>
              LOADING PLANTS…
            </div>
          )}
        </section>
      </main>

      <CapturePill icon={<PlusGlyph size={14} />} />
    </PaperBackdrop>
  )
}

interface GardenCardProps {
  garden: Garden
  plantCount: number
  overdueCount: number
}

const GardenCard = ({ garden, plantCount, overdueCount }: GardenCardProps) => {
  const dims = garden.width && garden.length ? `${garden.width} × ${garden.length} ft` : (garden.gardenType ?? 'Patch')

  // NOTE: PlantTrackerPackets does not yet support a garden filter param (Phase 2 scope).
  // For now we link to /plants without a filter; revisit when Phase 2 lands ?garden=:id.
  return (
    <Link to="/plants" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <PaperCard hover="lift" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div
          aria-hidden
          style={{
            position: 'relative',
            height: 132,
            background: 'var(--paper-2)',
            borderBottom: '1px solid var(--rule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--moss)',
          }}
        >
          <SproutGlyph size={56} stroke={1.1} />
          <div className="washi" style={{ width: 60, height: 14, top: -6, left: 18, transform: 'rotate(-3deg)' }} />
        </div>
        <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-2)', margin: 0, lineHeight: 1.1 }}>{garden.name}</h3>
            <ChevronRightGlyph size={16} color="var(--ink-faint)" />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
            {dims}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
              {plantCount} plant{plantCount === 1 ? '' : 's'}
            </span>
            {overdueCount > 0 && <OverdueBadge count={overdueCount} />}
          </div>
        </div>
      </PaperCard>
    </Link>
  )
}
