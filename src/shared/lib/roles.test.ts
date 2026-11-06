import { canAccess, homePathFor, isAreaReady, resolveLanding } from './roles'

describe('roles', () => {
  it('has every area ready now that the backend serves them', () => {
    for (const area of [
      'incidents',
      'assets',
      'sensors',
      'organizations',
      'users',
      'audit',
      'metrics',
    ] as const) {
      expect(isAreaReady(area)).toBe(true)
    }
  })

  it('opens incidents to supervisor, operator and technician only', () => {
    expect(canAccess(['OPERATIONS_SUPERVISOR'], 'incidents')).toBe(true)
    expect(canAccess(['OPERATOR'], 'incidents')).toBe(true)
    expect(canAccess(['MAINTENANCE_TECHNICIAN'], 'incidents')).toBe(true)
    expect(canAccess(['AUDITOR'], 'incidents')).toBe(false)
    expect(canAccess(['PLATFORM_ADMIN'], 'incidents')).toBe(false)
  })

  it('keeps metrics for the supervisor, audit for the auditor, users and assets for admin', () => {
    expect(canAccess(['OPERATIONS_SUPERVISOR'], 'metrics')).toBe(true)
    expect(canAccess(['OPERATOR'], 'metrics')).toBe(false)
    expect(canAccess(['AUDITOR'], 'audit')).toBe(true)
    expect(canAccess(['PLATFORM_ADMIN'], 'audit')).toBe(false)
    expect(canAccess(['PLATFORM_ADMIN'], 'users')).toBe(true)
    expect(canAccess(['OPERATIONS_SUPERVISOR'], 'users')).toBe(false)
    expect(canAccess(['OPERATIONS_SUPERVISOR'], 'assets')).toBe(true)
  })

  it('lands every role on a screen it can open', () => {
    expect(homePathFor(['PLATFORM_ADMIN'])).toBe('/assets')
    expect(homePathFor(['OPERATIONS_SUPERVISOR'])).toBe('/incidents')
    expect(homePathFor(['OPERATOR'])).toBe('/incidents')
    expect(homePathFor(['MAINTENANCE_TECHNICIAN'])).toBe('/incidents')
    expect(homePathFor(['AUDITOR'])).toBe('/audit')
  })
})

describe('resolveLanding', () => {
  it('honors the requested page when the role can open it, including detail pages', () => {
    expect(resolveLanding(['PLATFORM_ADMIN'], '/users')).toBe('/users')
    expect(resolveLanding(['OPERATOR'], '/incidents/abc')).toBe('/incidents/abc')
  })

  it('ignores a requested page left over from another session', () => {
    expect(resolveLanding(['OPERATIONS_SUPERVISOR'], '/users')).toBe('/incidents')
    expect(resolveLanding(['OPERATOR'], '/assets')).toBe('/incidents')
    expect(resolveLanding(['AUDITOR'], '/incidents')).toBe('/audit')
  })

  it('falls back to the home page for unknown paths', () => {
    expect(resolveLanding(['PLATFORM_ADMIN'], '/nope')).toBe('/assets')
    expect(resolveLanding(['PLATFORM_ADMIN'])).toBe('/assets')
  })
})
