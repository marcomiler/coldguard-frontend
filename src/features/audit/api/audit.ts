import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'

export interface AuditFilters {
  from: string
  to: string
  entityType?: string
  entityId?: string
  actorId?: string
  action?: string
}

export const AUDIT_PAGE_SIZE = 20

/** One page of the log; `cursor` comes from the previous page's `nextCursor`. */
export function useAuditPage(filters: AuditFilters, cursor: string | undefined) {
  return useQuery({
    queryKey: ['audit', filters, cursor],
    queryFn: () =>
      unwrap(
        api.GET('/audit-records', {
          params: { query: { ...filters, cursor, size: AUDIT_PAGE_SIZE } },
        }),
      ),
    placeholderData: keepPreviousData,
  })
}
