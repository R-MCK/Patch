import { Monogram, SearchGlyph, PlusGlyph, SunGlyph, DropGlyph, CalendarGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'
import { PLANTS, type Plant } from '../data'
import { Link } from 'react-router-dom'
import PaperBackdrop from '../components/PaperBackdrop'

const SeedPacket = ({ p, idx }: { p: Plant; idx: number }) => (
  <Link to={`/plants/${idx}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <article className="packet-lift" style={{
      background: 'var(--cream)',
      border: '1.5px solid var(--ink)',
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '2px 3px 0 var(--ink-soft)',
      cursor: 'pointer',
    }}>
      <div style={{ background: p.color, color: 'var(--cream)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em' }}>
        <span>BED · {p.bed}</span>
        <span>{p.tag}</span>
      </div>

      <div style={{ padding: '14px 14px 6px', display: 'flex', justifyContent: 'center', background: 'var(--paper)', borderBottom: '1px solid var(--rule)' }}>
        <PlantArt kind={p.illust} size={110} color={p.color} />
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--ink-2)' }}>{p.name}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faint)', marginTop: 2 }}>{p.sci}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--ink-faint)', marginTop: 4 }}>FAMILY · {p.latin.toUpperCase()}</div>

        <hr className="dotted-rule" style={{ margin: '10px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>SUN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <SunGlyph size={14} color={p.sun === 'full' ? 'var(--honey)' : 'var(--ink-soft)'} />
              <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>{p.sun === 'full' ? 'Full' : 'Part'}</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>WATER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <DropGlyph size={14} color="var(--sky)" />
              <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>{p.water}d</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>AGE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <CalendarGlyph size={12} color="var(--ink-soft)" />
              <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>{p.days}d</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, padding: '6px 8px', background: p.color, color: 'var(--cream)', borderRadius: 2, fontFamily: 'var(--font-slab)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>STAGE</span>
          <span>{p.stage}</span>
        </div>
      </div>
    </article>
  </Link>
)

export const PlantTrackerPackets = () => {
  const filters = ['All plants', 'Bed I', 'Bed II', 'Bed III', 'Bed IV', 'Bed V', 'Trellis']
  return (
    <PaperBackdrop>
      <header style={{ padding: '20px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Monogram letter="P" size={38} color="var(--forest)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Patch</div>
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

      <section style={{ padding: '36px 36px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>The Patch · 24 in care · 6 beds</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1, marginTop: 6, color: 'var(--ink-2)' }}>
            The seed drawer
          </h1>
          <p style={{ fontFamily: 'var(--font-slab)', fontSize: 15, color: 'var(--ink-soft)', marginTop: 8, maxWidth: 540, lineHeight: 1.5 }}>Every plant on the patch, kept like a vintage packet on the shelf. Click one to open its long story.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/plants/ledger" className="btn-ghost" style={{ textDecoration: 'none' }}>Ledger view</Link>
          <button className="btn-ghost"><SearchGlyph size={14} /> Search</button>
          <button className="btn-primary"><PlusGlyph size={14} /> New plant</button>
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>SORT · BY BED</span>
      </div>

      <section style={{ padding: '28px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {PLANTS.map((p, i) => <SeedPacket key={i} p={p} idx={i} />)}
      </section>
    </PaperBackdrop>
  )
}
