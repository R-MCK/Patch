interface Props {
  kind: string
  size?: number
  color?: string
  accent?: string
}

export const PlantArt = ({ kind, size = 100, color = 'var(--forest)', accent }: Props) => {
  const sw = 1.2
  const stroke = { stroke: color, strokeWidth: sw, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const fill = (c: string, o = 0.35) => ({ stroke: color, strokeWidth: sw, fill: c, fillOpacity: o, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })
  const acc = accent || color

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="illust-sway">
      {kind === 'tomato' && (
        <g>
          <path d="M50 96 C 50 70, 48 50, 50 30" {...stroke} />
          <path d="M50 70 C 36 66, 28 70, 24 78" {...stroke} />
          <path d="M50 55 C 64 51, 72 55, 76 63" {...stroke} />
          <path d="M24 78 C 18 74, 14 76, 14 82 C 20 86, 26 82, 24 78 Z" {...fill(acc, 0.15)} />
          <path d="M76 63 C 82 59, 86 61, 86 67 C 80 71, 74 67, 76 63 Z" {...fill(acc, 0.15)} />
          <circle cx="48" cy="80" r="11" {...fill('var(--terracotta)', 0.85)} />
          <circle cx="62" cy="86" r="8" {...fill('var(--terracotta)', 0.65)} />
          <circle cx="36" cy="88" r="6" {...fill('var(--terracotta)', 0.5)} />
          <path d="M44 72 L 48 68 L 52 72" {...stroke} />
          <path d="M48 68 L 48 64" {...stroke} />
          <path d="M44 76 C 42 78, 42 82, 44 84" stroke="var(--cream)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M50 30 C 38 24, 28 28, 26 38 C 36 40, 46 36, 50 30 Z" {...fill(acc, 0.2)} />
          <path d="M50 30 C 62 24, 72 28, 74 38 C 64 40, 54 36, 50 30 Z" {...fill(acc, 0.2)} />
          <path d="M30 35 L 46 33 M70 35 L 54 33" stroke={color} strokeWidth="0.5" />
        </g>
      )}

      {kind === 'pea' && (
        <g>
          <path d="M76 96 L 76 8" stroke="var(--ink-faint)" strokeWidth="0.5" strokeDasharray="2 3" />
          <path d="M30 96 C 35 80, 50 70, 60 60 C 68 52, 70 38, 65 22" {...stroke} />
          <path d="M55 50 C 50 46, 50 42, 55 40 C 60 42, 60 46, 55 50" {...stroke} />
          <path d="M70 30 C 76 28, 78 32, 75 35" {...stroke} />
          <path d="M40 78 C 30 74, 24 78, 26 86 C 34 88, 42 84, 40 78 Z" {...fill(acc, 0.25)} />
          <path d="M50 64 C 60 60, 66 64, 64 72 C 56 74, 48 70, 50 64 Z" {...fill(acc, 0.25)} />
          <path d="M62 38 C 70 30, 80 30, 86 38 C 80 46, 70 46, 62 38 Z" {...fill('var(--moss)', 0.5)} />
          <circle cx="68" cy="38" r="2.5" {...fill(acc, 0.7)} />
          <circle cx="74" cy="38" r="2.5" {...fill(acc, 0.7)} />
          <circle cx="80" cy="38" r="2.5" {...fill(acc, 0.7)} />
          <path d="M40 24 C 36 18, 42 14, 46 18 C 44 22, 48 26, 44 28 C 38 28, 36 24, 40 24 Z" {...fill('var(--berry)', 0.5)} />
        </g>
      )}

      {kind === 'basil' && (
        <g>
          <path d="M50 96 L 50 24" {...stroke} />
          {[{y: 78}, {y: 56}, {y: 34}].map((p, i) => (
            <g key={i}>
              <path d={`M50 ${p.y} C 32 ${p.y - 2}, 22 ${p.y + 4}, 22 ${p.y + 12} C 36 ${p.y + 14}, 48 ${p.y + 6}, 50 ${p.y} Z`} {...fill(acc, 0.3)} />
              <path d={`M50 ${p.y} C 68 ${p.y - 2}, 78 ${p.y + 4}, 78 ${p.y + 12} C 64 ${p.y + 14}, 52 ${p.y + 6}, 50 ${p.y} Z`} {...fill(acc, 0.3)} />
              <path d={`M28 ${p.y + 8} L 46 ${p.y + 4}`} stroke={color} strokeWidth="0.4" />
              <path d={`M72 ${p.y + 8} L 54 ${p.y + 4}`} stroke={color} strokeWidth="0.4" />
            </g>
          ))}
          <path d="M50 24 L 50 12" {...stroke} />
          {[14, 18, 22].map((y, i) => <circle key={i} cx="50" cy={y} r="1.6" {...fill('var(--cream)', 0.9)} />)}
        </g>
      )}

      {kind === 'chard' && (
        <g>
          <path d="M28 96 L 36 36" {...{...stroke, stroke: 'var(--rust)', strokeWidth: 2}} />
          <path d="M40 96 L 44 28" {...{...stroke, stroke: 'var(--honey)', strokeWidth: 2}} />
          <path d="M52 96 L 52 24" {...{...stroke, stroke: 'var(--cream)', strokeWidth: 2}} />
          <path d="M64 96 L 60 30" {...{...stroke, stroke: 'var(--terracotta)', strokeWidth: 2}} />
          <path d="M76 96 L 70 36" {...{...stroke, stroke: 'var(--berry)', strokeWidth: 2}} />
          <path d="M36 36 C 18 32, 10 42, 14 56 C 20 60, 28 56, 36 36 Z" {...fill('var(--forest)', 0.45)} />
          <path d="M44 28 C 28 18, 22 28, 28 38 C 36 40, 44 32, 44 28 Z" {...fill('var(--moss)', 0.5)} />
          <path d="M52 24 C 50 8, 60 6, 66 14 C 64 24, 56 26, 52 24 Z" {...fill('var(--forest)', 0.5)} />
          <path d="M60 30 C 76 22, 84 32, 78 42 C 70 44, 62 36, 60 30 Z" {...fill('var(--moss)', 0.45)} />
          <path d="M70 36 C 86 38, 92 48, 86 58 C 78 60, 70 50, 70 36 Z" {...fill('var(--forest)', 0.4)} />
          <path d="M14 50 L 32 42" stroke={color} strokeWidth="0.4" />
          <path d="M86 52 L 72 44" stroke={color} strokeWidth="0.4" />
        </g>
      )}

      {kind === 'lavender' && (
        <g>
          {[{x: 30, t: -8}, {x: 50, t: 0}, {x: 70, t: 8}].map((s, i) => (
            <g key={i} transform={`rotate(${s.t} ${s.x} 90)`}>
              <path d={`M${s.x} 96 L ${s.x} 30`} {...stroke} />
              <path d={`M${s.x} 70 L ${s.x - 6} 67`} {...stroke} />
              <path d={`M${s.x} 70 L ${s.x + 6} 67`} {...stroke} />
              <path d={`M${s.x} 50 L ${s.x - 6} 47`} {...stroke} />
              <path d={`M${s.x} 50 L ${s.x + 6} 47`} {...stroke} />
              {[0, 1, 2, 3, 4, 5, 6].map(b => (
                <ellipse key={b} cx={s.x + (b%2 === 0 ? -2.5 : 2.5)} cy={28 - b*3} rx="2.2" ry="2.8" {...fill('var(--plum)', 0.55)} />
              ))}
              <ellipse cx={s.x} cy="8" rx="2" ry="3" {...fill('var(--plum)', 0.7)} />
            </g>
          ))}
        </g>
      )}

      {kind === 'kale' && (
        <g>
          <path d="M50 96 L 50 60" {...stroke} />
          {[
            { rot: -65, sz: 1 },
            { rot: -30, sz: 1.05 },
            { rot: 0, sz: 1.1 },
            { rot: 30, sz: 1.05 },
            { rot: 65, sz: 1 },
          ].map((l, i) => (
            <g key={i} transform={`rotate(${l.rot} 50 60) translate(0 -${30 * l.sz})`}>
              <path d="M50 30 C 34 28, 24 22, 28 8 C 36 4, 44 6, 50 12 C 56 6, 64 4, 72 8 C 76 22, 66 28, 50 30 Z" {...fill('var(--forest)', 0.5)} />
              <path d="M50 12 L 50 30" stroke={color} strokeWidth="0.5" />
              <path d="M40 14 L 48 20 M60 14 L 52 20" stroke={color} strokeWidth="0.4" />
              <path d="M30 16 Q 33 14, 36 16 Q 33 18, 30 16" stroke={color} strokeWidth="0.4" fill="none" />
              <path d="M64 16 Q 67 14, 70 16 Q 67 18, 64 16" stroke={color} strokeWidth="0.4" fill="none" />
            </g>
          ))}
        </g>
      )}

      {kind === 'strawberry' && (
        <g>
          <path d="M28 56 L 50 48" {...stroke} />
          <path d="M70 58 L 50 48" {...stroke} />
          <path d="M50 35 L 50 48" {...stroke} />
          <path d="M28 56 C 14 50, 12 38, 22 32 C 30 36, 32 50, 28 56 Z" {...fill('var(--moss)', 0.4)} />
          <path d="M70 58 C 84 52, 86 40, 76 34 C 68 38, 66 52, 70 58 Z" {...fill('var(--moss)', 0.4)} />
          <path d="M50 35 C 38 28, 38 14, 50 10 C 62 14, 62 28, 50 35 Z" {...fill('var(--moss)', 0.4)} />
          <path d="M22 36 L 28 50" stroke={color} strokeWidth="0.4" />
          <path d="M76 38 L 70 52" stroke={color} strokeWidth="0.4" />
          <path d="M50 14 L 50 32" stroke={color} strokeWidth="0.4" />
          <path d="M50 60 C 36 62, 32 78, 50 92 C 68 78, 64 62, 50 60 Z" {...fill('var(--berry)', 0.7)} />
          <path d="M44 60 L 42 55 M50 58 L 50 53 M56 60 L 58 55" stroke={color} strokeWidth="1" />
          {[[42,72],[50,70],[58,72],[44,82],[52,80],[60,82],[48,88],[46,76],[54,76],[40,78]].map((s, i) => (
            <ellipse key={i} cx={s[0]} cy={s[1]} rx="0.7" ry="1.2" fill="var(--honey)" />
          ))}
          <path d="M40 68 C 38 72, 38 78, 40 82" stroke="var(--cream)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {kind === 'beet' && (
        <g>
          <path d="M44 50 C 28 48, 22 36, 32 22 C 40 24, 46 38, 44 50 Z" {...fill('var(--moss)', 0.5)} />
          <path d="M50 46 C 50 26, 56 12, 68 16 C 70 30, 60 44, 50 46 Z" {...fill('var(--moss)', 0.5)} />
          <path d="M56 50 C 70 48, 78 38, 72 24 C 64 26, 56 38, 56 50 Z" {...fill('var(--forest)', 0.45)} />
          <path d="M32 22 C 38 32, 42 42, 44 50" stroke="var(--berry)" strokeWidth="1" fill="none" />
          <path d="M68 16 C 60 28, 54 40, 50 46" stroke="var(--berry)" strokeWidth="1" fill="none" />
          <path d="M72 24 C 66 34, 60 44, 56 50" stroke="var(--berry)" strokeWidth="1" fill="none" />
          <path d="M50 50 C 32 50, 26 70, 50 88 C 74 70, 68 50, 50 50 Z" {...fill('var(--berry)', 0.75)} />
          <path d="M50 88 L 50 96" {...stroke} />
          <path d="M50 90 C 47 92, 45 92, 43 94" {...{...stroke, strokeWidth: 0.6}} />
          <path d="M40 60 C 36 66, 36 76, 40 82" stroke="var(--cream)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M38 64 C 42 70, 42 78, 38 84" stroke="var(--ink)" strokeWidth="0.3" fill="none" opacity="0.4" />
          <path d="M62 64 C 58 70, 58 78, 62 84" stroke="var(--ink)" strokeWidth="0.3" fill="none" opacity="0.4" />
        </g>
      )}

      {kind === 'sunflower' && (
        <g>
          <path d="M50 96 L 50 50" {...{...stroke, strokeWidth: 2}} />
          <path d="M50 70 C 30 64, 18 70, 16 82 C 30 88, 46 80, 50 70 Z" {...fill('var(--moss)', 0.45)} />
          <path d="M50 60 C 70 54, 82 60, 84 72 C 70 78, 54 70, 50 60 Z" {...fill('var(--moss)', 0.45)} />
          {Array.from({length: 14}).map((_, i) => {
            const a = (i / 14) * Math.PI * 2
            return <ellipse key={i} cx={50 + 18 * Math.cos(a)} cy={32 + 18 * Math.sin(a)} rx="6" ry="3" transform={`rotate(${(a * 180/Math.PI)} ${50 + 18 * Math.cos(a)} ${32 + 18 * Math.sin(a)})`} {...fill('var(--honey)', 0.7)} />
          })}
          <circle cx="50" cy="32" r="11" {...fill('var(--ink)', 0.85)} />
          <circle cx="50" cy="32" r="6" stroke="var(--cream)" strokeWidth="0.4" fill="none" />
        </g>
      )}

      {kind === 'rosemary' && (
        <g>
          <path d="M50 96 L 50 16" {...stroke} />
          {Array.from({length: 16}).map((_, i) => {
            const y = 90 - i * 5
            const dir = i % 2 === 0 ? 1 : -1
            return <path key={i} d={`M50 ${y} L ${50 + dir * 14} ${y - 6}`} stroke={color} strokeWidth="0.9" />
          })}
        </g>
      )}

      {kind === 'mint' && (
        <g>
          <path d="M50 96 L 50 18" {...stroke} />
          {[{y: 80}, {y: 60}, {y: 40}, {y: 22}].map((p, i) => (
            <g key={i}>
              <path d={`M50 ${p.y} C 36 ${p.y - 6}, 26 ${p.y - 4}, 24 ${p.y + 4} C 32 ${p.y + 8}, 44 ${p.y + 4}, 50 ${p.y} Z`} {...fill('var(--moss)', 0.45)} />
              <path d={`M50 ${p.y} C 64 ${p.y - 6}, 74 ${p.y - 4}, 76 ${p.y + 4} C 68 ${p.y + 8}, 56 ${p.y + 4}, 50 ${p.y} Z`} {...fill('var(--moss)', 0.45)} />
              <path d={`M30 ${p.y + 2} L 32 ${p.y - 1} M36 ${p.y - 2} L 38 ${p.y - 5}`} stroke={color} strokeWidth="0.4" />
              <path d={`M70 ${p.y + 2} L 68 ${p.y - 1} M64 ${p.y - 2} L 62 ${p.y - 5}`} stroke={color} strokeWidth="0.4" />
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

export const PlantIllust = PlantArt
