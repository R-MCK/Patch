import { Monogram, SearchGlyph, PlusGlyph, SunGlyph, ChevronRightGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'
import { PLANTS } from '../data'
import { Link } from 'react-router-dom'

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const w = 90, h = 22
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h - v*h*0.85 - 2}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i/(data.length-1))*w} cy={h - v*h*0.85 - 2} r="1.2" fill={color} />
      ))}
    </svg>
  )
}

const HealthDot = ({ h }: { h: string }) => {
  const map: Record<string, string> = { Excellent: 'var(--moss)', Good: 'var(--sage)', Fair: 'var(--honey)', Poor: 'var(--terracotta)' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: map[h], boxShadow: `0 0 0 2px ${map[h]}33` }} />
      {h}
    </span>
  )
}

export const PlantTrackerLedger = () => {
  const rows = PLANTS.map((p, i) => ({
    ...p,
    spark: Array.from({ length: 14 }).map(() => 0.3 + Math.random() * 0.7),
    nextTask: ['Water in 2d', 'Inspect tom.', 'Pinch tip', 'Cut & come', 'Trim spent', 'Side-dress', 'Pick ripe', 'Thin row', 'Stake'][i],
    health: ['Excellent', 'Good', 'Excellent', 'Good', 'Good', 'Fair', 'Excellent', 'Good', 'Good'][i],
    note: [
      'First truss has set fruit. Pinched a sucker.',
      'Up the trellis, almost two feet now.',
      'Pinch the central flower stem when it appears.',
      'Outer leaves cropped Sun. Centre regrowing fast.',
      'Buds showing. Trim spent flowers next week.',
      'A few caterpillar holes — netting on tomorrow.',
      'Four ripe berries today. Birds noticed.',
      'Up to true-leaves stage. Thin to 4" centres.',
      'Cherries colouring; needs another stake.',
    ][i],
  }))

  return (
    <div className="paper-bg-cream" style={{ minHeight: '100vh', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
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

      <section style={{ padding: '32px 40px 18px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 24, borderBottom: '1px solid var(--rule)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>An Index of Living Things</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 0.95, marginTop: 4, color: 'var(--ink-2)' }}>
            The Plant Ledger
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--rule)', borderRight: '1px solid var(--rule)', padding: '0 28px' }}>
          <span className="numeral" style={{ fontSize: 64, lineHeight: 1, color: 'var(--terracotta)' }}>24</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>ENTRIES IN BOOK</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8, lineHeight: 1.5 }}>Browse, search, and tend. Click any row to open the long story for that plant.</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Link to="/plants" className="btn-ghost" style={{ textDecoration: 'none' }}>Packet view</Link>
            <button className="btn-ghost"><SearchGlyph size={12} /> Search</button>
            <button className="btn-primary"><PlusGlyph size={12} /> New entry</button>
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
          <span>SORTED BY · BED, AGE</span>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
            {[
              { l: '№', w: '40px' },
              { l: 'Plant', w: 'auto' },
              { l: 'Bed', w: '90px' },
              { l: 'Stage', w: '110px' },
              { l: 'Sun', w: '60px' },
              { l: 'Water', w: '70px' },
              { l: 'Age', w: '60px' },
              { l: 'Health', w: '110px' },
              { l: '14-day care', w: '110px' },
              { l: 'Latest note', w: '300px' },
              { l: 'Next', w: '110px' },
            ].map((h, i) => (
              <th key={i} style={{ width: h.w, textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', fontWeight: 500, textTransform: 'uppercase' }}>
                {h.l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="row-hover" style={{
              background: i % 2 === 0 ? 'transparent' : 'var(--paper-2)',
              borderBottom: '1px solid var(--rule)',
              cursor: 'pointer',
            }} onClick={() => { window.location.href = `/plants/${i}` }}>
              <td style={{ padding: '14px 12px', fontFamily: 'var(--font-display)', fontSize: 16, fontStyle: 'italic', color: 'var(--terracotta)' }}>{(i+1).toString().padStart(2, '0')}</td>
              <td style={{ padding: '14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 4, background: 'var(--cream)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlantArt kind={r.illust} size={36} color={r.color} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.1 }}>{r.name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontStyle: 'italic', color: 'var(--ink-faint)', marginTop: 2 }}>{r.sci}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '14px 12px', fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 600 }}>{r.bed}</td>
              <td style={{ padding: '14px 12px' }}>
                <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: r.color, borderBottom: `2px solid ${r.color}`, paddingBottom: 2 }}>{r.stage}</span>
              </td>
              <td style={{ padding: '14px 12px' }}>
                <SunGlyph size={16} color={r.sun === 'full' ? 'var(--honey)' : 'var(--ink-soft)'} />
              </td>
              <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--sky)' }}>every {r.water}d</td>
              <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.days}d</td>
              <td style={{ padding: '14px 12px' }}><HealthDot h={r.health} /></td>
              <td style={{ padding: '14px 12px' }}><Sparkline data={r.spark} color={r.color} /></td>
              <td style={{ padding: '14px 12px', fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.2, maxWidth: 300 }}>
                "{r.note}"
              </td>
              <td style={{ padding: '14px 12px', fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, color: 'var(--terracotta)', letterSpacing: '0.04em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{r.nextTask}</span>
                  <ChevronRightGlyph size={14} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
        <span>Page xvii · Showing 9 of 24</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ padding: '6px 12px', border: '1px solid var(--ink)', background: 'var(--cream)', cursor: 'pointer', fontFamily: 'var(--font-slab)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>‹ Prev</button>
          <button style={{ padding: '6px 12px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--cream)', cursor: 'pointer', fontFamily: 'var(--font-slab)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next ›</button>
        </div>
        <span>Tended by R. (you)</span>
      </footer>
    </div>
  )
}
