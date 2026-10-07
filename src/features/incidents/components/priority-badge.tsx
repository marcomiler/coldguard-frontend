import type { Priority } from '@/shared/api/types'
import { cn } from '@/shared/lib/cn'

const STYLES: Record<Priority, string> = {
  P1: 'border-danger bg-danger text-bg',
  P2: 'border-warning bg-warning-subtle text-warning-fg',
  P3: 'border-info bg-info-subtle text-info-fg',
  P4: 'border-neutral text-neutral-fg',
}

/** Renders the priority as text; `pulse` marks an unacknowledged P1. */
export function PriorityBadge({ priority, pulse }: { priority: Priority; pulse?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-8 items-center justify-center rounded-sm border px-1.5 font-mono text-caption font-semibold',
        STYLES[priority],
        pulse && priority === 'P1' && 'animate-pulse-ring motion-reduce:animate-none',
      )}
    >
      {priority}
    </span>
  )
}
