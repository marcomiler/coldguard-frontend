import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { useSession } from '@/features/auth/session'
import { configureAuthBridge } from '@/shared/api/client'
import { shouldRetryQuery } from '@/shared/api/retry'
import { env } from '@/shared/config/env'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetryQuery,
    },
    mutations: { retry: false },
  },
})

configureAuthBridge({
  getToken: () => useSession.getState().session?.token ?? null,
  onUnauthorized: () => {
    useSession.getState().endSession()
    queryClient.clear()
  },
})

async function enableMocks() {
  // Evaluated here so Vite drops the dynamic MSW import from production builds.
  if (!import.meta.env.DEV || !env.mocksEnabled) return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}

export async function bootstrap() {
  await enableMocks()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
