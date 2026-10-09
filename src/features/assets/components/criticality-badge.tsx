import type { Criticality } from '@/shared/api/types'
import { Badge, type Tone } from '@/shared/ui/badge'

const CRITICALITY: Record<Criticality, { label: string; tone: Tone }> = {
  LOW: { label: 'Baja', tone: 'neutral' },
  MEDIUM: { label: 'Media', tone: 'info' },
  HIGH: { label: 'Alta', tone: 'warning' },
  CRITICAL: { label: 'Crítica', tone: 'danger' },
}

export function CriticalityBadge({ criticality }: { criticality: Criticality }) {
  const { label, tone } = CRITICALITY[criticality]
  return <Badge tone={tone}>{label}</Badge>
}

export const CRITICALITY_OPTIONS = (Object.keys(CRITICALITY) as Criticality[]).map(
  (value) => [value, CRITICALITY[value].label] as const,
)
