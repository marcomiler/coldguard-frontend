import { sentence } from '@/shared/lib/describe-change'

const ENTITY_LABELS: Record<string, string> = {
  Incident: 'Incidente',
  Asset: 'Activo',
  Sensor: 'Sensor',
  User: 'Usuario',
  Organization: 'Organización',
  Site: 'Sede',
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: 'Creado',
  ACKNOWLEDGED: 'Reconocido',
  ESCALATED: 'Escalado',
  CLOSED: 'Cerrado',
  OCCURRENCE_REGISTERED: 'Nueva ocurrencia',
  PRIORITY_RECALCULATED: 'Prioridad recalculada',
  ASSET_REGISTERED: 'Activo registrado',
  ASSET_UPDATED: 'Activo actualizado',
  SENSOR_REGISTERED: 'Sensor registrado',
  SENSOR_UPDATED: 'Sensor actualizado',
  SENSOR_STATUS_CHANGED: 'Estado del sensor cambiado',
  SENSOR_CALIBRATION_RECORDED: 'Calibración registrada',
  SENSOR_CALIBRATION_EXPIRED: 'Calibración vencida',
  SENSOR_CONNECTIVITY_LOST: 'Conectividad perdida',
  SENSOR_CONNECTIVITY_RESTORED: 'Conectividad recuperada',
  SENSOR_REASSIGNED: 'Sensor reasignado',
  SENSOR_RETIRED: 'Sensor retirado',
  OPERATIONAL_PROFILE_UPDATED: 'Perfil operativo actualizado',
}

const ACTOR_LABELS: Record<string, string> = {
  'incident-service': 'Servicio de incidentes',
  'asset-service': 'Servicio de activos',
  'telemetry-service': 'Servicio de telemetría',
  'notification-service': 'Servicio de notificaciones',
  'calibration-expiry-job': 'Vencimiento de calibraciones',
  'connectivity-monitor': 'Monitor de conectividad',
}

export const entityLabel = (type: string) => ENTITY_LABELS[type] ?? type

/** `CREATED` and the incident transitions say nothing alone, so they take the entity. */
export function actionLabel(action: string, entityType: string): string {
  if (action === 'CREATED') {
    return entityType === 'Incident'
      ? 'Incidente creado'
      : `Alta de ${entityLabel(entityType).toLowerCase()}`
  }
  if (entityType === 'Incident' && ['ACKNOWLEDGED', 'ESCALATED', 'CLOSED'].includes(action)) {
    return `Incidente ${ACTION_LABELS[action]?.toLowerCase()}`
  }
  return ACTION_LABELS[action] ?? sentence(action)
}

export const actorLabel = (id: string) => ACTOR_LABELS[id] ?? id

export { describeChange, shortId, type ChangeLine } from '@/shared/lib/describe-change'
