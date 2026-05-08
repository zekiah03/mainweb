'use client'
import { AXIS_KEYS, AXIS_META, AxisKey } from '@/lib/twin-types'

interface TwinRadarProps {
  axes12: Record<AxisKey, number>
  confidence?: Record<AxisKey, number>
  size?: number
}

export function TwinRadar({ axes12, confidence, size = 280 }: TwinRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 44
  const n = AXIS_KEYS.length

  function pt(i: number, r: number) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const shapePoints = AXIS_KEYS.map((key, i) => pt(i, ((axes12[key] ?? 0) / 10) * maxR))
  const shapePath = shapePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {[2, 4, 6, 8, 10].map(level => (
        <circle
          key={level} cx={cx} cy={cy} r={(level / 10) * maxR}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
      ))}

      {AXIS_KEYS.map((key, i) => {
        const end = pt(i, maxR)
        return (
          <line key={key} x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          />
        )
      })}

      <path d={shapePath} fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.6)" strokeWidth="2" />

      {AXIS_KEYS.map((key, i) => {
        const val = axes12[key] ?? 0
        if (val === 0) return null
        const p = pt(i, (val / 10) * maxR)
        const conf = confidence?.[key] ?? 0
        return (
          <circle key={key} cx={p.x} cy={p.y} r={3}
            fill={AXIS_META[key].color} opacity={0.4 + conf * 0.6}
          />
        )
      })}

      {AXIS_KEYS.map((key, i) => {
        const p = pt(i, maxR + 22)
        return (
          <text key={key} x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="700" fill={AXIS_META[key].color}
          >
            {key}
          </text>
        )
      })}
    </svg>
  )
}
