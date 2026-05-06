import { Monogram, HomeGlyph, LeafGlyph, MapGlyph, BookGlyph, PencilGlyph, HeartGlyph, PlusGlyph, SunGlyph, CloudGlyph, DropGlyph } from '../glyphs'
import PaperBackdrop from '../components/PaperBackdrop'

interface Bed {
  id: string
  x: number
  y: number
  w: number
  h: number
  name: string
  plants: number
  color: string
}

export const DashboardMap = () => {
  const beds: Bed[] = [
    { id: 'I',   x:  60, y:  80, w: 220, h: 130, name: 'Bed I · Brassicas',   plants: 8, color: 'var(--moss)' },
    { id: 'II',  x: 300, y:  80, w: 180, h: 130, name: 'Bed II · Greens',     plants: 6, color: 'var(--moss)' },
    { id: 'III', x: 500, y:  80, w: 240, h: 200, name: 'Bed III · Tomatoes',  plants: 5, color: 'var(--terracotta)' },
    { id: 'IV',  x:  60, y: 240, w: 200, h: 160, name: 'Bed IV · Roots',      plants: 12, color: 'var(--rust)' },
    { id: 'V',   x: 280, y: 240, w: 200, h: 160, name: 'Bed V · Herbs',       plants: 9, color: 'var(--sage)' },
    { id: 'VI',  x: 500, y: 300, w: 240, h: 100, name: 'Trellis · Peas',      plants: 4, color: 'var(--forest)' },
  ]

  const Pin = ({ x, y, label, color = 'var(--forest)' }: { x: number; y: number; label: string; color?: string }) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r="9" fill="var(--cream)" stroke={color} strokeWidth="1.5" />
      <text x="0" y="3" textAnchor="middle" fontFamily="DM Serif Display" fontSize="10" fill={color}>{label}</text>
    </g>
  )

  return (
    <PaperBackdrop style={{ display: 'grid', gridTemplateColumns: '64px 1fr 360px' }}>
      <aside style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
        <Monogram letter="P" size={42} color="var(--forest)" />
        <div style={{ flex: 1, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { Icon: HomeGlyph, active: true, label: 'Today', href: '/' },
            { Icon: LeafGlyph, label: 'Plants', href: '/plants' },
            { Icon: MapGlyph, label: 'Gardens', href: '/gardens' },
            { Icon: BookGlyph, label: 'Wiki', href: '/wiki' },
            { Icon: PencilGlyph, label: 'Designer', href: '/design' },
            { Icon: HeartGlyph, label: 'Community', href: '#' },
          ].map(({ Icon, active, label, href }, i) => (
            <a key={i} href={href} title={label} style={{
              width: 44, height: 44, textDecoration: 'none', cursor: 'pointer',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--cream)' : 'var(--ink-soft)',
              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} />
            </a>
          ))}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-soft)', border: '1.5px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--forest)' }}>R</div>
      </aside>

      <main style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              Tuesday · 12 May · Zone 7b
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, color: 'var(--ink-2)', marginTop: 6 }}>
              The Cottage Patch
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--terracotta)', marginLeft: 14, transform: 'rotate(-2deg)', display: 'inline-block' }}>~ in flower ~</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost"><PencilGlyph size={14} /> Edit map</button>
            <button className="btn-primary"><PlusGlyph size={14} /> New bed</button>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', border: '1.5px solid var(--ink)', background: 'var(--cream)', borderRadius: 4, padding: 4, minHeight: 480 }}>
          <div style={{ position: 'absolute', top: 14, right: 18, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1">
              <circle cx="24" cy="24" r="20" />
              <path d="M24 4 L 28 24 L 24 44 L 20 24 Z" fill="var(--terracotta)" stroke="var(--ink)" />
              <text x="24" y="11" textAnchor="middle" fontFamily="DM Serif Display" fontSize="9" fill="var(--ink)">N</text>
            </svg>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>1 sq = 1 ft²</div>
          </div>

          <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <pattern id="grass" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="var(--cream)" />
                <circle cx="3" cy="3" r="0.4" fill="var(--rule)" />
              </pattern>
              <pattern id="path" patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill="var(--paper-2)" />
                <path d="M 0 8 L 8 0" stroke="var(--rule)" strokeWidth="0.4" />
              </pattern>
            </defs>

            <rect width="800" height="460" fill="url(#grass)" />
            <path d="M 30 30 L 770 30 L 770 430 L 30 430 Z" fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 4" />
            <rect x="30" y="220" width="740" height="14" fill="url(#path)" />

            {beds.map((b) => (
              <g key={b.id}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="var(--paper-2)" stroke={b.color} strokeWidth="1.5" rx="3" />
                <rect x={b.x + 4} y={b.y + 4} width={b.w - 8} height={b.h - 8} fill="none" stroke={b.color} strokeWidth="0.4" strokeDasharray="1 2" />
                <g transform={`translate(${b.x + 8} ${b.y + 8})`}>
                  <rect x="0" y="0" width="56" height="22" fill="var(--cream)" stroke={b.color} strokeWidth="0.8" rx="2" />
                  <text x="28" y="15" textAnchor="middle" fontFamily="DM Serif Display" fontSize="13" fill={b.color}>Bed {b.id}</text>
                </g>
                <text x={b.x + b.w/2} y={b.y + b.h - 10} textAnchor="middle" fontFamily="Roboto Slab" fontSize="10" fontWeight="600" fill="var(--ink-soft)" letterSpacing="0.06em">
                  {b.name.split('·')[1].trim().toUpperCase()}
                </text>
                <text x={b.x + b.w - 10} y={b.y + 18} textAnchor="end" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink-faint)">{b.plants} plants</text>
              </g>
            ))}

            <Pin x={560} y={130} label="T" color="var(--terracotta)" />
            <Pin x={610} y={140} label="T" color="var(--terracotta)" />
            <Pin x={660} y={150} label="T" color="var(--terracotta)" />
            <Pin x={580} y={200} label="B" color="var(--terracotta)" />
            <Pin x={650} y={220} label="B" color="var(--terracotta)" />

            <g transform="translate(680 410)">
              <circle r="14" fill="#cdab82" stroke="var(--ink)" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="var(--ink)">COMP</text>
            </g>
            <g transform="translate(60 420)">
              <rect x="-14" y="-8" width="28" height="16" fill="var(--sky)" fillOpacity="0.4" stroke="var(--ink)" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="var(--ink)">RAIN</text>
            </g>

            <g transform="translate(420 360)" fontFamily="Caveat" fontSize="18" fill="var(--terracotta)">
              <text>flowering today!</text>
              <path d="M 0 -10 Q 30 -28, 80 -42" fill="none" stroke="var(--terracotta)" strokeWidth="1.2" />
              <path d="M 76 -44 L 80 -42 L 78 -38" fill="none" stroke="var(--terracotta)" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: 16, border: '1px solid var(--rule)', background: 'var(--cream)' }}>
          {[
            { num: '24', label: 'Plants', sub: '+2 this week' },
            { num: '6', label: 'Beds', sub: '128 sq ft' },
            { num: '17', label: 'Harvested', sub: 'May to date' },
            { num: '92', label: 'Day streak', sub: 'since Feb 9' },
          ].map((s, i) => (
            <div key={i} style={{ padding: 16, borderRight: i < 3 ? '1px solid var(--rule)' : 'none', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="numeral" style={{ fontSize: 36, lineHeight: 0.9, color: i === 3 ? 'var(--forest)' : 'var(--terracotta)' }}>{s.num}</span>
                <span style={{ fontFamily: 'var(--font-slab)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{s.label}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', marginTop: 4, letterSpacing: '0.06em' }}>{s.sub}</span>
            </div>
          ))}
        </div>
      </main>

      <aside style={{ borderLeft: '1px solid var(--rule)', padding: '24px 24px', overflow: 'auto', background: 'var(--paper-2)' }}>
        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', padding: 18, position: 'relative' }}>
          <div className="washi" style={{ width: 50, height: 14, top: -6, left: 16, transform: 'rotate(-3deg)' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-faint)' }}>SKY · TUE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="numeral" style={{ fontSize: 56, lineHeight: 0.9, color: 'var(--terracotta)' }}>72°</span>
            <SunGlyph size={28} color="var(--honey)" />
          </div>
          <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>Partly sunny · light winds from the SW</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--rule)' }}>
            {[
              { d: 'W', t: 70, ic: SunGlyph, c: 'var(--honey)' },
              { d: 'T', t: 68, ic: CloudGlyph, c: 'var(--ink-faint)' },
              { d: 'F', t: 64, ic: DropGlyph, c: 'var(--sky)' },
              { d: 'S', t: 71, ic: SunGlyph, c: 'var(--honey)' },
              { d: 'S', t: 75, ic: SunGlyph, c: 'var(--honey)' },
            ].map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faint)' }}>{d.d}</div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0', color: d.c }}><d.ic size={14} /></div>
                <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, fontWeight: 600 }}>{d.t}°</div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-2)', marginTop: 28, marginBottom: 4 }}>To tend, today</h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>5 TASKS · 2 DONE</div>
        <hr className="dotted-rule" style={{ marginTop: 8 }} />
        {[
          { time: '07:00', kind: 'Water Bed III', done: true },
          { time: '10:00', kind: 'Prune lavender hedge', done: false },
          { time: '14:00', kind: 'Sow coriander, second succession', done: false },
          { time: '17:30', kind: 'Harvest rainbow chard', done: false },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
            <div style={{ width: 18, height: 18, border: '1.5px solid var(--ink)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? 'var(--ink)' : 'transparent', color: 'var(--cream)', flexShrink: 0 }}>
              {t.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6 L 5 9 L 10 3" /></svg>}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', width: 38, flexShrink: 0 }}>{t.time}</span>
            <span style={{ fontFamily: 'var(--font-slab)', fontSize: 13, color: t.done ? 'var(--ink-faint)' : 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.kind}</span>
          </div>
        ))}

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-2)', marginTop: 28, marginBottom: 4 }}>Patches nearby</h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>3 NEW POSTS</div>
        <hr className="dotted-rule" style={{ marginTop: 8, marginBottom: 12 }} />
        {[
          { name: 'June M.', ago: '2h', what: 'first ripe strawberry', initial: 'J', color: 'var(--berry)' },
          { name: 'Henrik P.', ago: '6h', what: 'aphid scout report', initial: 'H', color: 'var(--forest)' },
          { name: 'Ada V.', ago: '1d', what: 'sourdough discard fertiliser?', initial: 'A', color: 'var(--rust)' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: f.color, color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14 }}>{f.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-slab)', fontSize: 13, fontWeight: 600 }}>{f.name}</div>
              <div style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.what}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>{f.ago}</div>
          </div>
        ))}
      </aside>
    </PaperBackdrop>
  )
}
