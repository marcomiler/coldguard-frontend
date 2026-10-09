import { useState } from 'react'
import type { Asset } from '@/shared/api/types'
import { useSession } from '@/features/auth/session'
import { formatDateTime } from '@/shared/lib/format'
import { useAutoDismiss } from '@/shared/lib/use-auto-dismiss'
import { PageHeader } from '@/shared/patterns/page-header'
import { Pagination } from '@/shared/patterns/pagination'
import { Alert } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useAssets } from '../api/assets'
import { CriticalityBadge } from '../components/criticality-badge'
import { EditAssetDialog } from '../components/edit-asset-dialog'
import { RegisterAssetDialog } from '../components/register-asset-dialog'

export function AssetsPage() {
  const [page, setPage] = useState(0)
  const [registering, setRegistering] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const notice = useAutoDismiss()
  // Creating assets is an administrator action (`x-roles` of `POST /assets`).
  const canRegister = useSession((state) => state.session?.roles.includes('PLATFORM_ADMIN'))
  const { data, error, isPending, isError, isFetching, refetch } = useAssets(page)

  return (
    <section aria-labelledby="assets-title" className="flex flex-col gap-4">
      <PageHeader id="assets-title" title="Activos">
        {data && <Badge>{data.page.totalElements} unidades</Badge>}
        {canRegister && <Button onClick={() => setRegistering(true)}>Registrar unidad</Button>}
      </PageHeader>

      {notice.message && (
        <Alert tone="success" onDismiss={notice.dismiss}>
          {notice.message}
        </Alert>
      )}
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
                  {canRegister && (
                    <Th>
                      <span className="sr-only">Acciones</span>
                    </Th>
                  )}
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
                    {canRegister && (
                      <Td className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={`Editar ${asset.name}`}
                          onClick={() => setEditing(asset)}
                        >
                          Editar
                        </Button>
                      </Td>
                    )}
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
      {editing && (
        <EditAssetDialog asset={editing} onClose={() => setEditing(null)} onDone={notice.show} />
      )}
      {canRegister && (
        <RegisterAssetDialog
          open={registering}
          onOpenChange={setRegistering}
          onCreated={(name) => notice.show(`Unidad registrada: ${name}.`)}
        />
      )}
    </section>
  )
}
