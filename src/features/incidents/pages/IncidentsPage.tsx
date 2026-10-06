import { useState } from 'react'
import { useSession } from '@/features/auth/session'
import type { Incident, IncidentStatus, Priority } from '@/shared/api/types'
import { env } from '@/shared/config/env'
import { formatDateTime, formatDuration } from '@/shared/lib/format'
import { canAccess } from '@/shared/lib/roles'
import { Badge, type Tone } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState, ErrorState, LoadingState, Notice } from '@/shared/ui/states'
import { useIncidentMetrics, useIncidents } from '../api/incidents'
import { INCIDENTS_BACKEND_READY } from '../status'

const PRIORITIES: Priority[] = ['P1', 'P2', 'P3', 'P4']
const PRIORITY_TONE: Record<Priority, Tone> = {
  P1: 'danger',
  P2: 'warning',
  P3: 'info',
  P4: 'neutral',
}
const STATUS_LABEL: Record<IncidentStatus, string> = {
  CREATED: 'Creado',
  ACKNOWLEDGED: 'Reconocido',
  ESCALATED: 'Escalado',
  CLOSED: 'Cerrado',
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
    <section aria-labelledby="incidents-title" className="flex flex-col gap-6">
      <h1 id="incidents-title" className="text-heading-1 font-semibold">
        Incidentes
      </h1>

      {env.mocksEnabled && !INCIDENTS_BACKEND_READY && (
        <Notice>
          Datos simulados: el backend de incidentes aún no está disponible (SPEC-007).
        </Notice>
      )}

      {canAccess(roles, 'metrics') && (
        <section aria-labelledby="priority-title">
          <h2 id="priority-title" className="mb-2 text-heading-2 font-medium">
            Por prioridad (últimas 24 h)
          </h2>
          {metrics.isPending && <LoadingState label="Cargando métricas…" />}
          {metrics.isError && (
            <ErrorState error={metrics.error} onRetry={() => void metrics.refetch()} />
          )}
          {metrics.data && (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PRIORITIES.map((priority) => (
                  <li key={priority} className="rounded-lg border border-border p-3">
                    <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>
                    <p className="mt-1 text-metric font-semibold tabular-nums">
                      {metrics.data.countByPriority[priority] ?? 0}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-small text-fg-muted">
                Tiempo medio de reconocimiento: {formatDuration(metrics.data.mttaSeconds)} · de
                resolución: {formatDuration(metrics.data.mttrSeconds)}
              </p>
            </>
          )}
        </section>
      )}

      <section aria-labelledby="list-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="list-title" className="text-heading-2 font-medium">
            Listado
          </h2>
          <label className="flex items-center gap-2 text-small">
            Estado
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as IncidentStatus | '')
                setPage(0)
              }}
              className="min-h-10 rounded-md border border-border-strong bg-surface px-2"
            >
              <option value="">Todos</option>
              {(Object.keys(STATUS_LABEL) as IncidentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {incidents.isPending && <LoadingState label="Cargando incidentes…" />}
        {incidents.isError && (
          <ErrorState error={incidents.error} onRetry={() => void incidents.refetch()} />
        )}
        {incidents.data && incidents.data.items.length === 0 && (
          <EmptyState title="No hay incidentes con este filtro">
            Cuando un sensor salga de rango se creará un incidente automáticamente.
          </EmptyState>
        )}
        {incidents.data && incidents.data.items.length > 0 && (
          <>
            <IncidentTable items={incidents.data.items} busy={incidents.isFetching} />
            <nav aria-label="Paginación" className="flex items-center gap-3">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-small" aria-live="polite">
                Página {incidents.data.page.page + 1} de{' '}
                {Math.max(incidents.data.page.totalPages, 1)}
              </span>
              <Button
                variant="secondary"
                disabled={page + 1 >= incidents.data.page.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </nav>
          </>
        )}
      </section>
    </section>
  )
}

function IncidentTable({ items, busy }: { items: Incident[]; busy: boolean }) {
  return (
    <div className="overflow-x-auto" aria-busy={busy}>
      <table className="w-full text-left text-small">
        <caption className="sr-only">Incidentes de la cadena de frío</caption>
        <thead className="border-b border-border-strong">
          <tr>
            <th scope="col" className="py-2 pr-4 font-medium">
              Prioridad
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Estado
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Anomalía
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Creado
            </th>
            <th scope="col" className="py-2 font-medium">
              Reconocer antes de
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((incident) => (
            <tr key={incident.id} className="border-b border-border">
              <td className="py-2 pr-4">
                <Badge tone={PRIORITY_TONE[incident.priority]}>{incident.priority}</Badge>
              </td>
              <td className="py-2 pr-4">{STATUS_LABEL[incident.status]}</td>
              <td className="py-2 pr-4">
                {ANOMALY_LABEL[incident.anomalyType] ?? incident.anomalyType}
              </td>
              <td className="py-2 pr-4">{formatDateTime(incident.createdAt)}</td>
              <td className="py-2">{formatDateTime(incident.ackDueAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
