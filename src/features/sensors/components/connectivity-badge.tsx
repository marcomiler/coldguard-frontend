import type { Connectivity } from '@/shared/api/types'
import { formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'

interface ConnectivityBadgeProps {
  readonly connectivity: Connectivity | undefined
  readonly now: number
}

export function ConnectivityBadge({ connectivity, now }: ConnectivityBadgeProps) {
  if (!connectivity) return <Badge>Sin lecturas</Badge>
  if (connectivity.connectivityLostAt) {
    return (
      <Badge tone="danger" dot>
        Sin señal {formatRelative(connectivity.connectivityLostAt, now).text}
      </Badge>
    )
  }
  return (
    <Badge tone="success" dot>
      Con señal
    </Badge>
  )
}
