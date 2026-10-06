import { isApiError } from './errors'

const RETRYABLE = new Set(['NETWORK_ERROR', 'UPSTREAM_UNAVAILABLE', 'UPSTREAM_ERROR'])

/**
 * Reintento de lecturas (TanStack Query): una sola vez y solo ante fallos transitorios.
 * Nunca ante timeouts (reintentar apila carga sobre un servicio lento y retrasa el aviso al
 * usuario) ni ante 4xx. Las escrituras no se reintentan automáticamente: pueden no ser idempotentes.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean =>
  failureCount < 1 && isApiError(error) && RETRYABLE.has(error.code)
