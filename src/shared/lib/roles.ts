import type { Role } from '@/shared/api/types'

/**
 * `roles` mirrors `x-roles` in the contract. `ready` is false while the backend operations behind
 * an area are still `planned`: the area is then hidden everywhere. Flip it when the contract marks
 * them `implemented`. The UI only hides; the backend is the authority and answers 403.
 */
export const AREAS = {
  incidents: {
    path: '/incidents',
    ready: true,
    roles: ['OPERATIONS_SUPERVISOR', 'OPERATOR', 'MAINTENANCE_TECHNICIAN'],
  },
  assets: { path: '/assets', ready: true, roles: ['PLATFORM_ADMIN', 'OPERATIONS_SUPERVISOR'] },
  organizations: {
    path: '/organizations',
    ready: true,
    roles: ['PLATFORM_ADMIN', 'OPERATIONS_SUPERVISOR'],
  },
  sensors: { path: '/sensors', ready: true, roles: ['PLATFORM_ADMIN', 'OPERATIONS_SUPERVISOR'] },
  users: { path: '/users', ready: true, roles: ['PLATFORM_ADMIN'] },
  audit: { path: '/audit', ready: true, roles: ['AUDITOR'] },
  metrics: { path: null, ready: true, roles: ['OPERATIONS_SUPERVISOR'] },
} as const satisfies Record<string, { path: string | null; ready: boolean; roles: readonly Role[] }>

export type Area = keyof typeof AREAS

export const ALL_ROLES: readonly Role[] = [
  'PLATFORM_ADMIN',
  'OPERATIONS_SUPERVISOR',
  'OPERATOR',
  'MAINTENANCE_TECHNICIAN',
  'AUDITOR',
]

export const ROLE_LABELS: Record<Role, string> = {
  PLATFORM_ADMIN: 'Administrador de plataforma',
  OPERATIONS_SUPERVISOR: 'Supervisor de operaciones',
  OPERATOR: 'Operador',
  MAINTENANCE_TECHNICIAN: 'Técnico de mantenimiento',
  AUDITOR: 'Auditor',
}

/** Sensor readings and profiles are served to administrators and supervisors only (`x-roles`). */
export const canReadReadings = (roles: readonly Role[]): boolean =>
  roles.includes('PLATFORM_ADMIN') || roles.includes('OPERATIONS_SUPERVISOR')

export const isAreaReady = (area: Area): boolean => AREAS[area].ready

export const canAccess = (roles: readonly Role[], area: Area): boolean =>
  AREAS[area].ready && roles.some((role) => (AREAS[area].roles as readonly Role[]).includes(role))

/** First screen the role can actually open; `null` when none is available yet. */
export function homePathFor(roles: readonly Role[]): string | null {
  for (const [area, config] of Object.entries(AREAS)) {
    if (config.path && canAccess(roles, area as Area)) return config.path
  }
  return null
}

/** Where to go after signing in: the page asked for, only if this role can open it. */
export function resolveLanding(roles: readonly Role[], requested?: string): string {
  const requestedArea = Object.entries(AREAS).find(
    ([, config]) =>
      config.path && (requested === config.path || requested?.startsWith(`${config.path}/`)),
  )
  if (requested && requestedArea && canAccess(roles, requestedArea[0] as Area)) return requested
  return homePathFor(roles) ?? '/'
}
