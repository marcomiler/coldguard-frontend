import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import { isApiError, type ApiError } from '@/shared/api/errors'
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

interface RoleChanges {
  userId: string
  add: Role[]
  remove: Role[]
  reason: string
}

/**
 * Applies the diff one call at a time (the backend takes one role per call). Resolves with what
 * was applied and, if a call failed, the error: earlier changes stay applied.
 */
export function useChangeRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, add, remove, reason }: RoleChanges) => {
      const params = { path: { userId } }
      const added: Role[] = []
      const removed: Role[] = []
      try {
        for (const role of add) {
          await unwrap(api.POST('/users/{userId}/roles', { params, body: { role, reason } }))
          added.push(role)
        }
        for (const role of remove) {
          await unwrap(api.DELETE('/users/{userId}/roles', { params, body: { role, reason } }))
          removed.push(role)
        }
        return { added, removed, failed: null as ApiError | null }
      } catch (error) {
        if (isApiError(error)) return { added, removed, failed: error }
        throw error
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

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
