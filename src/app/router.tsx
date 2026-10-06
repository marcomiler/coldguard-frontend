import { createBrowserRouter } from 'react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { HomeRedirect, RequireArea, RequireAuth } from './guards'

// Las pantallas de cada área se cargan bajo demanda para mantener pequeño el bundle inicial.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        lazy: async () => ({ Component: (await import('./AppShell')).AppShell }),
        children: [
          { index: true, element: <HomeRedirect /> },
          {
            element: <RequireArea area="incidents" />,
            children: [
              {
                path: 'incidents',
                lazy: async () => ({
                  Component: (await import('@/features/incidents/pages/IncidentsPage'))
                    .IncidentsPage,
                }),
              },
            ],
          },
          {
            element: <RequireArea area="assets" />,
            children: [
              {
                path: 'assets',
                lazy: async () => ({
                  Component: (await import('@/features/assets/pages/AssetsPage')).AssetsPage,
                }),
              },
            ],
          },
          { path: '*', element: <p>Página no encontrada.</p> },
        ],
      },
    ],
  },
])
