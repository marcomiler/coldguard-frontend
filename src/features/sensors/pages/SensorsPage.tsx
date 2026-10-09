import { useRef, useState } from 'react'
import { useSession } from '@/features/auth/session'
import { useAssetNames } from '@/shared/api/asset-names'
import type { Sensor, SensorStatus } from '@/shared/api/types'
import { useAutoDismiss } from '@/shared/lib/use-auto-dismiss'
import { Alert } from '@/shared/ui/alert'
import { formatDateTime } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { PageHeader } from '@/shared/patterns/page-header'
import { Pagination } from '@/shared/patterns/pagination'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { SelectField } from '@/shared/ui/select'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useConnectivity, useSensors } from '../api/sensors'
import { ConnectivityBadge } from '../components/connectivity-badge'
import { HistoryPanel } from '../components/history-panel'
import { ProfilePanel } from '../components/profile-panel'
import { RegisterSensorDialog } from '../components/register-sensor-dialog'
import { SensorActions } from '../components/sensor-actions'
import { SensorReadingsPanel } from '../components/sensor-readings-panel'
import { SENSOR_STATUS } from '../components/sensor-status-badge'
import { SensorStatusBadge } from '../components/sensor-status-badge'

export function SensorsPage() {
  const [status, setStatus] = useState<SensorStatus | ''>('')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const notice = useAutoDismiss()
  const isAdmin = useSession((state) => state.session?.roles.includes('PLATFORM_ADMIN'))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const now = useNow()
  const sensors = useSensors(status, page)
  const connectivity = useConnectivity()
  const assetName = useAssetNames(true)

  const byId = new Map(connectivity.data?.items.map((item) => [item.sensorId, item]))
  const lost = connectivity.data?.items.filter((item) => item.connectivityLostAt).length ?? 0
  const reporting = (connectivity.data?.items.length ?? 0) - lost

  // Looked up in the current page so the panel always shows the latest version after a write.
  const selected = sensors.data?.items.find((sensor) => sensor.id === selectedId) ?? null

  function select(sensor: Sensor) {
    setSelectedId(sensor.id)
    // The panel renders after this handler; focus moves once it exists.
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  return (
    <section aria-labelledby="sensors-title" className="flex flex-col gap-5">
      <PageHeader id="sensors-title" title="Sensores">
        {sensors.data && <Badge>{sensors.data.page.totalElements} sensores</Badge>}
        {isAdmin && <Button onClick={() => setRegistering(true)}>Registrar sensor</Button>}
      </PageHeader>

      {notice.message && (
        <Alert tone="success" onDismiss={notice.dismiss}>
          {notice.message}
        </Alert>
      )}

      {connectivity.data && (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <li className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3.5 py-3">
            <span className="text-heading-4 text-fg-muted uppercase">Con señal</span>
            <p className="font-mono text-metric text-fg tabular-nums">{reporting}</p>
          </li>
          <li className="flex flex-col gap-2 rounded-lg border border-l-3 border-border border-l-danger bg-surface px-3.5 py-3">
            <span className="text-heading-4 text-fg-muted uppercase">Sin señal</span>
            <p className="font-mono text-metric text-fg tabular-nums">{lost}</p>
          </li>
          <li className="col-span-2 flex flex-col gap-2 rounded-lg border border-border bg-surface px-3.5 py-3 lg:col-span-1">
            <span className="text-heading-4 text-fg-muted uppercase">Con lecturas</span>
            <p className="font-mono text-metric text-fg tabular-nums">
              {connectivity.data.page.totalElements}
            </p>
          </li>
        </ul>
      )}
      {connectivity.isError && (
        <ErrorState error={connectivity.error} onRetry={() => void connectivity.refetch()} />
      )}

      <Panel aria-labelledby="sensors-list-title">
        <PanelHeader>
          <h2 id="sensors-list-title" className="text-heading-3 font-semibold">
            Listado
          </h2>
          <div className="ml-auto w-48">
            <SelectField
              label="Estado"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as SensorStatus | '')
                setPage(0)
              }}
            >
              <option value="">Todos</option>
              {Object.entries(SENSOR_STATUS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
          </div>
        </PanelHeader>
        {sensors.isPending && <LoadingState label="Cargando sensores…" />}
        {sensors.isError && (
          <ErrorState error={sensors.error} onRetry={() => void sensors.refetch()} />
        )}
        {sensors.data && sensors.data.items.length === 0 && (
          <EmptyState title="No hay sensores con este filtro">
            Cambia el estado para ver otros sensores.
          </EmptyState>
        )}
        {sensors.data && sensors.data.items.length > 0 && (
          <>
            <div aria-busy={sensors.isFetching}>
              <Table caption="Sensores registrados">
                <thead>
                  <tr>
                    <Th>Sensor</Th>
                    <Th>Unidad</Th>
                    <Th>Estado</Th>
                    <Th>Conexión</Th>
                    <Th>Última lectura</Th>
                    <Th>Calibración hasta</Th>
                    <Th>
                      <span className="sr-only">Acciones</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.data.items.map((sensor) => {
                    const link = byId.get(sensor.id)
                    return (
                      <Tr key={sensor.id}>
                        <Td>
                          <span className="font-mono font-semibold">{sensor.serialNumber}</span>
                          {sensor.model && (
                            <span className="block text-caption text-fg-muted">{sensor.model}</span>
                          )}
                        </Td>
                        <Td>{assetName(sensor.assetId)}</Td>
                        <Td>
                          <SensorStatusBadge status={sensor.status} />
                        </Td>
                        <Td>
                          <ConnectivityBadge connectivity={link} now={now} />
                        </Td>
                        <Td className="text-fg-muted">{formatDateTime(link?.lastReadingAt)}</Td>
                        <Td className="text-fg-muted">
                          {formatDateTime(sensor.lastCalibrationValidUntil)}
                        </Td>
                        <Td className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            aria-label={`Ver lecturas del sensor ${sensor.serialNumber}`}
                            onClick={() => select(sensor)}
                          >
                            Ver lecturas
                          </Button>
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
            <div className="border-t border-border p-3">
              <Pagination
                page={page}
                totalPages={sensors.data.page.totalPages}
                onPrevious={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          </>
        )}
      </Panel>
      {selected && (
        <>
          {isAdmin && <SensorActions sensor={selected} onDone={notice.show} />}
          <SensorReadingsPanel key={selected.id} sensor={selected} headingRef={headingRef} />
          <ProfilePanel sensor={selected} canEdit={Boolean(isAdmin)} onDone={notice.show} />
          {isAdmin && <HistoryPanel sensorId={selected.id} />}
        </>
      )}
      {registering && (
        <RegisterSensorDialog onClose={() => setRegistering(false)} onDone={notice.show} />
      )}
    </section>
  )
}
