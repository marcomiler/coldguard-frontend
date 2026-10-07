import { useState } from 'react'
import type { User } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/format'
import { ROLE_LABELS } from '@/shared/lib/roles'
import { PageHeader } from '@/shared/patterns/page-header'
import { Pagination } from '@/shared/patterns/pagination'
import { Alert } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { Table, Td, Th, Tr } from '@/shared/ui/table'
import { useUsers } from '../api/users'
import { CreateUserDialog } from '../components/create-user-dialog'
import { EnabledDialog } from '../components/enabled-dialog'
import { RoleDialog } from '../components/role-dialog'

export function UsersPage() {
  const [page, setPage] = useState(0)
  const [creating, setCreating] = useState(false)
  const [roleUser, setRoleUser] = useState<User | null>(null)
  const [enabledUser, setEnabledUser] = useState<User | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const { data, error, isPending, isError, isFetching, refetch } = useUsers(page)

  return (
    <section aria-labelledby="users-title" className="flex flex-col gap-4">
      <PageHeader id="users-title" title="Usuarios">
        <Button onClick={() => setCreating(true)}>Crear usuario</Button>
      </PageHeader>

      {done && <Alert tone="success">{done}</Alert>}
      {isPending && <LoadingState label="Cargando usuarios…" />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
      {data && data.items.length === 0 && (
        <EmptyState title="Aún no hay usuarios">Crea el primero para dar acceso.</EmptyState>
      )}
      {data && data.items.length > 0 && (
        <Panel aria-labelledby="users-list-title">
          <PanelHeader>
            <h2 id="users-list-title" className="text-heading-3 font-semibold">
              Cuentas de acceso
            </h2>
            <Badge>{data.page.totalElements} usuarios</Badge>
          </PanelHeader>
          <div aria-busy={isFetching}>
            <Table caption="Usuarios de ColdGuard">
              <thead>
                <tr>
                  <Th>Usuario</Th>
                  <Th>Correo</Th>
                  <Th>Roles</Th>
                  <Th>Estado</Th>
                  <Th>Creado</Th>
                  <Th>
                    <span className="sr-only">Acciones</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <Tr key={user.userId}>
                    <Td>
                      <div className="font-semibold">{user.displayName}</div>
                      <div className="font-mono text-code text-fg-muted">{user.username}</div>
                    </Td>
                    <Td className="text-fg-muted">{user.email}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 && <span className="text-fg-muted">—</span>}
                        {user.roles.map((role) => (
                          <Badge key={role} tone="accent">
                            {ROLE_LABELS[role]}
                          </Badge>
                        ))}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={user.enabled ? 'success' : 'neutral'} dot>
                        {user.enabled ? 'Activo' : 'Deshabilitado'}
                      </Badge>
                    </Td>
                    <Td className="text-fg-muted">{formatDateTime(user.createdAt)}</Td>
                    <Td>
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setRoleUser(user)}>
                          Roles
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setEnabledUser(user)}>
                          {user.enabled ? 'Deshabilitar' : 'Habilitar'}
                        </Button>
                      </div>
                    </Td>
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

      <CreateUserDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(username) => setDone(`Usuario creado: ${username}.`)}
      />
      <RoleDialog user={roleUser} onClose={() => setRoleUser(null)} onDone={setDone} />
      <EnabledDialog user={enabledUser} onClose={() => setEnabledUser(null)} onDone={setDone} />
    </section>
  )
}
