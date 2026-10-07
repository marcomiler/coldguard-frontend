import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import type { CreateUserRequest, Role } from '@/shared/api/types'

export const userKeys = {
  all: ['users'] as const,
  list: (page: number, size: number) => ['users', 'list', { page, size }] as const,
}

export function useUsers(page: number, size = 20) {
  return useQuery({
    queryKey: userKeys.list(page, size),
    queryFn: () => unwrap(api.GET('/users', { params: { query: { page, size } } })),
    placeholderData: keepPreviousData,
  })
}

function useUserMutation<TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export const useCreateUser = () =>
  useUserMutation((body: CreateUserRequest) => unwrap(api.POST('/users', { body })))

interface RoleChange {
  userId: string
  action: 'assign' | 'revoke'
  role: Role
  reason: string
}

export const useChangeRole = () =>
  useUserMutation(({ userId, action, role, reason }: RoleChange) => {
    const params = { path: { userId } }
    const body = { role, reason }
    return action === 'assign'
      ? unwrap(api.POST('/users/{userId}/roles', { params, body }))
      : unwrap(api.DELETE('/users/{userId}/roles', { params, body }))
  })

export const useSetUserEnabled = () =>
  useUserMutation(
    ({ userId, enabled, reason }: { userId: string; enabled: boolean; reason: string }) =>
      unwrap(
        api.POST('/users/{userId}/enabled', {
          params: { path: { userId } },
          body: { enabled, reason },
        }),
      ),
  )
