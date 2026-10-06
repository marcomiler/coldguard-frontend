import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'

export const assetKeys = {
  list: (page: number, size: number) => ['assets', 'list', { page, size }] as const,
}

export function useAssets(page: number, size = 20) {
  return useQuery({
    queryKey: assetKeys.list(page, size),
    queryFn: () => unwrap(api.GET('/assets', { params: { query: { page, size } } })),
    placeholderData: keepPreviousData,
  })
}
