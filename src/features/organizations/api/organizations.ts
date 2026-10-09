import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'

export function useOrganizationPage(page: number, size = 20) {
  return useQuery({
    queryKey: ['organizations', 'page', page],
    queryFn: () => unwrap(api.GET('/organizations', { params: { query: { page, size } } })),
    placeholderData: keepPreviousData,
  })
}

export function useSitePage(organizationId: string, page: number, size = 20) {
  return useQuery({
    queryKey: ['organizations', organizationId, 'sites', 'page', page],
    queryFn: () =>
      unwrap(
        api.GET('/organizations/{organizationId}/sites', {
          params: { path: { organizationId }, query: { page, size } },
        }),
      ),
    placeholderData: keepPreviousData,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string }) => unwrap(api.POST('/organizations', { body })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  })
}

export function useCreateSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      organizationId,
      ...body
    }: {
      organizationId: string
      name: string
      address?: string
    }) =>
      unwrap(
        api.POST('/organizations/{organizationId}/sites', {
          params: { path: { organizationId } },
          body,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  })
}
