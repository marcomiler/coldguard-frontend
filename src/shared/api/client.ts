import createClient, { type Middleware } from 'openapi-fetch'
import { env } from '@/shared/config/env'
import { ApiError, isApiError } from './errors'
import type { paths } from './schema'

/** Injected by app/ so shared/ never imports from features/auth. */
interface AuthBridge {
  getToken: () => string | null
  onUnauthorized: () => void
}

let bridge: AuthBridge = { getToken: () => null, onUnauthorized: () => {} }

export function configureAuthBridge(next: AuthBridge) {
  bridge = next
}

/** Must exceed the Gateway's 5 s per-service deadline so its 504 (with correlationId) arrives first. */
export const TIMEOUTS_MS = { read: 10_000, write: 20_000 }

const isRead = (method: string) => method === 'GET' || method === 'HEAD'

// By name, not instanceof: DOMException differs across realms (iframes, jsdom).
const hasName = (error: unknown, name: string) =>
  (error as { name?: unknown } | null)?.name === name

interface ClientOptions {
  fetch?: typeof globalThis.fetch
  timeoutsMs?: { read: number; write: number }
}

export function createApiClient({ fetch, timeoutsMs = TIMEOUTS_MS }: ClientOptions = {}) {
  const middleware: Middleware = {
    onRequest({ request }) {
      const token = bridge.getToken()
      if (token) request.headers.set('Authorization', `Bearer ${token}`)
      request.headers.set('X-Correlation-Id', crypto.randomUUID())
      // Combined with the caller's signal so TanStack Query cancellation keeps working.
      const limit = AbortSignal.timeout(isRead(request.method) ? timeoutsMs.read : timeoutsMs.write)
      return new Request(request, { signal: AbortSignal.any([request.signal, limit]) })
    },
    onResponse({ response, schemaPath }) {
      if (response.status === 401 && schemaPath !== '/auth/login') bridge.onUnauthorized()
      return response
    },
    onError({ error, request }) {
      if (hasName(error, 'TimeoutError')) {
        return ApiError.timeout(!isRead(request.method))
      }
    },
  }
  const client = createClient<paths>({ baseUrl: env.apiBaseUrl, fetch })
  client.use(middleware)
  return client
}

export const api = createApiClient()

interface Result<T> {
  data?: T
  error?: unknown
  response: Response
}

export async function unwrap<T>(request: Promise<Result<T>>): Promise<T> {
  let result: Result<T>
  try {
    result = await request
  } catch (cause) {
    if (isApiError(cause)) throw cause
    if (hasName(cause, 'AbortError')) throw cause
    throw ApiError.network()
  }
  if (result.error !== undefined || result.data === undefined) {
    throw ApiError.fromProblem(result.response, result.error)
  }
  return result.data
}
