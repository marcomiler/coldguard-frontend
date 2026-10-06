import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import type { IncidentStatus, Priority } from '@/shared/api/types'

export interface IncidentFilters {
  status: IncidentStatus[]
  priority: Priority[]
}

export const incidentKeys = {
  list: (filters: IncidentFilters, page: number) => ['incidents', 'list', filters, page] as const,
  metrics: (from: string, to: string) => ['incidents', 'metrics', from, to] as const,
}

export function useIncidents(filters: IncidentFilters, page: number, size = 20) {
  return useQuery({
    queryKey: incidentKeys.list(filters, page),
    queryFn: () =>
      unwrap(
        api.GET('/incidents', {
          params: { query: { status: filters.status, priority: filters.priority, page, size } },
        }),
      ),
    placeholderData: keepPreviousData,
  })
}

export function useIncidentMetrics(range: { from: string; to: string }, enabled: boolean) {
  return useQuery({
    queryKey: incidentKeys.metrics(range.from, range.to),
    queryFn: () => unwrap(api.GET('/metrics/incidents', { params: { query: range } })),
    enabled,
  })
}
