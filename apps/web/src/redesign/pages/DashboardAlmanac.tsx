import { Monogram, SearchGlyph, BotanicalSprig, SunGlyph, DropGlyph, MoonGlyph, LeafGlyph, ScissorsGlyph, SproutGlyph, PlusGlyph } from '../glyphs'
import AlmanacLayout from '../components/AlmanacLayout'

export const DashboardAlmanac = () => {
  const today = { day: 'Tuesday', date: '12', month: 'May', year: '2026' }
  const week = [
    { d: 'M', n: 11, dot: 'sage' as const },
    { d: 'T', n: 12, today: true, dots: ['terracotta', 'forest', 'sky'] },
    { d: 'W', n: 13, dot: 'sky' as const },
    { d: 'T', n: 14, dot: 'sage' as const },
    { d: 'F', n: 15 },
    { d: 'S', n: 16, dot: 'forest' as const },
    { d: 'S', n: 17 },
  ]

  const tasks = [
    { time: '07:00', kind: 'Water', plant: 'Heirloom Tomatoes', bed: 'Bed III', icon: 'drop', done: true },
    { time: '08:30', kind: 'Inspect', plant: 'Sweet Pea Climbers', bed: 'Trellis · West', icon: 'leaf', done: true },
    { time: '10:00', kind: 'Prune', plant: 'Lavender hedge', bed: 'Border · South', icon: 'scissors' },
    { time: '14:00', kind: 'Sow', plant: 'Coriander, second succession', bed: 'Bed I', icon: 'sprout' },
    { time: '17:30', kind: 'Harvest', plant: 'Rainbow Chard', bed: 'Bed II', icon: 'leaf' },
  ]

  return (
    <AlmanacLayout header={
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Monogram letter="P" size={48} color="var(--forest)" />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--ink)' }}>Patch</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 4 }}>The Gardener's Almanac · Vol. 2026</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 28, fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 500 }}>
          <a href="/" style={{ color: 'var(--ink)', borderBottom: '2px solid var(--terracotta)', paddingBottom: 4 }}>Today</a>
          <a href="/plants" style={{ color: 'var(--ink-soft)' }}>Plants</a>
          <a href="/gardens" style={{ color: 'var(--ink-soft)' }}>Gardens</a>
          <a href="/wiki" style={{ color: 'var(--ink-soft)' }}>Wiki</a>
          <a href="/design" style={{ color: 'var(--ink-soft)' }}>Designer</a>
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-ghost"><SearchGlyph size={14} /></button>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-soft)', border: '1.5px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--forest)' }}>R</div>
        </div>
      </header>
    }>
      <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ padding: '40px 40px 36px', borderRight: '1px solid var(--rule)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            № XIX · {today.day}, {today.month} {today.date}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 76, lineHeight: 0.95, marginTop: 10, color: 'var(--ink-2)', letterSpacing: '-0.01em' }}>
            Good morning, <em style={{ color: 'var(--terracotta)' }}>Rosemary.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-slab)', fontSize: 16, marginTop: 16, color: 'var(--ink-soft)', maxWidth: 540, lineHeight: 1.55 }}>
            Five tasks tend the patch today — a watering, a sowing, and the first true harvest of the chard. The moon waxes; the soil holds 62% moisture.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SunGlyph size={18} color="var(--honey)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>72°F · Partly sunny</span>
            </div>
            <span style={{ color: 'var(--rule)' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DropGlyph size={16} color="var(--sky)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>0.2" rain expected</span>
            </div>
            <span style={{ color: 'var(--rule)' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MoonGlyph size={16} color="var(--ink-soft)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>Waxing crescent · 38%</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <BotanicalSprig size={220} color="var(--forest)" accent="var(--terracotta)" />
          <div style={{ position: 'absolute', top: 24, right: 30, textAlign: 'right' }}>
            <div className="stamp" style={{ color: 'var(--terracotta)' }}>Late Spring</div>
          </div>
          <div style={{ position: 'absolute', bottom: 30, left: 30, fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink-soft)', maxWidth: 180, lineHeight: 1.2, transform: 'rotate(-3deg)' }}>
            "The garden suggests there might be a place where we can meet nature halfway."
            <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6, transform: 'rotate(2deg)' }}>— michael pollan</div>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0, borderBottom: '1px solid var(--rule)' }}>
        <div style={{ padding: '32px 40px', borderRight: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink-2)' }}>Today's tend</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>5 tasks · 2 done</span>
          </div>
          <hr className="dotted-rule" style={{ marginBottom: 6 }} />
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map((t, i) => {
              const Icon = t.icon === 'drop' ? DropGlyph : t.icon === 'leaf' ? LeafGlyph : t.icon === 'scissors' ? ScissorsGlyph : SproutGlyph
              return (
                <li key={i} style={{ display: 'grid', gridTemplateColumns: '54px 28px 1fr auto', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>{t.time}</span>
                  <div style={{ width: 22, height: 22, border: '1.5px solid var(--ink)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? 'var(--ink)' : 'transparent', color: 'var(--cream)' }}>
                    {t.done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6 L 5 9 L 10 3" /></svg>}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-slab)', fontSize: 15, fontWeight: 600, color: t.done ? 'var(--ink-faint)' : 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none' }}>
                      {t.kind} · <span style={{ fontWeight: 400, fontStyle: 'italic' }}>{t.plant}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{t.bed}</div>
                  </div>
                  <div style={{ color: 'var(--forest)' }}>
                    <Icon size={20} stroke={1.4} />
                  </div>
                </li>
              )
            })}
          </ol>
          <button style={{ marginTop: 18, fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terracotta)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PlusGlyph size={14} /> Add to today
          </button>
        </div>

        <div style={{ padding: '32px 40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink-2)', marginBottom: 20 }}>The week</h2>
          <hr className="dotted-rule" style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 28 }}>
            {week.map((d, i) => (
              <div key={i} style={{
                aspectRatio: '0.78',
                border: d.today ? '2px solid var(--terracotta)' : '1px solid var(--rule)',
                background: d.today ? 'var(--cream)' : 'transparent',
                borderRadius: 4, padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>{d.d}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: d.today ? 'var(--terracotta)' : 'var(--ink-2)', lineHeight: 1 }}>{d.n}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {(d.dots || (d.dot ? [d.dot] : [])).map((c, j) => (
                    <span key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: `var(--${c})` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--rule)' }}>
            {[
              { num: '24', label: 'Plants in care' },
              { num: '3', label: 'Garden beds' },
              { num: '17', label: 'Harvested · May' },
              { num: '92', label: 'Day streak' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 18,
                borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
                borderBottom: i < 2 ? '1px solid var(--rule)' : 'none',
                background: i === 3 ? 'var(--sage-soft)' : 'transparent',
              }}>
                <div className="numeral" style={{ fontSize: 44, lineHeight: 1, color: i === 3 ? 'var(--forest)' : 'var(--terracotta)' }}>{s.num}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ padding: '32px 40px', borderRight: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)' }}>From the field journal</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>3 entries this week</span>
          </div>
          <article style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 18, padding: '12px 0', borderTop: '1px solid var(--rule-soft)' }}>
            <div className="botanical-placeholder" style={{ height: 90 }}>tomato</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>SUN · MAY 10 · BED III</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 4, color: 'var(--ink-2)' }}>The first tomato truss has set fruit.</h3>
              <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>Brandywine, fattest of the four. Pinched a sucker, side-dressed with worm castings. The leaves smell like the kitchen of an Italian grandmother.</p>
            </div>
          </article>
          <article style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 18, padding: '12px 0', borderTop: '1px solid var(--rule-soft)' }}>
            <div className="botanical-placeholder" style={{ height: 90 }}>aphid</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>FRI · MAY 8 · TRELLIS WEST</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 4, color: 'var(--ink-2)' }}>Aphid count down 80% after ladybird release.</h3>
              <p style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>Forty larvae from the supplier; spotted three adults this morning. Holding off on neem.</p>
            </div>
          </article>
        </div>

        <div style={{ padding: '32px 40px', background: 'var(--paper-2)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, left: 30, right: 30, height: 16 }}>
            <div className="washi" style={{ width: 80, height: 16, top: 0, left: 20, transform: 'rotate(-2deg)' }} />
            <div className="washi" style={{ width: 60, height: 16, top: 2, right: 30, transform: 'rotate(3deg)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)', marginBottom: 6 }}>Sow this week</h2>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: 16 }}>USDA ZONE 7B · WEEK 19</div>
          {[
            { name: 'Bush Beans', sci: 'Phaseolus vulgaris', when: 'Direct, after last frost' },
            { name: 'Basil, Genovese', sci: 'Ocimum basilicum', when: 'Indoors, transplant in 3 wks' },
            { name: 'Sunflower', sci: 'Helianthus annuus', when: 'Direct, full sun' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px dashed var(--rule)' }}>
              <span className="numeral" style={{ fontSize: 28, lineHeight: 0.9, minWidth: 32 }}>{['I', 'II', 'III'][i]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faint)' }}>{p.sci}</div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{p.when}</div>
              </div>
              <button style={{ background: 'transparent', border: '1.5px solid var(--ink)', borderRadius: 999, padding: '4px 10px', fontFamily: 'var(--font-slab)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Add</button>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span>Patch Almanac · Edition MMXXVI</span>
        <span>Hand-set in DM Serif & Roboto Slab</span>
        <span>Page i</span>
      </footer>
    </AlmanacLayout>
  )
}
