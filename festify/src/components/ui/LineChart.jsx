import { useEffect, useMemo, useRef, useState } from 'react'
import { formatNumber, formatShortDate } from '@/utils/format'

/**
 * Grafik garis ringan berbasis SVG (tanpa library).
 * series: [{ key, label, color }], data: [{ date, [key]: number }]
 */
export default function LineChart({ data = [], series = [], height = 240 }) {
  const [hover, setHover] = useState(null)
  const wrap = useRef(null)
  const [W, setW] = useState(720)
  useEffect(() => {
    if (!wrap.current) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [data.length > 0])
  const H = height
  const pad = { l: 44, r: 12, t: 12, b: 28 }
  const max = useMemo(() => Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0))), [data, series])
  const niceMax = Math.ceil(max / 5) * 5 || 5
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1)
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / niceMax)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f))
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(W / 120)))

  if (!data.length) return <p className="text-sm text-muted">Belum ada data.</p>

  return (
    <div className="chart" ref={wrap}>
      <div className="chart__legend">
        {series.map((s) => (
          <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Grafik ${series.map((s) => s.label).join(', ')}`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="chart__grid" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text className="chart__axis" x={pad.l - 8} y={y(t) + 4} textAnchor="end">{formatNumber(t)}</text>
          </g>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.date} className="chart__axis" x={x(i)} y={H - 6} textAnchor="middle">{formatShortDate(d.date)}</text>
          ) : null,
        )}
        {series.map((s) => {
          const pts = data.map((d, i) => `${x(i)},${y(d[s.key] || 0)}`).join(' ')
          return (
            <g key={s.key}>
              <polygon points={`${x(0)},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}`} fill={s.color} opacity="0.08" />
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          )
        })}
        {data.map((d, i) => (
          <rect key={d.date} x={x(i) - (W / data.length) / 2} y={pad.t} width={W / data.length} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover != null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#c9c1cf" />
            {series.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(data[hover][s.key] || 0)} r="4.5" fill="#fff" stroke={s.color} strokeWidth="2.5" />
            ))}
            <g transform={`translate(${Math.min(x(hover) + 10, W - 170)}, ${pad.t + 4})`}>
              <rect width="160" height={22 + series.length * 18} rx="8" fill="#1c1326" />
              <text className="chart__tip" x="10" y="16" fill="#fff" fontWeight="600">{formatShortDate(data[hover].date)}</text>
              {series.map((s, si) => (
                <text key={s.key} className="chart__tip" x="10" y={34 + si * 18} fill="#e7e0e6">
                  <tspan fill={s.color}>●</tspan> {s.label}: {formatNumber(data[hover][s.key])}
                </text>
              ))}
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
