import { useState } from 'react'
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
import { useOrganizationPage, useSitePage } from '../api/organizations'
import { CreateOrganizationDialog } from '../components/create-organization-dialog'
import { CreateSiteDialog } from '../components/create-site-dialog'

export function OrganizationsPage() {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)
  const [creating, setCreating] = useState(false)
  const [creatingSite, setCreatingSite] = useState(false)
  const notice = useAutoDismiss()
  const isAdmin = useSession((state) => state.session?.roles.includes('PLATFORM_ADMIN'))
  const organizations = useOrganizationPage(page)

  return (
    <section aria-labelledby="organizations-title" className="flex flex-col gap-5">
      <PageHeader id="organizations-title" title="Organizaciones">
        {organizations.data && (
          <Badge>{organizations.data.page.totalElements} organizaciones</Badge>
        )}
        {isAdmin && <Button onClick={() => setCreating(true)}>Crear organización</Button>}
      </PageHeader>

      {notice.message && (
        <Alert tone="success" onDismiss={notice.dismiss}>
          {notice.message}
        </Alert>
      )}

      <Panel aria-labelledby="organizations-list-title">
        <PanelHeader>
          <h2 id="organizations-list-title" className="text-heading-3 font-semibold">
            Listado
          </h2>
        </PanelHeader>
        {organizations.isPending && <LoadingState label="Cargando organizaciones…" />}
        {organizations.isError && (
          <ErrorState error={organizations.error} onRetry={() => void organizations.refetch()} />
        )}
        {organizations.data?.items.length === 0 && (
          <EmptyState title="Aún no hay organizaciones">
            Crea una para poder registrar sedes y unidades de frío.
          </EmptyState>
        )}
        {organizations.data && organizations.data.items.length > 0 && (
          <>
            <div aria-busy={organizations.isFetching}>
              <Table caption="Organizaciones">
                <thead>
                  <tr>
                    <Th>Organización</Th>
                    <Th>Creada</Th>
                    <Th>
                      <span className="sr-only">Acciones</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.data.items.map((organization) => (
                    <Tr key={organization.id}>
                      <Td className="font-semibold">{organization.name}</Td>
                      <Td className="text-fg-muted">{formatDateTime(organization.createdAt)}</Td>
                      <Td className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={`Ver sedes de ${organization.name}`}
                          aria-pressed={selected?.id === organization.id}
                          onClick={() => setSelected(organization)}
                        >
                          Ver sedes
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="border-t border-border p-3">
              <Pagination
                page={page}
                totalPages={organizations.data.page.totalPages}
                onPrevious={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          </>
        )}
      </Panel>

      {selected && (
        <SitesPanel
          key={selected.id}
          organization={selected}
          canCreate={Boolean(isAdmin)}
          onCreate={() => setCreatingSite(true)}
        />
      )}
      {creating && (
        <CreateOrganizationDialog onClose={() => setCreating(false)} onDone={notice.show} />
      )}
      {creatingSite && selected && (
        <CreateSiteDialog
          organization={selected}
          onClose={() => setCreatingSite(false)}
          onDone={notice.show}
        />
      )}
    </section>
  )
}

function SitesPanel({
  organization,
  canCreate,
  onCreate,
}: {
  readonly organization: { id: string; name: string }
  readonly canCreate: boolean
  readonly onCreate: () => void
}) {
  const [page, setPage] = useState(0)
  const sites = useSitePage(organization.id, page)
  return (
    <Panel aria-labelledby="sites-title">
      <PanelHeader>
        <h2 id="sites-title" className="text-heading-3 font-semibold">
          Sedes de {organization.name}
        </h2>
        {canCreate && (
          <Button className="ml-auto" size="sm" onClick={onCreate}>
            Crear sede
          </Button>
        )}
      </PanelHeader>
      {sites.isPending && <LoadingState label="Cargando sedes…" />}
      {sites.isError && <ErrorState error={sites.error} onRetry={() => void sites.refetch()} />}
      {sites.data?.items.length === 0 && (
        <EmptyState title="Esta organización aún no tiene sedes">
          Las unidades de frío se registran dentro de una sede.
        </EmptyState>
      )}
      {sites.data && sites.data.items.length > 0 && (
        <>
          <Table caption={`Sedes de ${organization.name}`}>
            <thead>
              <tr>
                <Th>Sede</Th>
                <Th>Dirección</Th>
                <Th>Creada</Th>
              </tr>
            </thead>
            <tbody>
              {sites.data.items.map((site) => (
                <Tr key={site.id}>
                  <Td className="font-semibold">{site.name}</Td>
                  <Td className="text-fg-muted">{site.address ?? '—'}</Td>
                  <Td className="text-fg-muted">{formatDateTime(site.createdAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="border-t border-border p-3">
            <Pagination
              page={page}
              totalPages={sites.data.page.totalPages}
              onPrevious={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        </>
      )}
    </Panel>
  )
}
