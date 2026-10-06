// @vitest-environment node
import { createApiClient, unwrap } from './client'
import { ApiError } from './errors'
import { shouldRetryQuery } from './retry'

// fetch que nunca responde: solo termina cuando la señal aborta (como el fetch real).
const hangingFetch: typeof fetch = (input) =>
  new Promise((_, reject) => {
    const signal = (input as Request).signal
    if (signal.aborted) return reject(signal.reason)
    signal.addEventListener('abort', () => reject(signal.reason))
  })

const client = (fetchImpl: typeof fetch) =>
  createApiClient({ fetch: fetchImpl, timeoutsMs: { read: 20, write: 20 } })

describe('timeout por petición', () => {
  it('una lectura que agota el plazo da REQUEST_TIMEOUT', async () => {
    const api = client(hangingFetch)
    await expect(unwrap(api.GET('/assets'))).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' })
  })

  it('una escritura que agota el plazo da WRITE_TIMEOUT (puede haberse aplicado)', async () => {
    const api = client(hangingFetch)
    const call = unwrap(api.POST('/auth/login', { body: { username: 'a', password: 'b' } }))
    await expect(call).rejects.toMatchObject({ code: 'WRITE_TIMEOUT' })
  })

  it('la cancelación del llamador no se confunde con timeout ni con falta de red', async () => {
    const api = client(hangingFetch)
    const controller = new AbortController()
    const call = unwrap(api.GET('/assets', { signal: controller.signal }))
    controller.abort()
    await expect(call).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('un fallo de red sigue siendo NETWORK_ERROR', async () => {
    const api = client(() => Promise.reject(new TypeError('Failed to fetch')))
    await expect(unwrap(api.GET('/assets'))).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})

describe('shouldRetryQuery', () => {
  const err = (code: string) => new ApiError({ status: 0, code })

  it('reintenta una vez ante fallos transitorios', () => {
    expect(shouldRetryQuery(0, err('NETWORK_ERROR'))).toBe(true)
    expect(shouldRetryQuery(1, err('NETWORK_ERROR'))).toBe(false)
  })

  it('no reintenta timeouts ni errores de negocio', () => {
    expect(shouldRetryQuery(0, err('REQUEST_TIMEOUT'))).toBe(false)
    expect(shouldRetryQuery(0, err('UPSTREAM_TIMEOUT'))).toBe(false)
    expect(shouldRetryQuery(0, err('ASSET_NOT_FOUND'))).toBe(false)
  })
})
