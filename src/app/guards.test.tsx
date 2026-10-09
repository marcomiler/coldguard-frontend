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
  it('keeps a role out of an area that is not its own', async () => {
    useSession.getState().signIn(jwt(['AUDITOR']), 3600)
    const router = createMemoryRouter(
      [
        {
          element: <RequireAuth />,
          children: [
            {
              element: <RequireArea area="incidents" />,
              children: [{ path: 'incidents', element: <p>lista de incidentes</p> }],
            },
          ],
        },
      ],
      { initialEntries: ['/incidents'] },
    )
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('No tienes acceso a esta sección')).toBeInTheDocument()
    expect(screen.queryByText('lista de incidentes')).not.toBeInTheDocument()
  })

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
