import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react'
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
import type { GardenZone, Plant } from '@/types'
import { api } from '@/lib/api'

// --- Static helpers ---

const NAV_ITEMS = [
  { Icon: HomeGlyph,   active: false, label: 'Today',     href: '/today' },
  { Icon: LeafGlyph,   active: false, label: 'Plants',    href: '/plants' },
  { Icon: MapGlyph,    active: false, label: 'Seasons',   href: '/dashboard/seasons' },
  { Icon: BookGlyph,   active: false, label: 'Almanac',   href: '/dashboard/almanac' },
  { Icon: PencilGlyph, active: true,  label: 'Designer',  href: '/design' },
  { Icon: HeartGlyph,  active: false, label: 'Community', href: '#' },
] as const

// Baseline placement sketch used by the canvas until persisted drag geometry lands.
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
  const [zones, setZones] = useState<GardenZone[]>([])
  const [zoneName, setZoneName] = useState('')
  const [zoneType, setZoneType] = useState('')
  const [zoneWidth, setZoneWidth] = useState('')
  const [zoneLength, setZoneLength] = useState('')
  const [zoneError, setZoneError] = useState('')
  const [isSavingZone, setIsSavingZone] = useState(false)
  const [placingPlantId, setPlacingPlantId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!garden?.id) {
      return
    }
    let cancelled = false
    void (async () => {
      const rows = await api.getGardenZones(garden.id).catch(() => [] as GardenZone[])
      if (cancelled) return
      setZones(rows)
    })()
    return () => {
      cancelled = true
    }
  }, [garden?.id])

  const zoneOverlays = useMemo(() => {
    return zones.map((zone, index) => {
      const x = 170 + ((index % 3) * 120)
      const y = 110 + (Math.floor(index / 3) * 90)
      return {
        zone,
        x,
        y,
        w: 100,
        h: 70,
      }
    })
  }, [zones])

  const placedWithZone = useMemo(() => {
    if (zones.length === 0) {
      return STATIC_PLACED.map((plant) => ({ ...plant, zoneId: undefined as string | undefined, zoneName: undefined as string | undefined }))
    }
    return STATIC_PLACED.map((plant, index) => {
      const zone = zones[index % zones.length]
      return {
        ...plant,
        zoneId: zone.id,
        zoneName: zone.name,
      }
    })
  }, [zones])

  const handleCreateZone = async (event: FormEvent) => {
    event.preventDefault()
    if (!garden?.id) return
    const name = zoneName.trim()
    if (!name) {
      setZoneError('Zone name is required.')
      return
    }
    setZoneError('')
    setIsSavingZone(true)
    try {
      const parsedWidth = zoneWidth.trim() ? Number(zoneWidth) : null
      const parsedLength = zoneLength.trim() ? Number(zoneLength) : null
      const created = await api.createGardenZone(garden.id, {
        name,
        zone_type: zoneType.trim() || null,
        width_feet: parsedWidth !== null && Number.isFinite(parsedWidth) ? parsedWidth : null,
        length_feet: parsedLength !== null && Number.isFinite(parsedLength) ? parsedLength : null,
        sort_order: zones.length,
      })
      setZones((prev) => [...prev, created])
      setZoneName('')
      setZoneType('')
      setZoneWidth('')
      setZoneLength('')
    } catch (error) {
      setZoneError(error instanceof Error ? error.message : 'Failed to create zone')
    } finally {
      setIsSavingZone(false)
    }
  }

  const handlePlacePlantInZone = async (plant: Plant, zoneId: string) => {
    if (!garden?.id || !zoneId) return
    setPlacingPlantId(plant.id)
    try {
      const now = new Date()
      const season = (() => {
        const month = now.getMonth()
        if (month >= 2 && month <= 4) return 'Spring'
        if (month >= 5 && month <= 7) return 'Summer'
        if (month >= 8 && month <= 10) return 'Autumn'
        return 'Winter'
      })()
      await api.createPlantingRecord({
        plant_name_snapshot: plant.name,
        species_snapshot: plant.species ?? plant.scientificName ?? null,
        variety_snapshot: plant.variety ?? null,
        garden_id: garden.id,
        zone_id: zoneId,
        planted_at: now.toISOString(),
        source_plant_id: plant.id,
        season,
        year: now.getFullYear(),
      })
    } finally {
      setPlacingPlantId(null)
    }
  }

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

        {/* Current designer canvas rendering with zone overlays. */}
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

              {placedWithZone.map((pl, i) => (
                <g key={i} transform={`translate(${pl.x} ${pl.y})`}>
                  <circle r="22" fill={pl.c} fillOpacity="0.08" stroke={pl.c} strokeWidth="0.6" strokeDasharray="2 2" />
                  <foreignObject x="-22" y="-22" width="44" height="44">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <PlantArt kind={pl.kind} size={42} color={pl.c} />
                    </div>
                  </foreignObject>
                  <rect x="-40" y="24" width="80" height="14" fill="var(--cream)" stroke={pl.c} strokeWidth="0.6" rx="2" />
                  <text x="0" y="34" textAnchor="middle" fontFamily="Roboto Slab" fontSize="9" fontWeight="600" fill={pl.c}>{pl.label}</text>
                  {pl.zoneName && (
                    <text x="0" y="46" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" letterSpacing="0.08em" fill="var(--sky)">
                      {pl.zoneName.toUpperCase()}
                    </text>
                  )}
                </g>
              ))}

              {zoneOverlays.map(({ zone, x, y, w, h }) => (
                <g key={zone.id} transform={`translate(${x} ${y})`}>
                  <rect x="0" y="0" width={w} height={h} fill="none" stroke="var(--sky)" strokeWidth="1.4" strokeDasharray="6 4" rx="4" />
                  <rect x="2" y="2" width={w - 4} height="16" fill="var(--cream)" opacity="0.95" />
                  <text x="8" y="14" fontFamily="Roboto Slab" fontSize="10" fontWeight="600" fill="var(--sky)">
                    {zone.name}
                  </text>
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
          <span>{STATIC_PLACED.length} PLANTS PLACED · CANVAS PREVIEW</span>
          <span>·</span>
          <span style={{ color: 'var(--terracotta)' }}>● ZONE OVERLAYS ACTIVE</span>
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
                {zones.length > 0 && (
                  <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
                    <select id={`zone-select-${p.id}`} style={fieldStyle}>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '6px 10px', fontSize: 10 }}
                      disabled={placingPlantId === p.id}
                      onClick={() => {
                        const input = document.getElementById(`zone-select-${p.id}`) as HTMLSelectElement | null
                        const zoneId = input?.value ?? ''
                        void handlePlacePlantInZone(p, zoneId)
                      }}
                    >
                      {placingPlantId === p.id ? 'Placing' : 'Place'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 24 }}>
          <SectionHeader
            eyebrow="Zone overlays"
            title="Zones"
            trailing={`${zones.length}`}
            titleSize={22}
          />
          <form onSubmit={handleCreateZone} style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            <input value={zoneName} onChange={(event) => setZoneName(event.target.value)} placeholder="Zone name" style={fieldStyle} />
            <input value={zoneType} onChange={(event) => setZoneType(event.target.value)} placeholder="Zone type (optional)" style={fieldStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={zoneWidth} onChange={(event) => setZoneWidth(event.target.value)} placeholder="Width ft" style={fieldStyle} />
              <input value={zoneLength} onChange={(event) => setZoneLength(event.target.value)} placeholder="Length ft" style={fieldStyle} />
            </div>
            <button type="submit" className="btn-primary" disabled={isSavingZone}>
              {isSavingZone ? 'Saving zone' : 'Add zone'}
            </button>
            {zoneError && <div style={{ border: '1px solid var(--berry)', color: 'var(--berry)', padding: 8 }}>{zoneError}</div>}
          </form>

          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 6 }}>
            {zones.map((zone) => (
              <li key={zone.id}>
                <Link
                  to={`/gardens/${zone.gardenId}/zones/${zone.id}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    border: '1px solid var(--rule)',
                    background: 'var(--cream)',
                    padding: '8px 10px',
                    fontFamily: 'var(--font-slab)',
                    fontSize: 12,
                  }}
                >
                  {zone.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

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

const fieldStyle: CSSProperties = {
  width: '100%',
  border: '1px solid var(--rule)',
  background: 'var(--cream)',
  color: 'var(--ink)',
  padding: '8px 10px',
  font: 'inherit',
}
