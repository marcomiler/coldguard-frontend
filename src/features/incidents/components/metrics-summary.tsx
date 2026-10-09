import type { IncidentMetrics, Priority } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'
import { formatDuration, formatPercent } from '@/shared/lib/format'
import { BarList } from '@/shared/patterns/bar-list'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui/panel'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { PriorityBadge } from './priority-badge'
import { STATUS_LABELS } from './incident-status-badge'

const PRIORITIES: Priority[] = ['P1', 'P2', 'P3', 'P4']
const FILL: Record<Priority, string> = {
  P1: 'fill-danger',
  P2: 'fill-warning',
  P3: 'fill-info',
  P4: 'fill-neutral',
}
const STATUSES = ['CREATED', 'ACKNOWLEDGED', 'ESCALATED', 'CLOSED'] as const
const STATUS_FILL = {
  CREATED: 'fill-danger',
  ACKNOWLEDGED: 'fill-warning',
  ESCALATED: 'fill-info',
  CLOSED: 'fill-neutral',
} as const
const BAR: Record<Priority, string> = {
  P1: 'border-l-danger',
  P2: 'border-l-warning',
  P3: 'border-l-info',
  P4: 'border-l-neutral',
}

export function MetricsSummary({ metrics }: { readonly metrics: IncidentMetrics }) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {PRIORITIES.map((priority) => (
          <li
            key={priority}
            className={cn(
              'flex animate-enter flex-col gap-2 rounded-lg border border-l-3 border-border bg-surface px-3.5 py-3 motion-reduce:animate-none',
              BAR[priority],
            )}
          >
            <span>
              <PriorityBadge priority={priority} />
            </span>
            <p className="font-mono text-metric text-fg tabular-nums">
              {metrics.countByPriority[priority] ?? 0}
            </p>
          </li>
        ))}
        <li className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3.5 py-3">
          <span className="text-heading-4 text-fg-muted uppercase">T. medio reconocer</span>
          <p className="font-mono text-heading-1 text-fg">{formatDuration(metrics.mttaSeconds)}</p>
        </li>
        <li className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3.5 py-3">
          <span className="text-heading-4 text-fg-muted uppercase">T. medio resolver</span>
          <p className="font-mono text-heading-1 text-fg">{formatDuration(metrics.mttrSeconds)}</p>
        </li>
      </ul>

      <Panel aria-labelledby="distribution-title">
        <PanelHeader>
          <h3 id="distribution-title" className="text-heading-3 font-semibold">
            Distribución
          </h3>
        </PanelHeader>
        <PanelBody className="grid gap-6 md:grid-cols-2">
          <BarList
            caption="Incidentes por prioridad"
            items={PRIORITIES.map((priority) => ({
              key: priority,
              label: <PriorityBadge priority={priority} />,
              value: metrics.countByPriority[priority] ?? 0,
              fill: FILL[priority],
            }))}
          />
          <BarList
            caption="Incidentes por estado"
            items={STATUSES.map((status) => ({
              key: status,
              label: STATUS_LABELS[status],
              value: metrics.countByStatus[status] ?? 0,
              fill: STATUS_FILL[status],
            }))}
          />
        </PanelBody>
      </Panel>

      <Panel aria-labelledby="compliance-title">
        <PanelHeader>
          <h3 id="compliance-title" className="text-heading-3 font-semibold">
            Cumplimiento de plazos
          </h3>
        </PanelHeader>
        <Table caption="Cumplimiento de plazos de reconocimiento y resolución por prioridad">
          <thead>
            <tr>
              <Th>Prioridad</Th>
              <Th className="text-right">Total</Th>
              <Th className="text-right">Reconocidos a tiempo / reconocidos</Th>
              <Th className="text-right">Cerrados a tiempo / cerrados</Th>
            </tr>
          </thead>
          <tbody>
            {PRIORITIES.map((priority) => {
              const row = metrics.byPriority.find((item) => item.priority === priority)
              return (
                <Tr key={priority}>
                  <Td>
                    <PriorityBadge priority={priority} />
                  </Td>
                  <Td className="text-right font-mono">{row?.total ?? 0}</Td>
                  <Td className="text-right font-mono">
                    {row ? `${row.acknowledgedOnTime}/${row.acknowledged}` : '—'}{' '}
                    <span className="text-fg-muted">
                      ({formatPercent(row?.ackComplianceRatio)})
                    </span>
                  </Td>
                  <Td className="text-right font-mono">
                    {row ? `${row.closedOnTime}/${row.closed}` : '—'}{' '}
                    <span className="text-fg-muted">
                      ({formatPercent(row?.resolveComplianceRatio)})
                    </span>
                  </Td>
                </Tr>
              )
            })}
          </tbody>
        </Table>
      </Panel>
      <p className="text-caption text-fg-muted">
        El cumplimiento solo considera incidentes con plazo definido: los que no lo tienen se
        cuentan en el total pero no en «a tiempo».
      </p>
    </div>
  )
}
