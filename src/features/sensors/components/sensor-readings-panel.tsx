import { useState } from 'react'
import type { Sensor } from '@/shared/api/types'
import { TemperatureChart } from '@/shared/patterns/temperature-chart'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui/panel'
import { SelectField } from '@/shared/ui/select'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { useSensorReadings } from '../api/sensors'

// The backend caps the range at 7 days.
const RANGES = [
  { hours: 1, label: 'Última hora' },
  { hours: 6, label: 'Últimas 6 horas' },
  { hours: 24, label: 'Últimas 24 horas' },
  { hours: 168, label: 'Últimos 7 días' },
]

interface SensorReadingsPanelProps {
  readonly sensor: Sensor
  readonly headingRef: React.Ref<HTMLHeadingElement>
}

export function SensorReadingsPanel({ sensor, headingRef }: SensorReadingsPanelProps) {
  const [hours, setHours] = useState(24)
  const { readings, profile } = useSensorReadings(sensor.id, hours)
  const items = readings.data?.items ?? []
  const points = items
    .map((item) => ({
      time: new Date(item.recordedAt).getTime(),
      value: item.value,
      flagged: item.breached,
    }))
    .sort((a, b) => a.time - b.time)
  const latest = items[0]
  const unit = !latest || latest.unit === 'CELSIUS' ? '°C' : latest.unit
  const band = profile.data
    ? { min: profile.data.minTemperature, max: profile.data.maxTemperature }
    : undefined

  return (
    <Panel aria-labelledby="sensor-readings-title">
      <PanelHeader>
        <h2
          id="sensor-readings-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-heading-3 font-semibold"
        >
          Temperatura · {sensor.serialNumber}
        </h2>
        <div className="ml-auto flex items-end gap-3">
          {latest && (
            <span className="font-mono text-heading-2 text-fg">
              {latest.value.toFixed(1)} {unit}
            </span>
          )}
          <div className="w-44">
            <SelectField
              label="Período"
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
            >
              {RANGES.map((range) => (
                <option key={range.hours} value={range.hours}>
                  {range.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-2">
        {readings.isPending && <LoadingState label="Cargando lecturas…" />}
        {readings.isError && (
          <ErrorState error={readings.error} onRetry={() => void readings.refetch()} />
        )}
        {readings.data && points.length === 0 && (
          <EmptyState title="Sin lecturas en este período">
            El sensor no envió lecturas en el período elegido.
          </EmptyState>
        )}
        {points.length > 0 && (
          <TemperatureChart
            points={points}
            band={band}
            unit={unit}
            latest={latest}
            longRange={hours > 24}
          />
        )}
        {readings.data?.hasMore && (
          <p className="text-caption text-fg-muted">
            Se muestran las 100 lecturas más recientes del período.
          </p>
        )}
      </PanelBody>
    </Panel>
  )
}
