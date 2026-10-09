import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { useSession } from '@/features/auth/session'
import { formatDateTime } from '@/shared/lib/format'
import { canAccess, canReadReadings } from '@/shared/lib/roles'
import { useAutoDismiss } from '@/shared/lib/use-auto-dismiss'
import { Alert } from '@/shared/ui/alert'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui/panel'
import { ErrorState, LoadingState } from '@/shared/ui/states'
import { useAssetNames } from '@/shared/api/asset-names'
import { useIncident } from '../api/incidents'
import { DueTime } from '../components/due-time'
import { IncidentActions } from '../components/incident-actions'
import { IncidentStatusBadge } from '../components/incident-status-badge'
import { OverdueNotice } from '../components/overdue-notice'
import { PriorityBadge } from '../components/priority-badge'
import { ReadingsPanel } from '../components/readings-panel'
import { anomalyLabel, IMPACT_LABELS, URGENCY_LABELS } from '../labels'

const shortId = (id: string | null | undefined) => (id ? id.slice(0, 8) : '—')

function Fact({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div>
      <dt className="text-heading-4 text-fg-muted uppercase">{label}</dt>
      <dd className="mt-0.5 text-small">{children}</dd>
    </div>
  )
}

export function IncidentDetailPage() {
  const { incidentId = '' } = useParams()
  const roles = useSession((state) => state.session?.roles ?? [])
  const notice = useAutoDismiss()
  const { data: incident, error, isPending, isError, refetch } = useIncident(incidentId)
  const assetName = useAssetNames(canAccess(roles, 'assets'))

  return (
    <section aria-labelledby="incident-title" className="flex flex-col gap-4">
      <nav aria-label="Ruta" className="text-small">
        <Link to="/incidents" className="text-fg-muted underline-offset-2 hover:underline">
          ← Incidentes
        </Link>
      </nav>

      {isPending && <LoadingState label="Cargando incidente…" />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {incident && (
        <>
          <header className="flex flex-wrap items-center gap-3">
            <PriorityBadge priority={incident.priority} pulse={incident.status === 'CREATED'} />
            <h1 id="incident-title" className="text-heading-1 font-semibold">
              {anomalyLabel(incident.anomalyType)} · {assetName(incident.assetId)}
            </h1>
            <IncidentStatusBadge status={incident.status} />
            <div className="ml-auto">
              <IncidentActions incident={incident} roles={roles} onDone={notice.show} />
            </div>
          </header>

          {incident.status !== 'CLOSED' && !roles.includes('MAINTENANCE_TECHNICIAN') && (
            <p className="text-small text-fg-muted">
              El incidente se resuelve cerrándolo: lo hace el técnico de mantenimiento, con causa y
              comentario. El supervisor lo reconoce y, si hace falta, lo escala.
            </p>
          )}

          <OverdueNotice incident={incident} />

          {notice.message && (
            <Alert tone="success" onDismiss={notice.dismiss}>
              {notice.message}
            </Alert>
          )}

          <div className="flex flex-wrap items-start gap-4">
            <Panel aria-labelledby="facts-title" className="flex-1 basis-96">
              <PanelHeader>
                <h2 id="facts-title" className="text-heading-3 font-semibold">
                  Datos
                </h2>
              </PanelHeader>
              <PanelBody>
                <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <Fact label="Unidad">{assetName(incident.assetId)}</Fact>
                  <Fact label="Sensor">
                    <span className="font-mono text-code">{incident.sensorId}</span>
                  </Fact>
                  <Fact label="Anomalía">{anomalyLabel(incident.anomalyType)}</Fact>
                  <Fact label="Ocurrencias">{incident.occurrenceCount}</Fact>
                  <Fact label="Impacto">{IMPACT_LABELS[incident.impact]}</Fact>
                  <Fact label="Urgencia">{URGENCY_LABELS[incident.urgency]}</Fact>
                  <Fact label="Última ocurrencia">{formatDateTime(incident.lastOccurrenceAt)}</Fact>
                  <Fact label="Escalamientos">{incident.escalationCount}</Fact>
                </dl>
              </PanelBody>
            </Panel>

            <Panel aria-labelledby="deadlines-title" className="flex-1 basis-96">
              <PanelHeader>
                <h2 id="deadlines-title" className="text-heading-3 font-semibold">
                  Plazos e historial
                </h2>
              </PanelHeader>
              <PanelBody>
                <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <Fact label="Creado">{formatDateTime(incident.createdAt)}</Fact>
                  <Fact label="Reconocer antes de">
                    <DueTime iso={incident.ackDueAt} met={incident.acknowledgedAt != null} />
                  </Fact>
                  <Fact label="Reconocido">
                    {incident.acknowledgedAt
                      ? `${formatDateTime(incident.acknowledgedAt)} · ${shortId(incident.acknowledgedBy)}`
                      : 'Pendiente'}
                  </Fact>
                  <Fact label="Resolver antes de">
                    <DueTime iso={incident.resolveDueAt} met={incident.status === 'CLOSED'} />
                  </Fact>
                  <Fact label="Último escalamiento">
                    {formatDateTime(incident.lastEscalatedAt)}
                  </Fact>
                  <Fact label="Cerrado">
                    {incident.closedAt
                      ? `${formatDateTime(incident.closedAt)} · ${shortId(incident.closedBy)}`
                      : '—'}
                  </Fact>
                </dl>
              </PanelBody>
            </Panel>
          </div>

          {canReadReadings(roles) && <ReadingsPanel incident={incident} />}

          {incident.status === 'CLOSED' && (
            <Panel aria-labelledby="closure-title">
              <PanelHeader>
                <h2 id="closure-title" className="text-heading-3 font-semibold">
                  Cierre
                </h2>
              </PanelHeader>
              <PanelBody>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Fact label="Causa">{incident.cause ?? '—'}</Fact>
                  <Fact label="Cómo se resolvió">{incident.resolutionComment ?? '—'}</Fact>
                </dl>
              </PanelBody>
            </Panel>
          )}
        </>
      )}
    </section>
  )
}
