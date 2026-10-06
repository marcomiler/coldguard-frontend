import createClient, { type Middleware } from 'openapi-fetch'
import { env } from '@/shared/config/env'
import { ApiError, isApiError } from './errors'
import type { paths } from './schema'

/**
 * La sesión vive en features/auth; shared no la importa. app/ inyecta aquí cómo obtener el token
 * y qué hacer ante un 401 (volver al login: no hay refresh).
 */
interface AuthBridge {
  getToken: () => string | null
  onUnauthorized: () => void
}

let bridge: AuthBridge = { getToken: () => null, onUnauthorized: () => {} }

export function configureAuthBridge(next: AuthBridge) {
  bridge = next
}

/**
 * Plazos por petición. Deben superar el deadline del Gateway hacia cada servicio (5 s, variables
 * `*_SERVICE_DEADLINE` del backend) para que normalmente llegue primero su 504 `UPSTREAM_TIMEOUT`
 * con `correlationId`, y el plazo del cliente sea solo la red de seguridad.
 */
export const TIMEOUTS_MS = { read: 10_000, write: 20_000 }

const isRead = (method: string) => method === 'GET' || method === 'HEAD'

// Por `name`, no por instanceof: robusto entre contextos (iframes, jsdom).
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
      // Se combina con la señal del llamador: TanStack Query cancela por la suya y sigue funcionando.
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

/** Convierte el resultado de openapi-fetch en datos o en un ApiError tipado. */
export async function unwrap<T>(request: Promise<Result<T>>): Promise<T> {
  let result: Result<T>
  try {
    result = await request
  } catch (cause) {
    // Timeout (ya tipado por el middleware) y cancelación del llamador no son «sin conexión».
    if (isApiError(cause)) throw cause
    if (hasName(cause, 'AbortError')) throw cause
    throw ApiError.network()
  }
  if (result.error !== undefined || result.data === undefined) {
    throw ApiError.fromProblem(result.response, result.error)
  }
  return result.data
}
