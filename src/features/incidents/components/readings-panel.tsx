import type { Incident } from '@/shared/api/types'
import { TemperatureChart } from '@/shared/patterns/temperature-chart'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui/panel'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { useIncidentReadings } from '../api/sensor-readings'

export function ReadingsPanel({ incident }: { readonly incident: Incident }) {
  const { readings, profile } = useIncidentReadings(
    incident.sensorId,
    incident.createdAt,
    incident.closedAt,
    true,
  )
  const items = readings.data?.items ?? []
  const points = items
    .map((item) => ({
      time: new Date(item.recordedAt).getTime(),
      value: item.value,
      flagged: item.breached,
    }))
    .sort((a, b) => a.time - b.time)
  const latest = items[0]
  const unit = items[0]?.unit === 'CELSIUS' || !items[0] ? '°C' : (items[0]?.unit ?? '°C')
  const band = profile.data
    ? { min: profile.data.minTemperature, max: profile.data.maxTemperature }
    : undefined

  return (
    <Panel aria-labelledby="readings-title">
      <PanelHeader>
        <h2 id="readings-title" className="text-heading-3 font-semibold">
          Temperatura del sensor
        </h2>
        {latest && (
          <span className="ml-auto font-mono text-heading-2 text-fg">
            {latest.value.toFixed(1)} {unit}
          </span>
        )}
      </PanelHeader>
      <PanelBody className="flex flex-col gap-2">
        {readings.isPending && <LoadingState label="Cargando lecturas…" />}
        {readings.isError && (
          <ErrorState error={readings.error} onRetry={() => void readings.refetch()} />
        )}
        {readings.data && points.length === 0 && (
          <EmptyState title="Sin lecturas en este período">
            El sensor no ha enviado lecturas desde 2 h antes del incidente.
          </EmptyState>
        )}
        {points.length > 0 && (
          <TemperatureChart points={points} band={band} unit={unit} latest={latest} />
        )}
      </PanelBody>
    </Panel>
  )
}
