import { formatDateTime } from '@/shared/lib/format'
import { LineChart, type ChartPoint } from './line-chart'

const time = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })
const dayTime = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

interface TemperatureChartProps {
  readonly points: readonly ChartPoint[]
  readonly band?: { readonly min: number; readonly max: number }
  readonly unit: string
  readonly latest?: { readonly value: number; readonly recordedAt: string }
  /** Use date and time on the axis when the series spans more than a day. */
  readonly longRange?: boolean
}

export function TemperatureChart({ points, band, unit, latest, longRange }: TemperatureChartProps) {
  const bandDescription = band ? `, rango seguro de ${band.min} a ${band.max} ${unit}` : ''
  const ariaLabel = `Temperatura del sensor: ${points.length} lecturas, la última de ${latest?.value.toFixed(1)} ${unit}${bandDescription}`
  const format = longRange ? dayTime : time
  return (
    <>
      <LineChart
        points={points}
        band={band}
        unit={unit}
        formatTime={(t) => format.format(t)}
        ariaLabel={ariaLabel}
      />
      <p className="text-caption text-fg-muted">
        {band && (
          <>
            Franja verde: rango seguro {band.min}–{band.max} {unit}.{' '}
          </>
        )}
        Puntos rojos: lecturas fuera de rango. Última lectura:{' '}
        {latest ? formatDateTime(latest.recordedAt) : '—'}.
      </p>
    </>
  )
}
