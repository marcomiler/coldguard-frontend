const mocks = import.meta.env.VITE_MOCKS === 'off' ? 'off' : 'planned'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  mocksEnabled: import.meta.env.DEV && mocks === 'planned',
} as const
