import { ChevronLeftGlyph, PencilGlyph, PlusGlyph, FlowerGlyph, SunGlyph, DropGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'
import { PLANTS } from '../data'
import { useParams, Link } from 'react-router-dom'

export const PlantSpread = () => {
  const { id } = useParams()
  const idx = id ? parseInt(id, 10) : 0
  const base = PLANTS[idx] || PLANTS[0]
  const p = {
    name: base.name,
    nick: 'Big Red',
    sci: `${base.sci} "Brandywine"`,
    family: base.latin,
    bed: `Bed ${base.bed} · Tomatoes`,
    sown: 'Mar 4, 2026',
    transplanted: 'May 2, 2026',
    daysOld: base.days,
    color: base.color,
    illust: base.illust,
  }

  const moisture = [0.45, 0.5, 0.62, 0.55, 0.7, 0.48, 0.52, 0.6, 0.58, 0.7, 0.62, 0.65]
  const timeline = [
    { week: 'Week 1', date: 'Mar 4', label: 'sown' },
    { week: 'Week 4', date: 'Mar 25', label: 'true leaves' },
    { week: 'Week 7', date: 'Apr 15', label: 'pricked out' },
    { week: 'Week 9', date: 'May 2', label: 'planted out' },
    { week: 'Week 11', date: 'May 12', label: 'first flower' },
  ]

  return (
    <div className="paper-bg" style={{ minHeight: '100vh', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <header style={{ padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
        <Link to="/plants" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>
          <ChevronLeftGlyph size={14} /> ALL PLANTS · {p.bed.toUpperCase()} · {p.name.toUpperCase()}
        </Link>
        <nav style={{ display: 'flex', gap: 24, fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <a href="/" style={{ color: 'var(--ink-soft)' }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}>Plants</a>
          <a href="/gardens" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/wiki" style={{ color: 'var(--ink-soft)' }}>Wiki</a>
        </nav>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-ghost"><PencilGlyph size={12} /> Edit</button>
          <button className="btn-primary"><PlusGlyph size={12} /> Log entry</button>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ padding: '40px 44px', borderRight: '1px solid var(--rule)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            Entry № {(idx + 1).toString().padStart(2, '0')} · {p.bed}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 88, lineHeight: 0.9, marginTop: 14, color: 'var(--ink-2)', letterSpacing: '-0.01em' }}>
            {p.name.split(' ')[0]}
            <br />
            <em style={{ color: p.color }}>{p.name.split(' ').slice(1).join(' ')}</em>
          </h1>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-faint)', marginTop: 8 }}>
            {p.sci}
          </div>

          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--rule)', background: 'var(--cream)' }}>
            {[
              { l: 'Family', v: p.family },
              { l: 'Sown', v: p.sown },
              { l: 'Out', v: p.transplanted },
              { l: 'Age', v: `${p.daysOld} d` },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRight: i < 3 ? '1px solid var(--rule)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>{s.l.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 14, fontWeight: 600, marginTop: 4, color: 'var(--ink)' }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, position: 'relative', paddingLeft: 28 }}>
            <span style={{ position: 'absolute', left: -8, top: -10, fontFamily: 'var(--font-display)', fontSize: 96, lineHeight: 1, color: p.color }}>"</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.25, margin: 0 }}>
              The pinkest of the heirlooms. Three years tried; this is the year I get one to ripen before the blight comes through.
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-faint)', marginTop: 12 }}>— FROM THE FIRST PAGE, 4 MAR</div>
          </div>

          <div style={{ marginTop: 36, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="chip" style={{ borderColor: p.color, color: p.color }}><FlowerGlyph size={12} /> FLOWERING</span>
            <span className="chip"><SunGlyph size={12} color="var(--honey)" /> FULL SUN</span>
            <span className="chip"><DropGlyph size={12} color="var(--sky)" /> EVERY 3 DAYS</span>
            <span className="chip" style={{ background: 'var(--moss)', color: 'var(--cream)', borderColor: 'var(--moss)' }}>● HEALTH · GOOD</span>
          </div>
        </div>

        <div style={{ padding: '40px 44px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 28, right: 30 }}>
            <div className="stamp" style={{ color: p.color }}>Specimen<br />№ {(idx + 1).toString().padStart(2, '0')}</div>
          </div>
          <div className="botanical-placeholder" style={{ flex: 1, minHeight: 380, padding: 28, background: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlantArt kind={p.illust} size={300} color={p.color} />
            </div>
            <div style={{ position: 'absolute', bottom: 18, left: 18, fontFamily: 'var(--font-hand)', fontSize: 24, color: p.color, transform: 'rotate(-3deg)' }}>
              first flower!<br />→ may 12
            </div>
            <div style={{ position: 'absolute', top: 18, left: 18, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-faint)' }}>
              PHOTO · {p.bed.toUpperCase()} · 12 MAY · 7:14 AM
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
            <span>← 11 MAY · BUD</span>
            <span>13 MAY · OPEN →</span>
          </div>
        </div>
      </section>

      <section style={{ padding: '28px 36px', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)' }}>Eleven weeks, in pictures</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>5 OF 38 PHOTOS</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 96, left: '5%', right: '5%', height: 1, background: 'var(--rule)', borderTop: '1px dashed var(--rule)' }} />
          {timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="botanical-placeholder" style={{ width: '100%', height: 160, background: 'var(--cream)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 6, left: 6, fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>{t.date}</span>
                <span>{t.label}</span>
              </div>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-2)' }}>{t.week}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>{t.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ padding: '28px 36px', borderRight: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)' }}>Soil, water, sky</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>LAST 12 WEEKS</span>
          </div>
          <hr className="dotted-rule" />

          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
              <span>SOIL MOISTURE %</span>
              <span style={{ color: 'var(--sky)' }}>● readings · 12 weeks</span>
            </div>
            <svg viewBox="0 0 600 140" width="100%" height="160" style={{ marginTop: 8 }}>
              {[0, 25, 50, 75, 100].map(v => {
                const y = 130 - (v/100) * 110
                return (
                  <g key={v}>
                    <line x1="40" y1={y} x2="600" y2={y} stroke="var(--rule)" strokeWidth="0.4" strokeDasharray="2 3" />
                    <text x="34" y={y + 3} textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-faint)">{v}</text>
                  </g>
                )
              })}
              <rect x="40" y={130 - 0.7*110} width="560" height={0.3*110} fill="var(--moss)" fillOpacity="0.1" />
              <polyline points={moisture.map((m, i) => `${40 + (i/(moisture.length-1))*560},${130 - m*110}`).join(' ')}
                fill="none" stroke="var(--sky)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {moisture.map((m, i) => (
                <circle key={i} cx={40 + (i/(moisture.length-1))*560} cy={130 - m*110} r="3" fill="var(--cream)" stroke="var(--sky)" strokeWidth="1.5" />
              ))}
              {[1, 3, 5, 7, 9, 11].map(w => (
                <g key={w}>
                  <line x1={40 + (w/(moisture.length-1))*560} y1="20" x2={40 + (w/(moisture.length-1))*560} y2="130" stroke="var(--terracotta)" strokeWidth="0.5" strokeDasharray="1 2" />
                  <g transform={`translate(${40 + (w/(moisture.length-1))*560 - 6} 8)`}>
                    <rect width="12" height="12" rx="2" fill="var(--terracotta)" />
                    <text x="6" y="9" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--cream)">W</text>
                  </g>
                </g>
              ))}
              {['W1','W3','W5','W7','W9','W11'].map((l, i) => (
                <text key={l} x={40 + (i*2/(moisture.length-1))*560} y="148" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--ink-faint)">{l}</text>
              ))}
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { l: 'Avg. moisture', v: '58%', sub: 'Within optimal' },
              { l: 'Watered', v: '8×', sub: 'Last: 2 days ago' },
              { l: 'Sun (avg)', v: '6.4h', sub: 'Below target 7h' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 14, background: 'var(--paper-2)', border: '1px solid var(--rule)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-faint)' }}>{s.l.toUpperCase()}</div>
                <div className="numeral" style={{ fontSize: 30, lineHeight: 1, marginTop: 4 }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '28px 36px', background: 'var(--paper-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)' }}>The journal</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>14 ENTRIES</span>
          </div>
          <hr className="dotted-rule" />

          <div style={{ marginTop: 18, padding: 16, background: 'var(--cream)', border: '1px solid var(--rule)', position: 'relative' }}>
            <div className="washi" style={{ width: 60, height: 14, top: -7, left: 18, transform: 'rotate(-3deg)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--terracotta)' }}>TUE 12 MAY · 14:22</span>
              <FlowerGlyph size={16} color="var(--terracotta)" />
            </div>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink-2)', lineHeight: 1.25, margin: 0 }}>
              First flower. Pinched a sucker between the second and third truss — the leaves smell like the kitchen of an Italian grandmother. Side-dressed with worm castings.
            </p>
          </div>

          {[
            { date: 'SUN 10 MAY · 09:01', body: 'Tied the leader to the cane. Looking sturdy.' },
            { date: 'FRI  8 MAY · 17:48', body: 'Inspected for hornworm — clean. Mulched with straw.' },
            { date: 'WED  6 MAY · 07:32', body: 'Watered deep. Soil reads 48% — first dip below target.' },
          ].map((j, i) => (
            <div key={i} style={{ marginTop: 14, padding: '12px 0', borderTop: '1px dashed var(--rule)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-faint)' }}>{j.date}</div>
              <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>{j.body}</div>
            </div>
          ))}

          <button className="btn-ghost" style={{ marginTop: 16, width: '100%' }}><PlusGlyph size={12} /> New journal entry</button>
        </div>
      </section>

      <section style={{ padding: '28px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-2)', marginBottom: 8 }}>Neighbours in {p.bed}</h2>
          <hr className="dotted-rule" />
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { n: 'Sungold', c: 'var(--honey)', k: 'tomato' },
              { n: 'Black Krim', c: 'var(--plum)', k: 'tomato' },
              { n: 'Sweet Basil', c: 'var(--moss)', k: 'basil' },
              { n: 'Marigold', c: 'var(--terracotta)', k: 'pea' },
            ].map((n, i) => (
              <div key={i} style={{ padding: 10, background: 'var(--cream)', border: '1px solid var(--rule)' }}>
                <PlantArt kind={n.k} size={50} color={n.c} />
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{n.n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>COMPANION</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-2)', marginBottom: 8 }}>From other patches</h2>
          <hr className="dotted-rule" />
          {[
            { name: 'June M.', what: 'My Brandywine flowered May 8 — three days early.', ago: '2d', initial: 'J' },
            { name: 'Henrik P.', what: 'Side-dress with banana water at first flower; doubles fruit set.', ago: '4d', initial: 'H' },
          ].map((c, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: '1px dashed var(--rule)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--forest)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12 }}>{c.initial}</div>
                <span style={{ fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', marginLeft: 'auto' }}>{c.ago}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>{c.what}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
