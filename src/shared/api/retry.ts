import { isApiError } from './errors'

const RETRYABLE = new Set(['NETWORK_ERROR', 'UPSTREAM_UNAVAILABLE', 'UPSTREAM_ERROR'])

/**
 * Retry reads once, only on transient failures. Never on timeouts (retrying piles load on a slow
 * service and delays feedback) or 4xx. Writes are never retried: they may not be idempotent.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean =>
  failureCount < 1 && isApiError(error) && RETRYABLE.has(error.code)
