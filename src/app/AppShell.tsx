import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { NavLink, Outlet } from 'react-router'
import { useSession } from '@/features/auth/session'
import { canAccess, ROLE_LABELS, type Area } from '@/shared/lib/roles'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

const NAV: { to: string; label: string; area: Area }[] = [
  { to: '/incidents', label: 'Incidentes', area: 'incidents' },
  { to: '/assets', label: 'Activos', area: 'assets' },
]

export function AppShell() {
  const session = useSession((state) => state.session)
  const signOut = useSession((state) => state.signOut)
  if (!session) return null

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:text-fg"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-heading-2 font-semibold">ColdGuard</span>
          <nav aria-label="Principal" className="flex flex-1 flex-wrap gap-1">
            {NAV.filter((item) => canAccess(session.roles, item.area)).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-small font-medium',
                    isActive
                      ? 'bg-accent-subtle text-accent-subtle-fg'
                      : 'text-fg-muted hover:bg-surface-hover',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary">{session.username}</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="min-w-56 rounded-md border border-border bg-surface-raised p-1 shadow-overlay"
              >
                <DropdownMenu.Label className="px-3 py-2 text-caption text-fg-muted">
                  {session.roles.map((role) => ROLE_LABELS[role]).join(', ')}
                </DropdownMenu.Label>
                <DropdownMenu.Item
                  onSelect={signOut}
                  className="cursor-pointer rounded-sm px-3 py-2 text-small outline-none data-[highlighted]:bg-surface-hover"
                >
                  Salir
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </>
  )
}
