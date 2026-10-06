import { useMutation } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import { useSession } from '../session'

export function useLogin() {
  const signIn = useSession((state) => state.signIn)
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { accessToken, expiresIn } = await unwrap(
        api.POST('/auth/login', { body: credentials }),
      )
      if (!signIn(accessToken, expiresIn)) {
        throw new ApiError({ status: 200, code: 'INVALID_TOKEN' })
      }
    },
  })
}
