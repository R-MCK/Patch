import { Monogram, SproutGlyph, LeafGlyph, FlowerGlyph } from '../glyphs'
import AlmanacLayout from '../components/AlmanacLayout'
import PaperCard from '../components/PaperCard'

export const DashboardSeasons = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const currentMonth = 4
  const currentDay = 12
  const daysInMay = 31
  const angleNow = ((currentMonth + (currentDay/daysInMay)) / 12) * 360 - 90

  return (
    <AlmanacLayout header={
      <header style={{ padding: '20px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Monogram letter="P" size={42} color="var(--forest)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--ink)' }}>Patch</div>
        </div>
        <nav style={{ display: 'flex', gap: 28, fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <a href="/" style={{ color: 'var(--ink)' }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink-soft)' }}>Plants</a>
          <a href="/gardens" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/wiki" style={{ color: 'var(--ink-soft)' }}>Wiki</a>
          <a href="/design" style={{ color: 'var(--ink-soft)' }}>Designer</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.12em' }}>ZONE 7B</span>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--terracotta)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16 }}>R</div>
        </div>
      </header>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: 0, alignItems: 'stretch' }}>
        <section style={{ padding: '36px 32px', borderRight: '1px solid var(--rule)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>Now harvesting</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1, marginTop: 8, color: 'var(--ink-2)' }}>
            In the kitchen,<br />
            <em style={{ color: 'var(--terracotta)' }}>this week.</em>
          </h2>
          <hr className="dotted-rule" style={{ margin: '20px 0' }} />
          {[
            { name: 'Asparagus', sci: 'A. officinalis', last: '7 spears today', icon: 'sprout' },
            { name: 'Rainbow Chard', sci: 'Beta vulgaris', last: 'cut & come', icon: 'leaf' },
            { name: 'Strawberries', sci: 'F. × ananassa', last: '4 ripe', icon: 'flower' },
            { name: 'Spring Onions', sci: 'A. fistulosum', last: 'pull as needed', icon: 'sprout' },
          ].map((p, i) => {
            const Icon = p.icon === 'sprout' ? SproutGlyph : p.icon === 'leaf' ? LeafGlyph : FlowerGlyph
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--sage-soft)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} stroke={1.3} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-slab)', fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faint)' }}>{p.sci}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>{p.last}</div>
              </div>
            )
          })}

          <PaperCard style={{ marginTop: 24, padding: 16 }}>
            <div className="washi" style={{ width: 60, height: 14, top: -7, left: 14, transform: 'rotate(-3deg)' }} />
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--terracotta)', lineHeight: 1.1 }}>
              Suggestion ✿
            </div>
            <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>
              Asparagus & strawberry salad — both peaking together for one more week. Three on Patch have made it this season.
            </div>
          </PaperCard>
        </section>

        <section style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>The Year, in turn</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1, marginTop: 6, color: 'var(--ink-2)', textAlign: 'center' }}>Late spring</h1>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--terracotta)', marginTop: 4, transform: 'rotate(-1.5deg)' }}>
            day 132 of 365
          </div>

          <div style={{ position: 'relative', width: 380, height: 380, marginTop: 16 }}>
            <svg viewBox="0 0 380 380" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="seasonGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--sage-soft)" />
                  <stop offset="0.5" stopColor="var(--cream)" />
                  <stop offset="1" stopColor="var(--paper-2)" />
                </linearGradient>
              </defs>

              <circle cx="190" cy="190" r="170" fill="url(#seasonGrad)" stroke="var(--ink)" strokeWidth="1.2" />
              <circle cx="190" cy="190" r="155" fill="none" stroke="var(--ink)" strokeWidth="0.4" strokeDasharray="1 3" />
              <circle cx="190" cy="190" r="120" fill="none" stroke="var(--rule)" strokeWidth="0.6" />
              <circle cx="190" cy="190" r="90" fill="var(--cream)" stroke="var(--ink)" strokeWidth="0.6" />

              {[
                { from: -90, to: 0, c: 'var(--sage-soft)', o: 0.5 },
                { from: 0, to: 90, c: 'var(--honey)', o: 0.18 },
                { from: 90, to: 180, c: 'var(--rust)', o: 0.18 },
                { from: 180, to: 270, c: 'var(--sky)', o: 0.18 },
              ].map((s, i) => {
                const r1 = 120, r2 = 168
                const a1 = s.from * Math.PI / 180
                const a2 = s.to * Math.PI / 180
                const x1 = 190 + r1 * Math.cos(a1), y1 = 190 + r1 * Math.sin(a1)
                const x2 = 190 + r2 * Math.cos(a1), y2 = 190 + r2 * Math.sin(a1)
                const x3 = 190 + r2 * Math.cos(a2), y3 = 190 + r2 * Math.sin(a2)
                const x4 = 190 + r1 * Math.cos(a2), y4 = 190 + r1 * Math.sin(a2)
                return (
                  <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`} fill={s.c} fillOpacity={s.o} />
                )
              })}

              {months.map((m, i) => {
                const angle = (i / 12) * 360 - 90
                const a = angle * Math.PI / 180
                const x1 = 190 + 90 * Math.cos(a), y1 = 190 + 90 * Math.sin(a)
                const x2 = 190 + 168 * Math.cos(a), y2 = 190 + 168 * Math.sin(a)
                const tx = 190 + 142 * Math.cos((angle + 15) * Math.PI / 180)
                const ty = 190 + 142 * Math.sin((angle + 15) * Math.PI / 180)
                const isCurrent = i === currentMonth
                return (
                  <g key={m}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={isCurrent ? "1.5" : "0.4"} />
                    <text x={tx} y={ty + 4} textAnchor="middle" fontFamily="DM Serif Display" fontSize={isCurrent ? "16" : "13"} fill={isCurrent ? "var(--terracotta)" : "var(--ink-soft)"} fontStyle={isCurrent ? "italic" : "normal"}>
                      {m}
                    </text>
                  </g>
                )
              })}

              {[
                { angle: -45, text: 'Spring', c: 'var(--forest)' },
                { angle: 45, text: 'Summer', c: 'var(--terracotta)' },
                { angle: 135, text: 'Autumn', c: 'var(--rust)' },
                { angle: 225, text: 'Winter', c: 'var(--sky)' },
              ].map((s, i) => {
                const a = s.angle * Math.PI / 180
                const x = 190 + 195 * Math.cos(a)
                const y = 190 + 195 * Math.sin(a)
                return (
                  <text key={i} x={x} y={y + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={s.c} letterSpacing="0.18em">
                    {s.text.toUpperCase()}
                  </text>
                )
              })}

              <g transform={`rotate(${angleNow} 190 190)`}>
                <line x1="190" y1="190" x2="190" y2="38" stroke="var(--terracotta)" strokeWidth="1.5" />
                <circle cx="190" cy="38" r="6" fill="var(--terracotta)" stroke="var(--ink)" strokeWidth="1" />
              </g>

              <circle cx="190" cy="190" r="42" fill="var(--ink)" />
              <text x="190" y="184" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--cream)" letterSpacing="0.16em">TUE 12</text>
              <text x="190" y="200" textAnchor="middle" fontFamily="DM Serif Display" fontSize="22" fill="var(--cream)" fontStyle="italic">May</text>
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
            <span>← LAST FROST · APR 18</span>
            <span style={{ color: 'var(--ink)' }}>↓ TODAY</span>
            <span>FIRST FROST · OCT 27 →</span>
          </div>
        </section>

        <section style={{ padding: '36px 32px', borderLeft: '1px solid var(--rule)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>To tend, today</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1, marginTop: 8, color: 'var(--ink-2)' }}>
            Five small <em style={{ color: 'var(--terracotta)' }}>kindnesses.</em>
          </h2>
          <hr className="dotted-rule" style={{ margin: '20px 0' }} />

          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { kind: 'Water', plant: 'Tomatoes · Bed III', done: true },
              { kind: 'Inspect', plant: 'Sweet peas · trellis', done: true },
              { kind: 'Prune', plant: 'Lavender hedge · south', done: false },
              { kind: 'Sow', plant: 'Coriander · Bed I', done: false },
              { kind: 'Harvest', plant: 'Rainbow chard · Bed II', done: false },
            ].map((t, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
                <span className="numeral" style={{ fontSize: 22, lineHeight: 1, width: 22, color: t.done ? 'var(--ink-faint)' : 'var(--terracotta)' }}>{['I','II','III','IV','V'][i]}</span>
                <div style={{ width: 18, height: 18, border: '1.5px solid var(--ink)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? 'var(--ink)' : 'transparent', color: 'var(--cream)', flexShrink: 0 }}>
                  {t.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6 L 5 9 L 10 3" /></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-slab)', fontSize: 14, fontWeight: 600, color: t.done ? 'var(--ink-faint)' : 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.kind}</div>
                  <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)' }}>{t.plant}</div>
                </div>
              </li>
            ))}
          </ol>

          <div style={{ marginTop: 24, padding: 18, background: 'var(--ink)', color: 'var(--cream)', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--sage-soft)' }}>STREAK</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span className="numeral" style={{ fontSize: 56, lineHeight: 0.9, color: 'var(--honey)' }}>92</span>
              <span style={{ fontFamily: 'var(--font-slab)', fontSize: 13 }}>days</span>
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
              {Array.from({length: 28}).map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 18,
                  background: i < 26 ? 'var(--honey)' : 'rgba(255,255,255,0.15)',
                  borderRadius: 1,
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-slab)', fontSize: 11, marginTop: 10, color: 'var(--sage-soft)', lineHeight: 1.5 }}>Tended every day since 9 February. Eight more days for the spring badge.</div>
          </div>
        </section>
      </div>

      <section style={{ borderTop: '1px solid var(--rule)', padding: '28px 36px', background: 'var(--paper-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)' }}>Coming up in the season</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>NEXT 6 WEEKS · ZONE 7B</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {[
            { wk: 'WK 20', date: 'May 18', what: 'Direct-sow beans', detail: 'Bush, then pole' },
            { wk: 'WK 22', date: 'Jun 1', what: 'Garlic scapes', detail: 'Cut while curled' },
            { wk: 'WK 24', date: 'Jun 15', what: 'First tomato', detail: 'Brandywine likely' },
            { wk: 'WK 25', date: 'Jun 22', what: 'Solstice', detail: 'Longest day · 14h 49m' },
            { wk: 'WK 26', date: 'Jun 29', what: 'Garlic harvest', detail: 'Tops 50% brown' },
            { wk: 'WK 27', date: 'Jul 6', what: 'Sow autumn brassicas', detail: 'Indoors first' },
          ].map((e, i) => (
            <PaperCard key={i} style={{ padding: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--terracotta)' }}>{e.wk} · {e.date}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginTop: 6, color: 'var(--ink-2)' }}>{e.what}</div>
              <div style={{ fontFamily: 'var(--font-slab)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{e.detail}</div>
            </PaperCard>
          ))}
        </div>
      </section>
    </AlmanacLayout>
  )
}
