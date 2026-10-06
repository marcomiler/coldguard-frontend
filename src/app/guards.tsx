import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/features/auth/session'
import { canAccess, homePathFor, type Area } from '@/shared/lib/roles'
import { EmptyState } from '@/shared/ui/states'

export function RequireAuth() {
  const session = useSession((state) => state.session)
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RequireArea({ area }: { area: Area }) {
  const session = useSession((state) => state.session)
  if (!session || !canAccess(session.roles, area)) {
    return (
      <EmptyState title="No tienes acceso a esta sección">
        Tu rol no incluye esta área. Si crees que es un error, contacta a un administrador.
      </EmptyState>
    )
  }
  return <Outlet />
}

export function HomeRedirect() {
  const session = useSession((state) => state.session)
  const home = session ? homePathFor(session.roles) : null
  if (home) return <Navigate to={home} replace />
  return (
    <EmptyState title="Todavía no hay pantallas para tu rol">
      Las pantallas de tu rol aún no están disponibles en esta versión.
    </EmptyState>
  )
}
