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

const STORAGE_KEY = 'cg-session'

let expiryTimer: ReturnType<typeof setTimeout> | undefined

// sessionStorage survives a reload but not closing the tab, and the backend issues no refresh
// token, so the stored token is only restored while it has not expired.
function persist(token: string, expiresAt: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, expiresAt }))
  } catch {
    // Storage can be blocked; the session then simply does not survive a reload.
  }
}

function forget() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // See persist().
  }
}

function restore(): { session: Session; expiresAt: number } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored: unknown = JSON.parse(raw)
    if (typeof stored !== 'object' || stored === null) return null
    const { token, expiresAt } = stored as Record<string, unknown>
    if (typeof token !== 'string' || typeof expiresAt !== 'number' || expiresAt <= Date.now()) {
      forget()
      return null
    }
    const session = parseSession(token)
    if (!session) {
      forget()
      return null
    }
    return { session, expiresAt }
  } catch {
    return null
  }
}

export const useSession = create<SessionState>((set, get) => {
  const restored = restore()
  if (restored) {
    expiryTimer = setTimeout(() => get().endSession(), restored.expiresAt - Date.now())
  }
  return {
    session: restored?.session ?? null,
    ended: false,
    signIn(token, expiresInSeconds) {
      const session = parseSession(token)
      if (!session) return false
      clearTimeout(expiryTimer)
      expiryTimer = setTimeout(() => get().endSession(), expiresInSeconds * 1000)
      persist(token, Date.now() + expiresInSeconds * 1000)
      set({ session, ended: false })
      return true
    },
    signOut() {
      clearTimeout(expiryTimer)
      forget()
      set({ session: null, ended: false })
    },
    endSession() {
      clearTimeout(expiryTimer)
      forget()
      set((state) => ({ session: null, ended: state.session !== null }))
    },
  }
})
