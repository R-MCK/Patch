import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Monogram, FlowerGlyph, SunGlyph, LeafGlyph, MoonGlyph } from '../glyphs'
import AlmanacLayout from '../components/AlmanacLayout'
import HeroCard from '../components/HeroCard'
import PaperCard from '../components/PaperCard'
import SectionHeader from '../components/SectionHeader'
import { getCurrentSeason } from '../services/SeasonService'
import type { ReactNode } from 'react'
import { useProfileStore } from '@/stores/profileStore'

type GlyphComponent = typeof FlowerGlyph

// --- Seed map (Northern hemisphere) ---
// TODO Phase 5 — replace this static seed with `UserProfile.hemisphere` + wiki-derived
// availability per plant kind. The shape below is the contract Phase 5 should fulfil.

type SeasonKey = 'spring' | 'summer' | 'fall' | 'winter'

interface SeasonContent {
  key: SeasonKey
  label: string
  // Calendar months covered (Northern hemisphere). 0 = Jan.
  months: readonly number[]
  accent: string
  Icon: GlyphComponent
  inSeason: readonly string[]
  plantNow: readonly string[]
  harvestNow: readonly string[]
}

const SEASONS: readonly SeasonContent[] = [
  {
    key: 'spring',
    label: 'Spring',
    months: [2, 3, 4],
    accent: 'var(--moss)',
    Icon: FlowerGlyph,
    inSeason: ['Asparagus', 'Strawberries', 'Spring onions', 'Peas'],
    plantNow: ['Tomatoes (transplant)', 'Basil', 'Lettuces', 'Radish'],
    harvestNow: ['Asparagus', 'Rhubarb', 'Spring greens'],
  },
  {
    key: 'summer',
    label: 'Summer',
    months: [5, 6, 7],
    accent: 'var(--terracotta)',
    Icon: SunGlyph,
    inSeason: ['Tomatoes', 'Zucchini', 'Cucumbers', 'Peppers'],
    plantNow: ['Bush beans', 'Sunflowers', 'Late-summer brassicas (start)'],
    harvestNow: ['Garlic', 'Berries', 'Stone fruit', 'Summer squash'],
  },
  {
    key: 'fall',
    label: 'Fall',
    months: [8, 9, 10],
    accent: 'var(--rust)',
    Icon: LeafGlyph,
    inSeason: ['Pumpkins', 'Apples', 'Kale', 'Brussels sprouts'],
    plantNow: ['Garlic (cloves)', 'Cover crops', 'Spring bulbs'],
    harvestNow: ['Apples', 'Squash', 'Root vegetables'],
  },
  {
    key: 'winter',
    label: 'Winter',
    months: [11, 0, 1],
    accent: 'var(--sky)',
    Icon: MoonGlyph,
    inSeason: ['Citrus', 'Hardy greens', 'Stored squash'],
    plantNow: ['Tomato seeds (indoors)', 'Onions (indoors)', 'Peppers (indoors)'],
    harvestNow: ['Kale', 'Brussels sprouts', 'Stored alliums'],
  },
] as const

// --- Page ---

export const DashboardSeasons = () => {
  const profile = useProfileStore((s) => s.profile)
  const profileLoaded = useProfileStore((s) => s.hasLoaded)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)

  useEffect(() => {
    if (!profileLoaded) {
      void fetchProfile()
    }
  }, [profileLoaded, fetchProfile])

  const seasonSummary = getCurrentSeason(profile)
  const currentSeason = toSeasonKey(seasonSummary.season)
  const locationLabel = [profile?.region, profile?.country].filter(Boolean).join(', ') || 'Northern fallback'

  return (
    <AlmanacLayout header={<SeasonsHeader />}>
      <div style={{ padding: '32px 40px 56px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <HeroCard
          eyebrow="The Year, in turn"
          title={
            <>
              The <em style={{ color: 'var(--terracotta)' }}>seasons</em>, at a glance.
            </>
          }
          subtitle={`What's growing, what to plant, and what to bring in — tuned for ${seasonSummary.hemisphere} hemisphere (${locationLabel}).`}
          titleSize={56}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {SEASONS.map((s) => (
            <SeasonCard
              key={s.key}
              season={s}
              isCurrent={s.key === currentSeason}
            />
          ))}
        </div>

        <PaperCard style={{ padding: 18 }}>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--terracotta)', lineHeight: 1.1 }}>~ Seasonal window ~</div>
          <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.55 }}>
            {seasonSummary.plantingWindow}. Profile location drives hemisphere, and Milestone B will deepen this with planting records.
          </div>
        </PaperCard>
      </div>
    </AlmanacLayout>
  )
}

// --- Subcomponents ---

const SeasonsHeader = () => (
  <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Monogram letter="P" size={42} color="var(--forest)" />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--ink)' }}>Patch</div>
    </div>
    <nav style={{ display: 'flex', gap: 28, fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      <Link to="/today" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Today</Link>
      <Link to="/plants" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Plants</Link>
      <Link to="/dashboard/almanac" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Almanac</Link>
      <Link to="/dashboard/seasons" style={{ color: 'var(--ink)', textDecoration: 'none' }}>Seasons</Link>
      <Link to="/design" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Designer</Link>
    </nav>
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--terracotta)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16 }}>R</div>
  </header>
)

interface SeasonCardProps {
  season: SeasonContent
  isCurrent: boolean
}

const SeasonCard = ({ season, isCurrent }: SeasonCardProps) => {
  const { Icon, label, accent, inSeason, plantNow, harvestNow } = season
  return (
    <PaperCard
      hover="lift"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `4px solid ${accent}`,
        position: 'relative',
      }}
    >
      {isCurrent && (
        <div className="washi" style={{ width: 70, height: 14, top: -7, right: 18, transform: 'rotate(3deg)' }} />
      )}
      <div style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--ink-2)', margin: 0, lineHeight: 1 }}>{label}</h3>
        <div style={{ color: accent }}>
          <Icon size={28} stroke={1.3} />
        </div>
      </div>
      {isCurrent && (
        <div style={{ padding: '0 20px', fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--terracotta)' }}>~ now ~</div>
      )}
      <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SeasonList eyebrow="In season now" items={inSeason} accent={accent} />
        <SeasonList eyebrow="Plant now" items={plantNow} accent={accent} />
        <SeasonList eyebrow="Harvest now" items={harvestNow} accent={accent} />
      </div>
    </PaperCard>
  )
}

interface SeasonListProps {
  eyebrow: ReactNode
  items: readonly string[]
  accent: string
}

function toSeasonKey(season: string): SeasonKey {
  if (season === 'Spring') return 'spring'
  if (season === 'Summer') return 'summer'
  if (season === 'Autumn') return 'fall'
  return 'winter'
}

const SeasonList = ({ eyebrow, items, accent }: SeasonListProps) => (
  <div>
    <SectionHeader
      title={eyebrow}
      titleSize={14}
      marginBottom={6}
      ruleMarginBottom={0}
    />
    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
      {items.map((it) => (
        <li
          key={it}
          style={{
            fontFamily: 'var(--font-slab)',
            fontSize: 13,
            color: 'var(--ink)',
            padding: '4px 0 4px 14px',
            position: 'relative',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 11,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: accent,
            }}
          />
          {it}
        </li>
      ))}
    </ul>
  </div>
)
