import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import type { Incident, IncidentStatus, Priority } from '@/shared/api/types'

/** Incidents are time-critical and there is no push channel, so screens poll while visible. */
const POLL_MS = 30_000

export interface IncidentFilters {
  status: IncidentStatus[]
  priority: Priority[]
  createdFrom?: string
}

export const incidentKeys = {
  all: ['incidents'] as const,
  list: (filters: IncidentFilters, page: number) => ['incidents', 'list', filters, page] as const,
  detail: (id: string) => ['incidents', 'detail', id] as const,
  metrics: (from: string, to: string) => ['incidents', 'metrics', from, to] as const,
}

export function useIncidents(filters: IncidentFilters, page: number, size = 20) {
  return useQuery({
    queryKey: incidentKeys.list(filters, page),
    queryFn: () =>
      unwrap(
        api.GET('/incidents', {
          params: {
            query: {
              status: filters.status,
              priority: filters.priority,
              createdFrom: filters.createdFrom,
              page,
              size,
            },
          },
        }),
      ),
    placeholderData: keepPreviousData,
    refetchInterval: POLL_MS,
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () =>
      unwrap(api.GET('/incidents/{incidentId}', { params: { path: { incidentId: id } } })),
    refetchInterval: POLL_MS,
  })
}

export function useIncidentMetrics(range: { from: string; to: string }, enabled: boolean) {
  return useQuery({
    queryKey: incidentKeys.metrics(range.from, range.to),
    queryFn: () => unwrap(api.GET('/metrics/incidents', { params: { query: range } })),
    enabled,
    refetchInterval: POLL_MS,
  })
}

const refresh = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: incidentKeys.all })

function useIncidentAction<TVariables>(
  run: (variables: TVariables & { incidentId: string }) => Promise<Incident>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: (incident, variables) => {
      queryClient.setQueryData(incidentKeys.detail(variables.incidentId), incident)
      return refresh(queryClient)
    },
  })
}

export const useAcknowledgeIncident = () =>
  useIncidentAction(({ incidentId, note }: { incidentId: string; note?: string }) =>
    unwrap(
      api.POST('/incidents/{incidentId}/acknowledgement', {
        params: { path: { incidentId } },
        body: note ? { note } : {},
      }),
    ),
  )

export const useEscalateIncident = () =>
  useIncidentAction(({ incidentId, reason }: { incidentId: string; reason: string }) =>
    unwrap(
      api.POST('/incidents/{incidentId}/escalation', {
        params: { path: { incidentId } },
        body: { reason },
      }),
    ),
  )

export const useCloseIncident = () =>
  useIncidentAction(
    ({
      incidentId,
      cause,
      resolutionComment,
    }: {
      incidentId: string
      cause: string
      resolutionComment: string
    }) =>
      unwrap(
        api.POST('/incidents/{incidentId}/close', {
          params: { path: { incidentId } },
          body: { cause, resolutionComment },
        }),
      ),
  )
