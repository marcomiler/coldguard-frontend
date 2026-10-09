import { useQuery } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import { useNow } from '@/shared/lib/use-now'

const WINDOW_BEFORE_MS = 2 * 60 * 60 * 1000
const ROUND_MS = 5 * 60 * 1000

/**
 * Readings around an incident (from 2 h before it was created) plus the sensor's safe range. Only
 * administrators and supervisors may read readings, so `enabled` is false for the other roles.
 */
export function useIncidentReadings(
  sensorId: string,
  createdAt: string,
  closedAt: string | null | undefined,
  enabled: boolean,
) {
  const from = new Date(new Date(createdAt).getTime() - WINDOW_BEFORE_MS).toISOString()
  // Rounded so the query key stays stable between polls.
  const now = Math.ceil(useNow(ROUND_MS) / ROUND_MS) * ROUND_MS
  const to = closedAt ?? new Date(now).toISOString()

  const readings = useQuery({
    queryKey: ['incidents', 'readings', sensorId, from, to],
    queryFn: () =>
      unwrap(
        api.GET('/sensors/{sensorId}/readings', {
          params: { path: { sensorId }, query: { from, to, size: 100 } },
        }),
      ),
    enabled,
    refetchInterval: closedAt ? false : 30_000,
  })
  const profile = useQuery({
    queryKey: ['incidents', 'profile', sensorId],
    queryFn: () =>
      unwrap(api.GET('/sensors/{sensorId}/profile', { params: { path: { sensorId } } })),
    enabled,
    staleTime: 5 * 60_000,
  })
  return { readings, profile }
}
