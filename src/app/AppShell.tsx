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
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-lg font-semibold">ColdGuard</span>
          <nav aria-label="Principal" className="flex flex-1 flex-wrap gap-1">
            {NAV.filter((item) => canAccess(session.roles, item.area)).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-sky-600',
                    isActive
                      ? 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
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
                className="min-w-56 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <DropdownMenu.Label className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                  {session.roles.map((role) => ROLE_LABELS[role]).join(', ')}
                </DropdownMenu.Label>
                <DropdownMenu.Item
                  onSelect={signOut}
                  className="cursor-pointer rounded px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700"
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
