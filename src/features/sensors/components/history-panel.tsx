import { useState } from 'react'
import { describeChange, sentence } from '@/shared/lib/describe-change'
import { formatDateTime } from '@/shared/lib/format'
import { ChangeList } from '@/shared/patterns/change-list'
import { CursorPagination } from '@/shared/patterns/cursor-pagination'
import { Badge } from '@/shared/ui/badge'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useSensorHistory } from '../api/sensors'

const ACTIONS: Record<string, string> = {
  REGISTERED: 'Registrado',
  TECHNICAL_DATA_UPDATED: 'Datos técnicos actualizados',
  PROFILE_UPDATED: 'Perfil actualizado',
  STATUS_CHANGED: 'Estado cambiado',
  CALIBRATION_RECORDED: 'Calibración registrada',
  REASSIGNED: 'Reasignado',
  RETIRED: 'Retirado',
}

export function HistoryPanel({ sensorId }: { readonly sensorId: string }) {
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined])
  const page = cursors.length - 1
  const history = useSensorHistory(sensorId, cursors[page])
  const nextCursor = history.data?.nextCursor

  return (
    <Panel aria-labelledby="history-title">
      <PanelHeader>
        <h2 id="history-title" className="text-heading-3 font-semibold">
          Historial administrativo
        </h2>
      </PanelHeader>
      {history.isPending && <LoadingState label="Cargando historial…" />}
      {history.isError && (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      )}
      {history.data?.items.length === 0 && (
        <EmptyState title="Sin cambios registrados">
          Aún no hay movimientos para este sensor.
        </EmptyState>
      )}
      {history.data && history.data.items.length > 0 && (
        <>
          <div aria-busy={history.isFetching}>
            <Table caption="Historial administrativo del sensor">
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>Cambio</Th>
                  <Th>Responsable</Th>
                  <Th>Motivo</Th>
                  <Th>Detalle</Th>
                </tr>
              </thead>
              <tbody>
                {history.data.items.map((entry) => (
                  <Tr key={entry.id}>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {formatDateTime(entry.occurredAt)}
                    </Td>
                    <Td className="font-semibold">
                      {ACTIONS[entry.action] ?? sentence(entry.action)}
                    </Td>
                    <Td className="whitespace-nowrap">
                      {entry.actorType === 'SYSTEM' ? (
                        <Badge>Sistema</Badge>
                      ) : (
                        <>
                          <Badge tone="accent">Usuario</Badge>{' '}
                          <span className="font-mono text-code text-fg-muted" title={entry.actorId}>
                            {entry.actorId.slice(0, 8)}
                          </span>
                        </>
                      )}
                    </Td>
                    <Td className="text-fg-muted">{entry.reason ?? '—'}</Td>
                    <Td>
                      <ChangeList changes={describeChange(entry.previousValue, entry.newValue)} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="border-t border-border p-3">
            <CursorPagination
              page={page}
              hasMore={history.data.hasMore}
              onPrevious={() => setCursors((c) => c.slice(0, -1))}
              onNext={() => nextCursor && setCursors((c) => [...c, nextCursor])}
            />
          </div>
        </>
      )}
    </Panel>
  )
}
