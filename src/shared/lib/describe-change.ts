import { formatDateTime } from './format'

export const sentence = (code: string) => {
  const words = code.toLowerCase().replaceAll('_', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const shortId = (id: string) => id.slice(0, 8)

const FIELD_LABELS: Record<string, string> = {
  status: 'Estado',
  priority: 'Prioridad',
  urgency: 'Urgencia',
  impact: 'Impacto',
  magnitude: 'Magnitud',
  ackDueAt: 'Plazo para reconocer',
  resolveDueAt: 'Plazo para resolver',
  acknowledgedAt: 'Reconocido el',
  occurrenceCount: 'Ocurrencias',
  name: 'Nombre',
  siteId: 'Sede',
  criticality: 'Criticidad',
  unit: 'Unidad de medida',
  minTemperature: 'Temperatura mínima',
  maxTemperature: 'Temperatura máxima',
  magnitudeMediumFrom: 'Magnitud media desde',
  magnitudeHighFrom: 'Magnitud alta desde',
  magnitudeCriticalFrom: 'Magnitud crítica desde',
  expectedIntervalSeconds: 'Intervalo esperado de lecturas',
  persistenceWindowSeconds: 'Ventana de persistencia',
  persistenceMinConsecutiveBreaches: 'Lecturas consecutivas fuera de rango',
  kind: 'Tipo',
  validUntil: 'Válida hasta',
  performedAt: 'Realizada el',
  expiredAt: 'Venció el',
  detectedAt: 'Detectado el',
  lastReadingAt: 'Última lectura',
  calibrationId: 'Calibración',
}

const VALUE_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  IN_MAINTENANCE: 'En mantenimiento',
  INACTIVE: 'Inactivo',
  RETIRED: 'Retirado',
  CREATED: 'Creado',
  ACKNOWLEDGED: 'Reconocido',
  ESCALATED: 'Escalado',
  CLOSED: 'Cerrado',
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
  IMMEDIATE: 'Inmediata',
  CELSIUS: '°C',
  CALIBRATION: 'Calibración',
  VERIFICATION: 'Verificación',
}

const ISO = /^\d{4}-\d{2}-\d{2}T/
const UUID = /^\w{8}-\w{4}-/

function formatValue(key: string, value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'number' || (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value))) {
    const number = Number(value)
    if (/Temperature|From$/.test(key)) return `${number} °C`
    if (/Seconds$/.test(key)) return `${number} s`
    return String(number)
  }
  if (typeof value === 'string') {
    if (ISO.test(value)) return formatDateTime(value)
    if (UUID.test(value)) return shortId(value)
    return VALUE_LABELS[value] ?? value
  }
  return JSON.stringify(value) ?? '—'
}

export interface ChangeLine {
  label: string
  before?: string
  after: string
}

/** Turns the before/after snapshots into "label: before → after" lines, only for what changed. */
export function describeChange(
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown> | null | undefined,
): ChangeLine[] {
  const keys = [...new Set([...Object.keys(previous ?? {}), ...Object.keys(next ?? {})])]
  return keys
    .filter((key) => previous?.[key] !== next?.[key])
    .map((key) => ({
      label: FIELD_LABELS[key] ?? sentence(key.replace(/([A-Z])/g, '_$1')),
      before: previous && key in previous ? formatValue(key, previous[key]) : undefined,
      after: formatValue(key, next?.[key]),
    }))
}
