import { Monogram, HomeGlyph, LeafGlyph, MapGlyph, BookGlyph, PencilGlyph, HeartGlyph, SearchGlyph, DropGlyph, SunGlyph } from '../glyphs'
import { PlantArt } from '../plant-art'

export const GardenDesigner = () => {
  const palette = [
    { name: 'Tomato',     family: 'Solanaceae',    color: 'var(--terracotta)', sun: 'full',    sp: '24"', illust: 'tomato' },
    { name: 'Pea',        family: 'Fabaceae',      color: 'var(--berry)',      sun: 'full',    sp: '4"',  illust: 'pea' },
    { name: 'Basil',      family: 'Lamiaceae',     color: 'var(--moss)',       sun: 'full',    sp: '12"', illust: 'basil' },
    { name: 'Chard',      family: 'Amaranthaceae', color: 'var(--rust)',       sun: 'partial', sp: '10"', illust: 'chard' },
    { name: 'Lavender',   family: 'Lamiaceae',     color: 'var(--plum)',       sun: 'full',    sp: '24"', illust: 'lavender' },
    { name: 'Kale',       family: 'Brassicaceae',  color: 'var(--forest)',     sun: 'partial', sp: '18"', illust: 'kale' },
    { name: 'Strawberry', family: 'Rosaceae',      color: 'var(--berry)',      sun: 'full',    sp: '12"', illust: 'strawberry' },
    { name: 'Beet',       family: 'Amaranthaceae', color: 'var(--rust)',       sun: 'full',    sp: '4"',  illust: 'beet' },
    { name: 'Rosemary',   family: 'Lamiaceae',     color: 'var(--moss)',       sun: 'full',    sp: '24"', illust: 'rosemary' },
    { name: 'Mint',       family: 'Lamiaceae',     color: 'var(--moss)',       sun: 'partial', sp: '12"', illust: 'mint' },
  ]

  const placed = [
    { x: 110, y:  70, kind: 'tomato',    label: 'Brandywine T.',  c: 'var(--terracotta)' },
    { x: 200, y:  80, kind: 'tomato',    label: 'Sungold T.',     c: 'var(--honey)' },
    { x: 290, y:  68, kind: 'tomato',    label: 'San Marzano T.', c: 'var(--terracotta)' },
    { x: 130, y: 170, kind: 'basil',     label: 'Genovese B.',    c: 'var(--moss)' },
    { x: 215, y: 175, kind: 'basil',     label: 'Genovese B.',    c: 'var(--moss)' },
    { x: 300, y: 170, kind: 'basil',     label: 'Genovese B.',    c: 'var(--moss)' },
    { x: 380, y: 120, kind: 'lavender',  label: 'English L.',     c: 'var(--plum)' },
  ]

  return (
    <div className="paper-bg" style={{ minHeight: '100vh', fontFamily: 'var(--font-body)', color: 'var(--ink)', display: 'grid', gridTemplateColumns: '64px 280px 1fr 320px' }}>
      <aside style={{ borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
        <Monogram letter="P" size={42} color="var(--forest)" />
        <div style={{ flex: 1, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { Icon: HomeGlyph, label: 'Today', href: '/' },
            { Icon: LeafGlyph, label: 'Plants', href: '/plants' },
            { Icon: MapGlyph, label: 'Gardens', href: '/gardens' },
            { Icon: BookGlyph, label: 'Wiki', href: '/wiki' },
            { Icon: PencilGlyph, active: true, label: 'Designer', href: '/design' },
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

      <aside style={{ borderRight: '1px solid var(--rule)', background: 'var(--paper-2)', padding: '20px 18px', overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>The Drawer</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)', margin: '4px 0 4px' }}>Plant palette</h2>
        <p style={{ fontFamily: 'var(--font-slab)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 14 }}>Drag any plant onto the canvas. Hold ⌥ to drop a row of three.</p>

        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input placeholder="Search 412 plants…" style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid var(--ink)', borderRadius: 999, background: 'var(--cream)', fontFamily: 'var(--font-slab)', fontSize: 12, boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', left: 10, top: 8, color: 'var(--ink-soft)' }}><SearchGlyph size={14} /></div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {['Edible', 'Herb', 'Flower', 'Companion'].map((c, i) => (
            <span key={c} className="chip" style={{ background: i === 0 ? 'var(--ink)' : 'var(--cream)', color: i === 0 ? 'var(--cream)' : 'var(--ink-soft)' }}>{c}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {palette.map((p, i) => (
            <div key={i} className="lift" style={{ background: 'var(--cream)', border: '1.5px solid var(--ink)', borderRadius: 4, padding: 10, cursor: 'grab', boxShadow: '1px 2px 0 var(--ink-soft)' }}>
              <div style={{ height: 64, display: 'flex', justifyContent: 'center', borderBottom: '1px dashed var(--rule)', marginBottom: 6 }}>
                <PlantArt kind={p.illust} size={68} color={p.color} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1, color: 'var(--ink-2)' }}>{p.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faint)', letterSpacing: '0.06em' }}>
                <span>{p.sp}</span>
                <span>{p.sun.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              Designer · Cottage Patch · spring layout
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1, color: 'var(--ink-2)', marginTop: 4 }}>
              Sketch the season
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--terracotta)', marginLeft: 12 }}>~ unsaved ~</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost">Undo</button>
            <button className="btn-ghost">Plan view</button>
            <button className="btn-primary">Save sketch</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'var(--cream)', border: '1px solid var(--rule)', borderRadius: 4, marginBottom: 12, alignItems: 'center' }}>
          {[
            { Icon: PencilGlyph, label: 'Sketch', active: true },
            { Icon: LeafGlyph,   label: 'Plant', active: false },
            { Icon: DropGlyph,   label: 'Water', active: false },
            { Icon: SunGlyph,    label: 'Sun', active: false },
          ].map(({ Icon, label, active }, i) => (
            <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: 'none', borderRadius: 3, cursor: 'pointer', background: active ? 'var(--ink)' : 'transparent', color: active ? 'var(--cream)' : 'var(--ink-soft)', fontFamily: 'var(--font-slab)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Icon size={14} /> {label}
            </button>
          ))}
          <div style={{ width: 1, height: 22, background: 'var(--rule)', margin: '0 6px' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>GRID · 6"</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>ZOOM · 100%</span>
        </div>

        <div style={{ flex: 1, position: 'relative', border: '1.5px solid var(--ink)', background: 'var(--cream)', borderRadius: 4, overflow: 'hidden', minHeight: 520 }}>
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

            <g opacity="0.5">
              <rect x="50" y="50" width="180" height="120" fill="url(#dsoil)" stroke="var(--moss)" strokeWidth="1" rx="4" />
              <text x="60" y="66" fontFamily="DM Serif Display" fontSize="13" fill="var(--moss)">Bed I · Brassicas</text>
              <rect x="50" y="320" width="200" height="140" fill="url(#dsoil)" stroke="var(--rust)" strokeWidth="1" rx="4" />
              <text x="60" y="336" fontFamily="DM Serif Display" fontSize="13" fill="var(--rust)">Bed IV · Roots</text>
              <rect x="490" y="320" width="200" height="140" fill="url(#dsoil)" stroke="var(--moss)" strokeWidth="1" rx="4" />
              <text x="500" y="336" fontFamily="DM Serif Display" fontSize="13" fill="var(--moss)">Trellis · Peas</text>
            </g>

            <g transform="translate(260 70)">
              <rect x="0" y="0" width="430" height="220" fill="url(#dsoil)" stroke="var(--terracotta)" strokeWidth="2" rx="4" />
              {[[0,0],[430,0],[0,220],[430,220]].map((pt, i) => (
                <g key={i} transform={`translate(${pt[0]} ${pt[1]})`}>
                  <rect x="-5" y="-5" width="10" height="10" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.5" />
                </g>
              ))}
              <g transform="translate(10 10)">
                <rect x="0" y="0" width="120" height="26" fill="var(--cream)" stroke="var(--terracotta)" strokeWidth="1.5" rx="2" />
                <text x="60" y="18" textAnchor="middle" fontFamily="DM Serif Display" fontSize="15" fill="var(--terracotta)">Bed III · Tomatoes</text>
              </g>
              <text x="215" y="-6" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink-faint)">10' 6"</text>
              <text x="-12" y="115" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink-faint)" transform="rotate(-90 -12 115)">5' 4"</text>

              {placed.map((pl, i) => (
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

              <g fontFamily="Caveat" fontSize="16" fill="var(--terracotta)">
                <text x="200" y="210">add a row of basil here →</text>
                <path d="M 360 205 Q 380 195, 395 192" fill="none" stroke="var(--terracotta)" strokeWidth="1.2" />
              </g>

              <g transform="translate(360 110)" opacity="0.55">
                <circle r="22" fill="var(--moss)" fillOpacity="0.12" stroke="var(--moss)" strokeWidth="1" strokeDasharray="3 2" />
                <foreignObject x="-22" y="-22" width="44" height="44">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PlantArt kind="basil" size={42} color="var(--moss)" />
                  </div>
                </foreignObject>
              </g>
            </g>

            <g transform="translate(660 470)">
              <circle r="22" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1" />
              <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="var(--terracotta)" stroke="var(--ink)" />
              <text x="0" y="-10" textAnchor="middle" fontFamily="DM Serif Display" fontSize="9" fill="var(--ink)">N</text>
            </g>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 14, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
          <span>7 PLANTS PLACED</span>
          <span>·</span>
          <span>26 SQ FT IN USE</span>
          <span>·</span>
          <span>14 SQ FT FREE</span>
          <span>·</span>
          <span style={{ color: 'var(--moss)' }}>● HEALTHY COMPANION SCHEME</span>
        </div>
      </main>

      <aside style={{ borderLeft: '1px solid var(--rule)', padding: '20px 22px', overflow: 'auto', background: 'var(--paper-2)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>Selected · Bed III</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink-2)', margin: '4px 0 14px' }}>Tomato bed</h2>

        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontFamily: 'var(--font-slab)', fontSize: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>SIZE</div>
              <div style={{ marginTop: 2, fontWeight: 600 }}>10'6" × 5'4"</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>SUN</div>
              <div style={{ marginTop: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><SunGlyph size={12} color="var(--honey)" /> 7+ hrs</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>SOIL</div>
              <div style={{ marginTop: 2, fontWeight: 600 }}>Loam · pH 6.6</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>LAST SOWN</div>
              <div style={{ marginTop: 2, fontWeight: 600 }}>Apr 18</div>
            </div>
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-2)', marginTop: 22, marginBottom: 4 }}>Companion check</h3>
        <hr className="dotted-rule" style={{ marginBottom: 10 }} />
        {[
          { a: 'Tomato', b: 'Basil',    note: 'Improves flavour · repels hornworm', good: true },
          { a: 'Tomato', b: 'Lavender', note: 'Pollinator magnet · neutral roots',  good: true },
          { a: 'Tomato', b: 'Brassica', note: 'Avoid — heavy feeders compete',      good: false },
        ].map((c, i) => (
          <div key={i} style={{ padding: '8px 10px', borderLeft: `3px solid ${c.good ? 'var(--moss)' : 'var(--terracotta)'}`, marginBottom: 6, background: 'var(--cream)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-2)' }}>{c.a} <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>×</span> {c.b}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: c.good ? 'var(--moss)' : 'var(--terracotta)' }}>{c.good ? '✓ GOOD' : '! AVOID'}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-slab)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{c.note}</div>
          </div>
        ))}

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-2)', marginTop: 22, marginBottom: 4 }}>Forecast</h3>
        <hr className="dotted-rule" style={{ marginBottom: 10 }} />
        <div style={{ background: 'var(--cream)', border: '1px solid var(--rule)', padding: 12, fontFamily: 'var(--font-slab)', fontSize: 12, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
          <div><strong style={{ color: 'var(--ink)' }}>First harvest</strong> mid-July · ~84 days</div>
          <div style={{ marginTop: 4 }}><strong style={{ color: 'var(--ink)' }}>Yield</strong> 18–24 lb tomatoes · 200 sprigs basil</div>
          <div style={{ marginTop: 4 }}><strong style={{ color: 'var(--ink)' }}>Water</strong> ~9 gal / week at peak</div>
        </div>

        <div style={{ marginTop: 18, padding: 12, fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--terracotta)', textAlign: 'center', borderTop: '1px dashed var(--rule)' }}>
          ~ leave the SE corner for marigolds ~
        </div>
      </aside>
    </div>
  )
}
