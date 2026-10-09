import { useState } from 'react'
import { Link } from 'react-router'
import { useSession } from '@/features/auth/session'
import type { Incident, IncidentStatus, Priority, Role } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'
import { useAutoDismiss } from '@/shared/lib/use-auto-dismiss'
import { canAccess } from '@/shared/lib/roles'
import { PageHeader } from '@/shared/patterns/page-header'
import { Pagination } from '@/shared/patterns/pagination'
import { Alert } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { SelectField } from '@/shared/ui/select'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useAssetNames } from '@/shared/api/asset-names'
import { useIncidentMetrics, useIncidents } from '../api/incidents'
import { AcknowledgeDialog } from '../components/acknowledge-dialog'
import { CloseDialog } from '../components/close-dialog'
import { DueTime } from '../components/due-time'
import { IncidentStatusBadge, STATUS_LABELS } from '../components/incident-status-badge'
import { MetricsSummary } from '../components/metrics-summary'
import { PriorityBadge } from '../components/priority-badge'
import { anomalyLabel } from '../labels'
import { incidentPermissions } from '../permissions'

const ROW_BAR: Partial<Record<Priority, string>> = {
  P1: 'border-l-3 border-l-danger',
  P2: 'border-l-3 border-l-warning',
}
const DAY_MS = 24 * 60 * 60 * 1000
const PERIODS = [
  { days: 1, label: 'Últimas 24 horas' },
  { days: 7, label: 'Últimos 7 días' },
  { days: 30, label: 'Últimos 30 días' },
  { days: 90, label: 'Últimos 90 días' },
]

// Metrics filter by the incident's creation date, not by when it was acknowledged or closed.
const rangeFor = (days: number) => {
  const now = Date.now()
  return { from: new Date(now - days * DAY_MS).toISOString(), to: new Date(now).toISOString() }
}

export function IncidentsPage() {
  const roles = useSession((state) => state.session?.roles ?? [])
  const [status, setStatus] = useState<IncidentStatus | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [page, setPage] = useState(0)
  const [toAcknowledge, setToAcknowledge] = useState<Incident | null>(null)
  const [toClose, setToClose] = useState<Incident | null>(null)
  const notice = useAutoDismiss()
  const [days, setDays] = useState(1)
  // Fixed when the period is chosen so the query key stays stable.
  const [range, setRange] = useState(() => rangeFor(1))

  const showMetrics = canAccess(roles, 'metrics')
  const filters = {
    status: status ? [status] : [],
    priority: priority ? [priority] : [],
    // No upper bound: incidents created after the period was chosen must keep appearing.
    createdFrom: showMetrics ? range.from : undefined,
  }
  const incidents = useIncidents(filters, page)
  const metrics = useIncidentMetrics(range, showMetrics)
  const assetName = useAssetNames(canAccess(roles, 'assets'))

  const noData = !incidents.data || incidents.data.items.length === 0
  const resetPage = () => setPage(0)

  return (
    <section aria-labelledby="incidents-title" className="flex flex-col gap-5">
      <PageHeader id="incidents-title" title="Incidentes" />

      {notice.message && (
        <Alert tone="success" onDismiss={notice.dismiss}>
          {notice.message}
        </Alert>
      )}

      {showMetrics && (
        <section aria-labelledby="metrics-title" className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-end gap-3">
            <h2 id="metrics-title" className="text-heading-4 text-fg-muted uppercase">
              Cumplimiento en el período
            </h2>
            <div className="ml-auto w-48">
              <SelectField
                label="Período"
                value={days}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setDays(next)
                  setRange(rangeFor(next))
                  resetPage()
                }}
              >
                {PERIODS.map((period) => (
                  <option key={period.days} value={period.days}>
                    {period.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          {metrics.isPending && <LoadingState label="Cargando métricas…" />}
          {metrics.isError && (
            <ErrorState error={metrics.error} onRetry={() => void metrics.refetch()} />
          )}
          {metrics.data && <MetricsSummary metrics={metrics.data} />}
        </section>
      )}

      <Panel aria-labelledby="list-title">
        <PanelHeader>
          <h2 id="list-title" className="text-heading-3 font-semibold">
            {showMetrics ? `Listado · ${PERIODS.find((p) => p.days === days)?.label}` : 'Listado'}
          </h2>
          <div className="ml-auto flex flex-wrap gap-2">
            <div className="w-40">
              <SelectField
                label="Prioridad"
                value={priority}
                onChange={(event) => {
                  setPriority(event.target.value as Priority | '')
                  resetPage()
                }}
              >
                <option value="">Todas</option>
                {(['P1', 'P2', 'P3', 'P4'] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="w-44">
              <SelectField
                label="Estado"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as IncidentStatus | '')
                  resetPage()
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
          </div>
        </PanelHeader>

        <p className="border-b border-border px-3.5 py-2 text-caption text-fg-muted">
          Un plazo vencido no bloquea la acción: aún se puede reconocer o cerrar, y queda como
          incumplimiento en las métricas.
        </p>
        {(incidents.isPending || incidents.isError || (incidents.data && noData)) && (
          <div className="flex flex-col gap-3 p-3.5">
            {incidents.isPending && <LoadingState label="Cargando incidentes…" />}
            {incidents.isError && (
              <ErrorState error={incidents.error} onRetry={() => void incidents.refetch()} />
            )}
            {incidents.data && noData && (
              <EmptyState title="No hay incidentes con estos filtros">
                Cuando un sensor salga de su rango seguro se creará un incidente automáticamente.
              </EmptyState>
            )}
          </div>
        )}
        {incidents.data && !noData && (
          <>
            <IncidentTable
              items={incidents.data.items}
              busy={incidents.isFetching}
              assetName={assetName}
              roles={roles}
              onAcknowledge={setToAcknowledge}
              onCloseIncident={setToClose}
            />
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
      <AcknowledgeDialog
        incident={toAcknowledge}
        onClose={() => setToAcknowledge(null)}
        onDone={notice.show}
      />
      <CloseDialog incident={toClose} onClose={() => setToClose(null)} onDone={notice.show} />
    </section>
  )
}

interface IncidentTableProps {
  readonly items: Incident[]
  readonly busy: boolean
  readonly assetName: (assetId: string) => string
  readonly roles: readonly Role[]
  readonly onAcknowledge: (incident: Incident) => void
  readonly onCloseIncident: (incident: Incident) => void
}

function IncidentTable({
  items,
  busy,
  assetName,
  roles,
  onAcknowledge,
  onCloseIncident,
}: IncidentTableProps) {
  return (
    <div aria-busy={busy}>
      <Table caption="Incidentes de la cadena de frío">
        <thead>
          <tr>
            <Th>Prior.</Th>
            <Th>Unidad</Th>
            <Th>Anomalía</Th>
            <Th>Estado</Th>
            <Th>Creado</Th>
            <Th>Reconocer</Th>
            <Th>Resolver</Th>
            <Th className="text-right">Ocurr.</Th>
            <Th>
              <span className="sr-only">Acciones</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {items.map((incident) => {
            const open = incident.status !== 'CLOSED'
            const can = incidentPermissions(roles, incident)
            let acknowledgementContent
            if (incident.acknowledgedAt) {
              acknowledgementContent = <span className="text-fg-muted">Reconocido</span>
            } else if (open) {
              acknowledgementContent = <DueTime iso={incident.ackDueAt} />
            } else {
              acknowledgementContent = '—'
            }
            return (
              <Tr key={incident.id}>
                <Td className={cn(open && ROW_BAR[incident.priority])}>
                  <PriorityBadge
                    priority={incident.priority}
                    pulse={incident.status === 'CREATED'}
                  />
                </Td>
                <Td>
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    {assetName(incident.assetId)}
                  </Link>
                </Td>
                <Td>{anomalyLabel(incident.anomalyType)}</Td>
                <Td>
                  <IncidentStatusBadge status={incident.status} />
                </Td>
                <Td className="text-fg-muted">{formatDateTime(incident.createdAt)}</Td>
                <Td>{acknowledgementContent}</Td>
                <Td>{open ? <DueTime iso={incident.resolveDueAt} /> : '—'}</Td>
                <Td className="text-right font-mono">{incident.occurrenceCount}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1.5">
                    {can.canAcknowledge && (
                      <Button
                        size="sm"
                        variant={incident.priority === 'P1' ? 'primary' : 'secondary'}
                        onClick={() => onAcknowledge(incident)}
                      >
                        Reconocer
                      </Button>
                    )}
                    {can.canClose && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onCloseIncident(incident)}
                      >
                        Cerrar
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}
