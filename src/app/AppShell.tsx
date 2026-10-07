import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { NavLink, Outlet } from 'react-router'
import { useSession } from '@/features/auth/session'
import { cn } from '@/shared/lib/cn'
import { canAccess, ROLE_LABELS, type Area } from '@/shared/lib/roles'
import { BrandMark } from '@/shared/ui/brand-mark'
import { Avatar } from '@/shared/ui/avatar'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

const NAV: { to: string; label: string; area: Area }[] = [
  { to: '/incidents', label: 'Incidentes', area: 'incidents' },
  { to: '/assets', label: 'Activos', area: 'assets' },
  { to: '/users', label: 'Usuarios', area: 'users' },
]

export function AppShell() {
  const session = useSession((state) => state.session)
  const signOut = useSession((state) => state.signOut)
  if (!session) return null
  const allRoles = session.roles.map((role) => ROLE_LABELS[role]).join(', ')
  const firstRole = session.roles[0] ? ROLE_LABELS[session.roles[0]] : 'Sin rol'
  const roleSummary =
    session.roles.length > 1 ? `${firstRole} +${session.roles.length - 1}` : firstRole

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:text-fg"
      >
        Saltar al contenido
      </a>
      <aside className="flex flex-col gap-3 border-b border-border bg-surface p-3 md:w-54 md:shrink-0 md:gap-5 md:border-r md:border-b-0">
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
        <div className="flex items-center gap-1 border-t border-border pt-3 md:mt-auto">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                title={allRoles}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1.5 text-left transition-colors duration-(--duration-fast) ease-ui hover:bg-surface-hover"
              >
                <Avatar name={session.username} />
                <span className="min-w-0">
                  <span className="block truncate text-small font-semibold">
                    {session.username}
                  </span>
                  <span className="block truncate text-caption text-fg-muted">{roleSummary}</span>
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="min-w-56 rounded-md border border-border bg-surface-raised p-1 shadow-overlay"
              >
                <DropdownMenu.Label className="px-3 py-2 text-caption text-fg-muted">
                  {allRoles}
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
          <ThemeToggle />
        </div>
      </aside>
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-5 md:px-7 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
