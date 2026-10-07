import { useState } from 'react'
import { formatDateTime } from '@/shared/lib/format'
import { PageHeader } from '@/shared/patterns/page-header'
import { Pagination } from '@/shared/patterns/pagination'
import { Badge } from '@/shared/ui/badge'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useAssets } from '../api/assets'
import { CriticalityBadge } from '../components/criticality-badge'

export function AssetsPage() {
  const [page, setPage] = useState(0)
  const { data, error, isPending, isError, isFetching, refetch } = useAssets(page)

  return (
    <section aria-labelledby="assets-title" className="flex flex-col gap-4">
      <PageHeader id="assets-title" title="Activos">
        {data && <Badge>{data.page.totalElements} unidades</Badge>}
      </PageHeader>

      {isPending && <LoadingState label="Cargando activos…" />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
      {data && data.items.length === 0 && (
        <EmptyState title="Aún no hay activos registrados">
          Cuando se registre una unidad de frío aparecerá aquí.
        </EmptyState>
      )}
      {data && data.items.length > 0 && (
        <Panel aria-labelledby="assets-list-title">
          <PanelHeader>
            <h2 id="assets-list-title" className="text-heading-3 font-semibold">
              Unidades de frío
            </h2>
          </PanelHeader>
          <div aria-busy={isFetching}>
            <Table caption="Unidades de frío registradas">
              <thead>
                <tr>
                  <Th>Unidad</Th>
                  <Th>Criticidad</Th>
                  <Th>Descripción</Th>
                  <Th>Actualizado</Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((asset) => (
                  <Tr key={asset.id}>
                    <Td className="font-semibold">{asset.name}</Td>
                    <Td>
                      <CriticalityBadge criticality={asset.criticality} />
                    </Td>
                    <Td className="text-fg-muted">{asset.description ?? '—'}</Td>
                    <Td className="text-fg-muted">{formatDateTime(asset.updatedAt)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="border-t border-border p-3">
            <Pagination
              page={page}
              totalPages={data.page.totalPages}
              onPrevious={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        </Panel>
      )}
    </section>
  )
}
