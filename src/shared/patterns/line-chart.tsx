import { useEffect, useRef, useState } from 'react'

export interface ChartPoint {
  time: number
  value: number
  /** Drawn as a marker (for example a reading outside its safe range). */
  flagged?: boolean
}

interface LineChartProps {
  readonly points: readonly ChartPoint[]
  readonly band?: { readonly min: number; readonly max: number }
  readonly unit: string
  readonly ariaLabel: string
  readonly formatTime: (time: number) => string
}

const H = 220
const PAD = { left: 40, right: 12, top: 18, bottom: 26 }
const FALLBACK_WIDTH = 640

/** Round tick values (1, 2, 5 × 10ⁿ) covering [min, max]. */
function niceTicks(min: number, max: number, target = 4): number[] {
  const rough = (max - min) / target || 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = ([1, 2, 5, 10].find((m) => m * magnitude >= rough) ?? 10) * magnitude
  const first = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let tick = first; tick <= max + step / 1e6; tick += step) ticks.push(Number(tick.toFixed(6)))
  return ticks
}

/** The drawing is as wide as its container, so text keeps its real size at any width. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(FALLBACK_WIDTH)
  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0)
      if (next > 0) setWidth(next)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { ref, width }
}

/** Single-series line over time with an optional safe band. Colors come from tokens via classes. */
export function LineChart({ points, band, unit, ariaLabel, formatTime }: LineChartProps) {
  const { ref, width } = useWidth()
  const times = points.map((p) => p.time)
  const values = [...points.map((p) => p.value), ...(band ? [band.min, band.max] : [])]
  const t0 = Math.min(...times)
  const t1 = Math.max(...times)
  const spread = Math.max(...values) - Math.min(...values) || 1
  const v0 = Math.min(...values) - spread * 0.1
  const v1 = Math.max(...values) + spread * 0.1

  const x = (t: number) => PAD.left + ((t - t0) / (t1 - t0 || 1)) * (width - PAD.left - PAD.right)
  const y = (v: number) => H - PAD.bottom - ((v - v0) / (v1 - v0)) * (H - PAD.top - PAD.bottom)

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={H} role="img" aria-label={ariaLabel}>
        {band && (
          <rect
            x={PAD.left}
            y={y(band.max)}
            width={width - PAD.left - PAD.right}
            height={y(band.min) - y(band.max)}
            className="fill-success-subtle stroke-success"
            strokeDasharray="4 4"
          />
        )}
        {niceTicks(v0, v1).map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border"
            />
            <text
              x={PAD.left - 6}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-fg-muted font-mono text-code"
            >
              {tick}
            </text>
          </g>
        ))}
        <polyline
          points={points.map((p) => `${x(p.time)},${y(p.value)}`).join(' ')}
          className="fill-none stroke-accent"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {points.map(
          (p, index) =>
            p.flagged && (
              <circle
                key={index}
                cx={x(p.time)}
                cy={y(p.value)}
                r="3.5"
                className="fill-danger stroke-surface"
              />
            ),
        )}
        <text x={PAD.left} y={H - 6} className="fill-fg-muted font-mono text-code">
          {formatTime(t0)}
        </text>
        <text
          x={width - PAD.right}
          y={H - 6}
          textAnchor="end"
          className="fill-fg-muted font-mono text-code"
        >
          {formatTime(t1)}
        </text>
        <text
          x={PAD.left - 6}
          y={11}
          textAnchor="end"
          className="fill-fg-muted font-mono text-code"
        >
          {unit}
        </text>
      </svg>
    </div>
  )
}
