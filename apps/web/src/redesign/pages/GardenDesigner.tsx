import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Monogram,
  HomeGlyph,
  LeafGlyph,
  MapGlyph,
  BookGlyph,
  PencilGlyph,
  HeartGlyph,
  SunGlyph,
} from '../glyphs'
import { PlantArt } from '../plant-art'
import PaperBackdrop from '../components/PaperBackdrop'
import HeroCard from '../components/HeroCard'
import SectionHeader from '../components/SectionHeader'
import PaperCard from '../components/PaperCard'
import { usePlantStore } from '@/stores/plantStore'
import { useGardenStore } from '@/stores/gardenStore'
import type { Plant } from '@/types'

// --- Static helpers ---

const NAV_ITEMS = [
  { Icon: HomeGlyph,   active: false, label: 'Today',     href: '/' },
  { Icon: LeafGlyph,   active: false, label: 'Plants',    href: '/plants' },
  { Icon: MapGlyph,    active: false, label: 'Seasons',   href: '/dashboard/seasons' },
  { Icon: BookGlyph,   active: false, label: 'Almanac',   href: '/dashboard/almanac' },
  { Icon: PencilGlyph, active: true,  label: 'Designer',  href: '/design' },
  { Icon: HeartGlyph,  active: false, label: 'Community', href: '#' },
] as const

// Static read-only placement data — the canvas drawing engine is descoped from
// Phase 3 and will land in a dedicated phase between Phase 3 and Phase 4.
// TODO drawing engine — separate phase. Until then this canvas is view-only and
// renders the same static SVG sketch as before.
const STATIC_PLACED = [
  { x: 110, y:  70, kind: 'tomato',   label: 'Brandywine T.',  c: 'var(--terracotta)' },
  { x: 200, y:  80, kind: 'tomato',   label: 'Sungold T.',     c: 'var(--honey)' },
  { x: 290, y:  68, kind: 'tomato',   label: 'San Marzano T.', c: 'var(--terracotta)' },
  { x: 130, y: 170, kind: 'basil',    label: 'Genovese B.',    c: 'var(--moss)' },
  { x: 215, y: 175, kind: 'basil',    label: 'Genovese B.',    c: 'var(--moss)' },
  { x: 300, y: 170, kind: 'basil',    label: 'Genovese B.',    c: 'var(--moss)' },
  { x: 380, y: 120, kind: 'lavender', label: 'English L.',     c: 'var(--plum)' },
] as const

// --- Page ---

export const GardenDesigner = () => {
  const params = useParams<{ id?: string }>()
  const gardenIdParam = params.id

  const plants = usePlantStore((s) => s.plants)
  const fetchPlants = usePlantStore((s) => s.fetchPlants)
  const gardens = useGardenStore((s) => s.gardens)
  const fetchGardens = useGardenStore((s) => s.fetchGardens)

  useEffect(() => {
    fetchPlants().catch(() => { /* error captured into store */ })
    fetchGardens().catch(() => { /* error captured into store */ })
  }, [fetchPlants, fetchGardens])

  const garden = useMemo(() => {
    if (gardenIdParam) return gardens.find((g) => g.id === gardenIdParam)
    return gardens[0]
  }, [gardens, gardenIdParam])

  const gardenPlants = useMemo<Plant[]>(() => {
    if (!garden) return []
    return plants.filter((p) => p.gardenId === garden.id)
  }, [plants, garden])

  const dimensionsLabel = (() => {
    if (!garden) return 'Sketch a season'
    const parts: string[] = []
    if (garden.gardenType) parts.push(garden.gardenType)
    if (garden.width && garden.length) parts.push(`${garden.width} × ${garden.length} ft`)
    return parts.length > 0 ? parts.join(' · ') : 'Patch'
  })()

  return (
    <PaperBackdrop style={{ display: 'grid', gridTemplateColumns: '64px 1fr 320px', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
        <Monogram letter="P" size={42} color="var(--forest)" />
        <div style={{ flex: 1, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ Icon, active, label, href }) => (
            <Link
              key={label}
              to={href}
              title={label}
              style={{
                width: 44, height: 44, textDecoration: 'none', cursor: 'pointer',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink-soft)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon size={20} />
            </Link>
          ))}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-soft)', border: '1.5px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--forest)' }}>R</div>
      </aside>

      <main style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <HeroCard
          eyebrow="Designer · view only"
          title={
            <>
              {garden?.name ?? 'Sketch the season'}
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--terracotta)', marginLeft: 14, transform: 'rotate(-2deg)', display: 'inline-block' }}>~ in flower ~</span>
            </>
          }
          subtitle={dimensionsLabel}
          titleSize={48}
        />

        {/* TODO drawing engine — separate phase.
            The canvas below is view-only and renders STATIC_PLACED unchanged.
            Phase boundary: keep `placed[]` static / read-only. Real drag-and-drop,
            persistence, and zone overlays will land in a dedicated canvas phase
            between Phase 3 and Phase 4. */}
        <div style={{ flex: 1, position: 'relative', border: '1.5px solid var(--ink)', background: 'var(--cream)', borderRadius: 4, overflow: 'hidden', minHeight: 480 }}>
          <svg viewBox="0 0 720 520" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <pattern id="dgrid" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="var(--cream)" />
                <circle cx="10" cy="10" r="0.5" fill="var(--rule)" />
              </pattern>
              <pattern id="dsoil" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="var(--paper-2)" />
                <circle cx="2" cy="2" r="0.5" fill="var(--ink-soft)" opacity="0.4" />
                <circle cx="4" cy="5" r="0.4" fill="var(--ink-soft)" opacity="0.3" />
              </pattern>
            </defs>

            <rect width="720" height="520" fill="url(#dgrid)" />
            <path d="M 30 30 Q 360 28, 690 32 L 690 490 Q 360 492, 30 488 Z" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 3" />

            <g transform="translate(150 70)">
              <rect x="0" y="0" width="430" height="220" fill="url(#dsoil)" stroke="var(--terracotta)" strokeWidth="2" rx="4" />
              <g transform="translate(10 10)">
                <rect x="0" y="0" width="160" height="26" fill="var(--cream)" stroke="var(--terracotta)" strokeWidth="1.5" rx="2" />
                <text x="80" y="18" textAnchor="middle" fontFamily="DM Serif Display" fontSize="15" fill="var(--terracotta)">{garden?.name ?? 'Patch'}</text>
              </g>

              {STATIC_PLACED.map((pl, i) => (
                <g key={i} transform={`translate(${pl.x} ${pl.y})`}>
                  <circle r="22" fill={pl.c} fillOpacity="0.08" stroke={pl.c} strokeWidth="0.6" strokeDasharray="2 2" />
                  <foreignObject x="-22" y="-22" width="44" height="44">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <PlantArt kind={pl.kind} size={42} color={pl.c} />
                    </div>
                  </foreignObject>
                  <rect x="-30" y="24" width="60" height="14" fill="var(--cream)" stroke={pl.c} strokeWidth="0.6" rx="2" />
                  <text x="0" y="34" textAnchor="middle" fontFamily="Roboto Slab" fontSize="9" fontWeight="600" fill={pl.c}>{pl.label}</text>
                </g>
              ))}
            </g>

            <g transform="translate(660 470)">
              <circle r="22" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1" />
              <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="var(--terracotta)" stroke="var(--ink)" />
              <text x="0" y="-10" textAnchor="middle" fontFamily="DM Serif Display" fontSize="9" fill="var(--ink)">N</text>
            </g>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
          <span>{STATIC_PLACED.length} PLANTS PLACED · STATIC SKETCH</span>
          <span>·</span>
          <span style={{ color: 'var(--terracotta)' }}>● DRAWING ENGINE — DESCOPED, FUTURE PHASE</span>
        </div>
      </main>

      <aside style={{ borderLeft: '1px solid var(--rule)', padding: '24px 22px', overflow: 'auto', background: 'var(--paper-2)' }}>
        <SectionHeader
          eyebrow="In this garden"
          title="Plants"
          trailing={`${gardenPlants.length}`}
          titleSize={22}
        />
        {gardenPlants.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.5 }}>
            No plants linked to this garden yet.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gardenPlants.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/plants/${p.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--cream)',
                    border: '1px solid var(--rule)',
                    borderRadius: 3,
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    gap: 8,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{p.name}</span>
                  {p.scientificName && (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontStyle: 'italic', color: 'var(--ink-faint)' }}>{p.scientificName}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 24 }}>
          <SectionHeader
            eyebrow="Suggested by the wiki"
            title="Companions"
            titleSize={22}
          />
          <PaperCard style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Wiki-driven plant suggestions arrive in a later phase. The companion-check engine
              and zone-aware recommendations land alongside Phase 5 / 6a.
            </div>
            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-faint)' }}>
              <SunGlyph size={10} color="var(--honey)" /> &nbsp;TODO · WIKI HOOK
            </div>
          </PaperCard>
        </div>
      </aside>
    </PaperBackdrop>
  )
}
