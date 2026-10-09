import type { Incident } from '@/shared/api/types'
import { incidentPermissions } from './permissions'

const incident = (overrides: Partial<Incident> = {}): Incident => ({
  id: 'i1',
  status: 'CREATED',
  assetId: 'a1',
  sensorId: 's1',
  anomalyType: 'HIGH_TEMPERATURE',
  impact: 'HIGH',
  urgency: 'IMMEDIATE',
  priority: 'P1',
  createdAt: '2026-10-06T00:00:00Z',
  escalationCount: 0,
  occurrenceCount: 1,
  ...overrides,
})

describe('incidentPermissions', () => {
  it('lets the supervisor acknowledge once and escalate while open', () => {
    expect(incidentPermissions(['OPERATIONS_SUPERVISOR'], incident())).toEqual({
      canAcknowledge: true,
      canEscalate: true,
      canClose: false,
    })
    const acknowledged = incident({
      status: 'ACKNOWLEDGED',
      acknowledgedAt: '2026-10-06T00:05:00Z',
    })
    expect(incidentPermissions(['OPERATIONS_SUPERVISOR'], acknowledged).canAcknowledge).toBe(false)
    expect(incidentPermissions(['OPERATIONS_SUPERVISOR'], acknowledged).canEscalate).toBe(true)
  })

  it('lets only the technician close', () => {
    expect(incidentPermissions(['MAINTENANCE_TECHNICIAN'], incident()).canClose).toBe(true)
    expect(incidentPermissions(['OPERATIONS_SUPERVISOR'], incident()).canClose).toBe(false)
  })

  it('offers nothing to an operator, nor on a closed incident', () => {
    expect(incidentPermissions(['OPERATOR'], incident())).toEqual({
      canAcknowledge: false,
      canEscalate: false,
      canClose: false,
    })
    const closed = incident({ status: 'CLOSED' })
    expect(incidentPermissions(['MAINTENANCE_TECHNICIAN'], closed).canClose).toBe(false)
    expect(incidentPermissions(['OPERATIONS_SUPERVISOR'], closed).canEscalate).toBe(false)
  })
})
