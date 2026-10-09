import { useState, type SubmitEvent } from 'react'
import type { AuditRecord } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/format'
import { ChangeList } from '@/shared/patterns/change-list'
import { CursorPagination } from '@/shared/patterns/cursor-pagination'
import { PageHeader } from '@/shared/patterns/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Panel, PanelBody, PanelHeader } from '@/shared/ui/panel'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useAuditPage, type AuditFilters } from '../api/audit'
import { actionLabel, actorLabel, describeChange, entityLabel, shortId } from '../format'

const HOUR_MS = 60 * 60 * 1000
// Backend limit on the queried range (incident-service `max-range`).
const MAX_RANGE_MS = 31 * 24 * HOUR_MS

/** Value for a `datetime-local` input, in the user's own time zone. */
function toLocalInput(date: Date): string {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return shifted.toISOString().slice(0, 16)
}

const initialFilters = (): AuditFilters => {
  const now = Date.now()
  return { from: new Date(now - 24 * HOUR_MS).toISOString(), to: new Date(now).toISOString() }
}

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>(initialFilters)
  const [formError, setFormError] = useState<string>()
  const [defaults] = useState(() => ({
    from: toLocalInput(new Date(filters.from)),
    to: toLocalInput(new Date(filters.to)),
  }))
  const [page, setPage] = useState(0)
  // cursors[n] is the cursor that opens page n; page 0 has none.
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined])
  const audit = useAuditPage(filters, cursors[page])
  const records = audit.data?.items ?? []

  function goNext() {
    const next = audit.data?.nextCursor
    if (!audit.data?.hasMore || !next) return
    setCursors((current) => [...current.slice(0, page + 1), next])
    setPage(page + 1)
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    const text = (name: string) => {
      const value = data.get(name)
      return typeof value === 'string' ? value.trim() || undefined : undefined
    }

    const fromValue = data.get('from')
    const toValue = data.get('to')

    const from = new Date(typeof fromValue === 'string' ? fromValue : '')
    const to = new Date(typeof toValue === 'string' ? toValue : '')

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      setFormError('Indica el rango de fechas completo')
      return
    }

    if (from >= to) {
      setFormError('La fecha inicial debe ser anterior a la final')
      return
    }

    if (to.getTime() - from.getTime() > MAX_RANGE_MS) {
      setFormError('El rango no puede superar 31 días')
      return
    }

    setFormError(undefined)
    setPage(0)
    setCursors([undefined])
    setFilters({
      from: from.toISOString(),
      to: to.toISOString(),
      entityType: text('entityType'),
      entityId: text('entityId'),
      actorId: text('actorId'),
      action: text('action'),
    })
  }

  return (
    <section aria-labelledby="audit-title" className="flex flex-col gap-4">
      <PageHeader id="audit-title" title="Bitácora de auditoría" />

      <Panel aria-labelledby="audit-filters-title">
        <PanelHeader>
          <h2 id="audit-filters-title" className="text-heading-3 font-semibold">
            Filtros
          </h2>
        </PanelHeader>
        <PanelBody>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Desde" name="from" type="datetime-local" defaultValue={defaults.from} />
              <Field label="Hasta" name="to" type="datetime-local" defaultValue={defaults.to} />
              <Field label="Acción" name="action" autoComplete="off" />
              <Field label="Tipo de entidad" name="entityType" autoComplete="off" />
              <Field label="Id de la entidad" name="entityId" autoComplete="off" />
              <Field label="Id del actor" name="actorId" autoComplete="off" />
            </div>
            {formError && <p className="text-caption text-danger-fg">{formError}</p>}
            <div>
              <Button type="submit">Buscar</Button>
            </div>
          </form>
        </PanelBody>
      </Panel>

      {audit.isPending && <LoadingState label="Cargando bitácora…" />}
      {audit.isError && <ErrorState error={audit.error} onRetry={() => void audit.refetch()} />}
      {audit.data && records.length === 0 && (
        <EmptyState title="Sin registros en este rango">
          Prueba con otro rango de fechas o quita algún filtro.
        </EmptyState>
      )}
      {records.length > 0 && (
        <Panel aria-labelledby="audit-list-title">
          <PanelHeader>
            <h2 id="audit-list-title" className="text-heading-3 font-semibold">
              Registros
            </h2>
            <Badge>{records.length} en esta página</Badge>
          </PanelHeader>
          <div aria-busy={audit.isFetching}>
            <Table caption="Registros de auditoría, del más reciente al más antiguo">
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>Acción</Th>
                  <Th>Entidad</Th>
                  <Th>Actor</Th>
                  <Th>Motivo</Th>
                  <Th>Detalle</Th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <AuditRow key={record.id} record={record} />
                ))}
              </tbody>
            </Table>
          </div>
          <div className="border-t border-border p-3">
            <CursorPagination
              page={page}
              hasMore={audit.data?.hasMore ?? false}
              onPrevious={() => setPage((p) => p - 1)}
              onNext={goNext}
            />
          </div>
        </Panel>
      )}
    </section>
  )
}

function AuditRow({ record }: { readonly record: AuditRecord }) {
  const changes = describeChange(record.previousValue, record.newValue)
  const isSystem = record.actorType === 'SYSTEM'
  return (
    <Tr>
      <Td className="whitespace-nowrap text-fg-muted">{formatDateTime(record.occurredAt)}</Td>
      <Td className="font-semibold">{actionLabel(record.action, record.entityType)}</Td>
      <Td className="whitespace-nowrap">
        {entityLabel(record.entityType)}{' '}
        <span className="font-mono text-code text-fg-muted" title={record.entityId}>
          {shortId(record.entityId)}
        </span>
      </Td>
      <Td className="whitespace-nowrap">
        {isSystem ? (
          <>
            <Badge>Sistema</Badge> {actorLabel(record.actorId)}
          </>
        ) : (
          <>
            <Badge tone="accent">Usuario</Badge>{' '}
            <span className="font-mono text-code text-fg-muted" title={record.actorId}>
              {shortId(record.actorId)}
            </span>
          </>
        )}
      </Td>
      <Td className="text-fg-muted">{record.reason ?? '—'}</Td>
      <Td>
        <ChangeList changes={changes} />
      </Td>
    </Tr>
  )
}
