import type { SensorStatus } from '@/shared/api/types'
import { Badge, type Tone } from '@/shared/ui/badge'

export const SENSOR_STATUS: Record<SensorStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Activo', tone: 'success' },
  IN_MAINTENANCE: { label: 'En mantenimiento', tone: 'warning' },
  INACTIVE: { label: 'Inactivo', tone: 'neutral' },
  RETIRED: { label: 'Retirado', tone: 'neutral' },
}

export function SensorStatusBadge({ status }: { status: SensorStatus }) {
  return (
    <Badge tone={SENSOR_STATUS[status].tone} dot>
      {SENSOR_STATUS[status].label}
    </Badge>
  )
}
