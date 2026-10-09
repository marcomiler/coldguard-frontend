import type { Incident, Role } from '@/shared/api/types'

/**
 * Which actions to offer. The roles mirror the contract; the status checks only avoid offering a
 * button that would certainly be rejected. The backend remains the authority on every transition.
 */
export const incidentPermissions = (roles: readonly Role[], incident: Incident) => {
  const open = incident.status !== 'CLOSED'
  return {
    canAcknowledge:
      roles.includes('OPERATIONS_SUPERVISOR') && open && incident.acknowledgedAt == null,
    canEscalate: roles.includes('OPERATIONS_SUPERVISOR') && open,
    canClose: roles.includes('MAINTENANCE_TECHNICIAN') && open,
  }
}
