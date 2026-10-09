import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import type { Criticality } from '@/shared/api/types'

export const assetKeys = {
  all: ['assets'] as const,
  list: (page: number, size: number) => ['assets', 'list', { page, size }] as const,
}

export function useAssets(page: number, size = 20) {
  return useQuery({
    queryKey: assetKeys.list(page, size),
    queryFn: () => unwrap(api.GET('/assets', { params: { query: { page, size } } })),
    placeholderData: keepPreviousData,
  })
}

export function useOrganizations(enabled: boolean) {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => unwrap(api.GET('/organizations', { params: { query: { size: 100 } } })),
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useSites(organizationId: string) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'sites'],
    queryFn: () =>
      unwrap(
        api.GET('/organizations/{organizationId}/sites', {
          params: { path: { organizationId }, query: { size: 100 } },
        }),
      ),
    enabled: organizationId !== '',
    staleTime: 5 * 60_000,
  })
}

interface NewAsset {
  siteId: string
  name: string
  description?: string
  criticality: Criticality
}

export function useRegisterAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: NewAsset) => unwrap(api.POST('/assets', { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      assetId,
      ...body
    }: {
      assetId: string
      expectedVersion: number
      name?: string
      description?: string
      criticality?: Criticality
    }) => unwrap(api.PATCH('/assets/{assetId}', { params: { path: { assetId } }, body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  })
}
