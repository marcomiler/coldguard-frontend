import { create } from 'zustand'
import type { Role } from '@/shared/api/types'

const ROLES: readonly Role[] = [
  'OPERATIONS_SUPERVISOR',
  'OPERATOR',
  'MAINTENANCE_TECHNICIAN',
  'AUDITOR',
  'PLATFORM_ADMIN',
]

const isRole = (value: unknown): value is Role => ROLES.includes(value as Role)

export interface Session {
  token: string
  userId: string
  username: string
  roles: Role[]
}

export function parseSession(token: string): Session | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims: unknown = JSON.parse(json)
    if (typeof claims !== 'object' || claims === null) return null
    const { sub, preferred_username: username, roles } = claims as Record<string, unknown>
    if (typeof sub !== 'string' || typeof username !== 'string') return null
    if (!Array.isArray(roles) || !roles.every(isRole)) return null
    return { token, userId: sub, username, roles }
  } catch {
    return null
  }
}

interface SessionState {
  session: Session | null
  /** True when the session ended by itself (expired token or 401), not via sign out. */
  ended: boolean
  signIn: (token: string, expiresInSeconds: number) => boolean
  signOut: () => void
  endSession: () => void
}

let expiryTimer: ReturnType<typeof setTimeout> | undefined

/** The token lives in memory only (no cookies, no refresh): a reload signs the user out. */
export const useSession = create<SessionState>((set, get) => ({
  session: null,
  ended: false,
  signIn(token, expiresInSeconds) {
    const session = parseSession(token)
    if (!session) return false
    clearTimeout(expiryTimer)
    expiryTimer = setTimeout(() => get().endSession(), expiresInSeconds * 1000)
    set({ session, ended: false })
    return true
  },
  signOut() {
    clearTimeout(expiryTimer)
    set({ session: null, ended: false })
  },
  endSession() {
    clearTimeout(expiryTimer)
    set((state) => ({ session: null, ended: state.session !== null }))
  },
}))
