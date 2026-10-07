import { useState } from 'react'
import { useSession } from '@/features/auth/session'
import type { Incident, IncidentStatus, Priority } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDateTime, formatDuration } from '@/shared/lib/format'
import { canAccess } from '@/shared/lib/roles'
import { PageHeader } from '@/shared/patterns/page-header'
import { Pagination } from '@/shared/patterns/pagination'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { SelectField } from '@/shared/ui/select'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useIncidentMetrics, useIncidents } from '../api/incidents'
import { IncidentStatusBadge, STATUS_LABELS } from '../components/incident-status-badge'
import { PriorityBadge } from '../components/priority-badge'

const PRIORITIES: Priority[] = ['P1', 'P2', 'P3', 'P4']
const KPI_BAR: Record<Priority, string> = {
  P1: 'border-l-danger',
  P2: 'border-l-warning',
  P3: 'border-l-info',
  P4: 'border-l-neutral',
}
const ROW_BAR: Partial<Record<Priority, string>> = {
  P1: 'border-l-3 border-l-danger',
  P2: 'border-l-3 border-l-warning',
}
const ANOMALY_LABEL: Record<string, string> = {
  HIGH_TEMPERATURE: 'Temperatura alta',
  LOW_TEMPERATURE: 'Temperatura baja',
  CONNECTIVITY_LOST: 'Conectividad perdida',
}

const DAY_MS = 24 * 60 * 60 * 1000

export function IncidentsPage() {
  const roles = useSession((state) => state.session?.roles ?? [])
  const [status, setStatus] = useState<IncidentStatus | ''>('')
  const [page, setPage] = useState(0)
  // Fixed at mount so the query key stays stable.
  const [range] = useState(() => {
    const now = Date.now()
    return { from: new Date(now - DAY_MS).toISOString(), to: new Date(now).toISOString() }
  })

  const filters = { status: status ? [status] : [], priority: [] as Priority[] }
  const incidents = useIncidents(filters, page)
  const metrics = useIncidentMetrics(range, canAccess(roles, 'metrics'))

  return (
    <section aria-labelledby="incidents-title" className="flex flex-col gap-5">
      <PageHeader id="incidents-title" title="Incidentes" />

      {canAccess(roles, 'metrics') && (
        <section aria-labelledby="priority-title" className="flex flex-col gap-2.5">
          <h2 id="priority-title" className="text-heading-4 text-fg-muted uppercase">
            Por prioridad · últimas 24 h
          </h2>
          {metrics.isPending && <LoadingState label="Cargando métricas…" />}
          {metrics.isError && (
            <ErrorState error={metrics.error} onRetry={() => void metrics.refetch()} />
          )}
          {metrics.data && (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PRIORITIES.map((priority) => (
                  <li
                    key={priority}
                    className={cn(
                      'flex animate-enter flex-col gap-2 rounded-lg border border-l-3 border-border bg-surface px-3.5 py-3',
                      KPI_BAR[priority],
                    )}
                  >
                    <span>
                      <PriorityBadge priority={priority} />
                    </span>
                    <p className="font-mono text-metric text-fg tabular-nums">
                      {metrics.data.countByPriority[priority] ?? 0}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-small text-fg-muted">
                Tiempo medio de reconocimiento: {formatDuration(metrics.data.mttaSeconds)} · de
                resolución: {formatDuration(metrics.data.mttrSeconds)}
              </p>
            </>
          )}
        </section>
      )}

      <Panel aria-labelledby="list-title">
        <PanelHeader>
          <h2 id="list-title" className="text-heading-3 font-semibold">
            Listado
          </h2>
          <div className="ml-auto w-44">
            <SelectField
              label="Estado"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as IncidentStatus | '')
                setPage(0)
              }}
            >
              <option value="">Todos</option>
              {(Object.keys(STATUS_LABELS) as IncidentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </SelectField>
          </div>
        </PanelHeader>

        {(incidents.isPending || incidents.isError || incidents.data?.items.length === 0) && (
          <div className="flex flex-col gap-3 p-3.5">
            {incidents.isPending && <LoadingState label="Cargando incidentes…" />}
            {incidents.isError && (
              <ErrorState error={incidents.error} onRetry={() => void incidents.refetch()} />
            )}
            {incidents.data?.items.length === 0 && (
              <EmptyState title="No hay incidentes con este filtro">
                Cuando un sensor salga de rango se creará un incidente automáticamente.
              </EmptyState>
            )}
          </div>
        )}
        {incidents.data && incidents.data.items.length > 0 && (
          <>
            <IncidentTable items={incidents.data.items} busy={incidents.isFetching} />
            <div className="border-t border-border p-3">
              <Pagination
                page={page}
                totalPages={incidents.data.page.totalPages}
                onPrevious={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          </>
        )}
      </Panel>
    </section>
  )
}

function IncidentTable({ items, busy }: { items: Incident[]; busy: boolean }) {
  return (
    <div aria-busy={busy}>
      <Table caption="Incidentes de la cadena de frío">
        <thead>
          <tr>
            <Th>Prior.</Th>
            <Th>Incidente</Th>
            <Th>Anomalía</Th>
            <Th>Estado</Th>
            <Th>Creado</Th>
            <Th>Reconocer antes de</Th>
            <Th className="text-right">Ocurr.</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((incident) => (
            <Tr key={incident.id}>
              <Td className={cn(incident.status !== 'CLOSED' && ROW_BAR[incident.priority])}>
                <PriorityBadge priority={incident.priority} pulse={incident.status === 'CREATED'} />
              </Td>
              <Td className="font-mono text-code">{incident.id}</Td>
              <Td>{ANOMALY_LABEL[incident.anomalyType] ?? incident.anomalyType}</Td>
              <Td>
                <IncidentStatusBadge status={incident.status} />
              </Td>
              <Td className="text-fg-muted">{formatDateTime(incident.createdAt)}</Td>
              <Td className="text-fg-muted">{formatDateTime(incident.ackDueAt)}</Td>
              <Td className="text-right font-mono">{incident.occurrenceCount}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
