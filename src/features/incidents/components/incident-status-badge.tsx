import type { IncidentStatus } from '@/shared/api/types'
import { Badge, type Tone } from '@/shared/ui/badge'

const STATUS: Record<IncidentStatus, { label: string; tone: Tone }> = {
  CREATED: { label: 'Creado', tone: 'danger' },
  ACKNOWLEDGED: { label: 'Reconocido', tone: 'warning' },
  ESCALATED: { label: 'Escalado', tone: 'info' },
  CLOSED: { label: 'Cerrado', tone: 'neutral' },
}

export const STATUS_LABELS = Object.fromEntries(
  Object.entries(STATUS).map(([key, value]) => [key, value.label]),
) as Record<IncidentStatus, string>

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge tone={STATUS[status].tone} dot>
      {STATUS[status].label}
    </Badge>
  )
}
