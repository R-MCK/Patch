import type { CSSProperties, ReactNode } from 'react'

interface GlyphProps {
  size?: number
  color?: string
  stroke?: number
  children?: ReactNode
  viewBox?: string
  style?: CSSProperties
}

export const Glyph = ({ size = 24, color = 'currentColor', stroke = 1.5, children, viewBox = '0 0 24 24', style }: GlyphProps) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
)

type P = Omit<GlyphProps, 'children' | 'viewBox'>

export const LeafGlyph = (p: P) => (<Glyph {...p}><path d="M4 20 C 4 12, 10 4, 20 4 C 20 14, 12 20, 4 20 Z" /><path d="M4 20 L 18 6" /></Glyph>)
export const SeedlingGlyph = (p: P) => (<Glyph {...p}><path d="M12 22 L 12 12" /><path d="M12 12 C 12 8, 8 6, 4 8 C 4 12, 8 14, 12 12 Z" /><path d="M12 12 C 12 7, 16 4, 20 6 C 20 11, 16 13, 12 12 Z" /><path d="M8 22 L 16 22" /></Glyph>)
export const FlowerGlyph = (p: P) => (<Glyph {...p}><circle cx="12" cy="9" r="2" /><path d="M12 9 C 9 6, 9 3, 12 3 C 15 3, 15 6, 12 9" /><path d="M12 9 C 15 6, 18 6, 18 9 C 18 12, 15 12, 12 9" /><path d="M12 9 C 9 12, 6 12, 6 9 C 6 6, 9 6, 12 9" /><path d="M12 9 C 15 12, 15 15, 12 15 C 9 15, 9 12, 12 9" /><path d="M12 15 L 12 22" /><path d="M12 19 C 14 18, 16 18, 16 20" /></Glyph>)
export const SunGlyph = (p: P) => (<Glyph {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2 L 12 5 M12 19 L 12 22 M2 12 L 5 12 M19 12 L 22 12 M4.9 4.9 L 7 7 M17 17 L 19.1 19.1 M4.9 19.1 L 7 17 M17 7 L 19.1 4.9" /></Glyph>)
export const MoonGlyph = (p: P) => (<Glyph {...p}><path d="M20 14 A 8 8 0 1 1 10 4 A 6 6 0 0 0 20 14 Z" /></Glyph>)
export const DropGlyph = (p: P) => (<Glyph {...p}><path d="M12 3 C 7 9, 5 13, 5 16 A 7 7 0 0 0 19 16 C 19 13, 17 9, 12 3 Z" /></Glyph>)
export const CloudGlyph = (p: P) => (<Glyph {...p}><path d="M6 17 A 4 4 0 0 1 6 9 A 5 5 0 0 1 16 8 A 4 4 0 0 1 18 17 Z" /></Glyph>)
export const PotGlyph = (p: P) => (<Glyph {...p}><path d="M5 9 L 19 9 L 17 21 L 7 21 Z" /><path d="M4 9 L 20 9" /><path d="M3 6 L 21 6 L 21 9 L 3 9 Z" /></Glyph>)
export const ShovelGlyph = (p: P) => (<Glyph {...p}><path d="M14 3 L 21 10 L 17 14 L 14 11" /><path d="M14 11 L 4 21" /><path d="M3 22 L 6 19" /></Glyph>)
export const ScissorsGlyph = (p: P) => (<Glyph {...p}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 7.5 L 21 20" /><path d="M8.5 16.5 L 21 4" /></Glyph>)
export const SproutGlyph = (p: P) => (<Glyph {...p}><path d="M7 21 C 7 16, 9 12, 12 11" /><path d="M12 11 C 8 11, 5 8, 5 4 C 9 4, 12 7, 12 11 Z" /><path d="M12 11 C 16 11, 19 8, 19 4 C 15 4, 12 7, 12 11 Z" /><path d="M5 21 L 19 21" /></Glyph>)
export const BookGlyph = (p: P) => (<Glyph {...p}><path d="M4 4 L 4 20 L 12 18 L 20 20 L 20 4 L 12 6 Z" /><path d="M12 6 L 12 18" /></Glyph>)
export const MapGlyph = (p: P) => (<Glyph {...p}><path d="M3 7 L 9 5 L 15 7 L 21 5 L 21 17 L 15 19 L 9 17 L 3 19 Z" /><path d="M9 5 L 9 17 M15 7 L 15 19" /></Glyph>)
export const PencilGlyph = (p: P) => (<Glyph {...p}><path d="M3 21 L 7 17 L 17 7 L 21 11 L 11 21 Z" /><path d="M14 4 L 20 10" /><path d="M3 21 L 8 19" /></Glyph>)
export const HomeGlyph = (p: P) => (<Glyph {...p}><path d="M3 11 L 12 3 L 21 11 L 21 21 L 14 21 L 14 14 L 10 14 L 10 21 L 3 21 Z" /></Glyph>)
export const StarGlyph = (p: P) => (<Glyph {...p}><path d="M12 3 L 14.5 9.5 L 21 10 L 16 14.5 L 17.5 21 L 12 17.5 L 6.5 21 L 8 14.5 L 3 10 L 9.5 9.5 Z" /></Glyph>)
export const HeartGlyph = (p: P) => (<Glyph {...p}><path d="M12 21 C 7 17, 3 13, 3 9 A 4 4 0 0 1 12 7 A 4 4 0 0 1 21 9 C 21 13, 17 17, 12 21 Z" /></Glyph>)
export const ChevronRightGlyph = (p: P) => (<Glyph {...p}><path d="M9 5 L 16 12 L 9 19" /></Glyph>)
export const ChevronLeftGlyph = (p: P) => (<Glyph {...p}><path d="M15 5 L 8 12 L 15 19" /></Glyph>)
export const PlusGlyph = (p: P) => (<Glyph {...p}><path d="M12 5 L 12 19 M5 12 L 19 12" /></Glyph>)
export const SearchGlyph = (p: P) => (<Glyph {...p}><circle cx="11" cy="11" r="6" /><path d="M16 16 L 21 21" /></Glyph>)
export const BellGlyph = (p: P) => (<Glyph {...p}><path d="M6 17 C 6 11, 6 7, 12 7 C 18 7, 18 11, 18 17 Z" /><path d="M5 17 L 19 17" /><path d="M10 21 L 14 21" /><path d="M12 7 L 12 5" /></Glyph>)
export const CalendarGlyph = (p: P) => (<Glyph {...p}><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 10 L 21 10" /><path d="M8 3 L 8 7 M16 3 L 16 7" /></Glyph>)

export const SprigDivider = ({ width = 200, color = '#2f4a32' }: { width?: number; color?: string }) => (
  <svg width={width} height="24" viewBox="0 0 200 24" fill="none">
    <line x1="0" y1="12" x2="80" y2="12" stroke={color} strokeWidth="0.5" strokeDasharray="2 3" />
    <line x1="120" y1="12" x2="200" y2="12" stroke={color} strokeWidth="0.5" strokeDasharray="2 3" />
    <g transform="translate(100,12)">
      <path d="M -8 0 L 8 0" stroke={color} strokeWidth="1" />
      <path d="M -10 -2 C -8 -5, -4 -5, -2 -2" stroke={color} strokeWidth="1" fill="none" />
      <path d="M 2 -2 C 4 -5, 8 -5, 10 -2" stroke={color} strokeWidth="1" fill="none" />
      <path d="M -6 2 C -8 5, -12 5, -14 4" stroke={color} strokeWidth="1" fill="none" />
      <path d="M 6 2 C 8 5, 12 5, 14 4" stroke={color} strokeWidth="1" fill="none" />
      <circle cx="0" cy="0" r="1.5" fill={color} />
    </g>
  </svg>
)

export const BotanicalSprig = ({ size = 120, color = '#2f4a32', accent = '#b85c38' }: { size?: number; color?: string; accent?: string }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M60 110 C 60 80, 60 60, 55 30" />
    <path d="M55 30 C 45 25, 35 25, 30 32 C 38 38, 50 36, 55 30 Z" fill={color} fillOpacity="0.06" />
    <path d="M57 45 C 67 40, 77 40, 82 47 C 74 53, 62 51, 57 45 Z" fill={color} fillOpacity="0.06" />
    <path d="M58 60 C 48 55, 38 55, 33 62 C 41 68, 53 66, 58 60 Z" fill={color} fillOpacity="0.06" />
    <path d="M59 75 C 69 70, 79 70, 84 77 C 76 83, 64 81, 59 75 Z" fill={color} fillOpacity="0.06" />
    <path d="M60 90 C 50 85, 40 85, 35 92 C 43 98, 55 96, 60 90 Z" fill={color} fillOpacity="0.06" />
    <circle cx="55" cy="22" r="3" fill={accent} />
    <circle cx="48" cy="18" r="2.5" fill={accent} fillOpacity="0.7" />
    <circle cx="62" cy="18" r="2.5" fill={accent} fillOpacity="0.7" />
    <circle cx="55" cy="13" r="2" fill={accent} fillOpacity="0.5" />
  </svg>
)

export const Monogram = ({ letter = 'P', size = 80, color = '#2f4a32' }: { letter?: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="1 2" />
    <circle cx="40" cy="40" r="28" fill="none" stroke={color} strokeWidth="0.5" />
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 40 40) translate(40 8)`}>
        <path d="M -3 0 C -2 -3, 2 -3, 3 0 C 2 3, -2 3, -3 0 Z" fill={color} fillOpacity="0.6" />
      </g>
    ))}
    <text x="40" y="50" textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="32" fill={color}>{letter}</text>
  </svg>
)

export const VerticalVine = ({ height = 200, color = '#2f4a32' }: { height?: number; color?: string }) => (
  <svg width="40" height={height} viewBox={`0 0 40 ${height}`} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round">
    <path d={`M 20 0 Q 25 ${height/4}, 18 ${height/2} T 22 ${height}`} />
    {Array.from({length: Math.floor(height/30)}).map((_, i) => {
      const y = 15 + i * 30
      const dir = i % 2 === 0 ? 1 : -1
      return (
        <g key={i} transform={`translate(${20 + (i%2===0 ? 2 : -2)} ${y})`}>
          <path d={`M 0 0 Q ${8*dir} -3, ${12*dir} 0 Q ${8*dir} 3, 0 0 Z`} fill={color} fillOpacity="0.1" />
        </g>
      )
    })}
  </svg>
)
