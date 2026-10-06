import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useSession } from '@/features/auth/session'
import { RequireArea, RequireAuth } from './guards'

const jwt = (roles: string[]) =>
  `h.${btoa(JSON.stringify({ sub: 'u1', preferred_username: 'tester', roles }))}.s`

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>pantalla de login</p> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireArea area="assets" />,
            children: [{ path: 'assets', element: <p>lista de activos</p> }],
          },
        ],
      },
    ],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
}

describe('guards', () => {
  afterEach(() => useSession.getState().signOut())

  it('sin sesión lleva al login', async () => {
    renderAt('/assets')
    expect(await screen.findByText('pantalla de login')).toBeInTheDocument()
  })

  it('un rol sin permiso ve el aviso de acceso, no la pantalla', async () => {
    useSession.getState().signIn(jwt(['OPERATOR']), 3600)
    renderAt('/assets')
    expect(await screen.findByText('No tienes acceso a esta sección')).toBeInTheDocument()
    expect(screen.queryByText('lista de activos')).not.toBeInTheDocument()
  })

  it('un rol con permiso entra', async () => {
    useSession.getState().signIn(jwt(['PLATFORM_ADMIN']), 3600)
    renderAt('/assets')
    expect(await screen.findByText('lista de activos')).toBeInTheDocument()
  })
})
