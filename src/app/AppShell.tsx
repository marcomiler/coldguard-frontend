import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useSession } from '@/features/auth/session'
import { cn } from '@/shared/lib/cn'
import { canAccess, ROLE_LABELS, type Area } from '@/shared/lib/roles'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Avatar } from '@/shared/ui/avatar'
import { BrandMark } from '@/shared/ui/brand-mark'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

const NAV: { to: string; label: string; area: Area }[] = [
  { to: '/incidents', label: 'Incidentes', area: 'incidents' },
  { to: '/assets', label: 'Activos', area: 'assets' },
  { to: '/organizations', label: 'Organizaciones', area: 'organizations' },
  { to: '/sensors', label: 'Sensores', area: 'sensors' },
  { to: '/users', label: 'Usuarios', area: 'users' },
  { to: '/audit', label: 'Bitácora', area: 'audit' },
]

export function AppShell() {
  const session = useSession((state) => state.session)
  const signOut = useSession((state) => state.signOut)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  if (!session) return null

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:text-fg"
      >
        Saltar al contenido
      </a>
      <aside className="flex flex-col gap-3 border-b border-border bg-surface p-3 md:sticky md:top-0 md:h-dvh md:w-54 md:shrink-0 md:gap-5 md:self-start md:overflow-y-auto md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-2.5 py-1">
          <BrandMark />
          <span className="text-heading-3 font-semibold">ColdGuard</span>
        </div>
        <nav aria-label="Principal" className="flex flex-wrap gap-0.5 md:flex-col">
          {NAV.filter((item) => canAccess(session.roles, item.area)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-8 items-center rounded-md px-2.5 text-small font-semibold transition-colors duration-(--duration-fast) ease-ui',
                  isActive
                    ? 'bg-accent-subtle text-accent-subtle-fg'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <section
          aria-label="Sesión"
          className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-3 md:mt-auto"
        >
          <div className="flex items-center gap-2.5">
            <Avatar name={session.username} />
            <div className="min-w-0">
              <p className="truncate text-small font-semibold">{session.username}</p>
              <p className="text-caption leading-snug text-fg-muted">
                {session.roles.map((role) => ROLE_LABELS[role]).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={() => setConfirmingSignOut(true)}>
              Salir
            </Button>
          </div>
        </section>
      </aside>
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-5 md:px-7 md:pb-10">
        <Outlet />
      </main>
      <FormDialog
        open={confirmingSignOut}
        onOpenChange={setConfirmingSignOut}
        title="Cerrar sesión"
        description="Saldrás de ColdGuard y tendrás que iniciar sesión de nuevo para continuar."
        submitLabel="Cerrar sesión"
        pending={false}
        onSubmit={signOut}
      >
        {null}
      </FormDialog>
    </div>
  )
}
