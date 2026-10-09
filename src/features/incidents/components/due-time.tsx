import { cn } from '@/shared/lib/cn'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'

interface DueTimeProps {
  readonly iso: string | null | undefined
  /** When the deadline was already met it no longer counts down: its exact time is shown. */
  readonly met?: boolean
}

/** A deadline as relative text (overdue flagged with words, not only color) and exact time. */
export function DueTime({ iso, met }: DueTimeProps) {
  const now = useNow()
  if (!iso) return <span className="text-fg-muted">—</span>
  if (met) return <time dateTime={iso}>{formatDateTime(iso)}</time>
  const { text, isPast } = formatRelative(iso, now)
  const overdue = isPast
  return (
    <time
      dateTime={iso}
      title={formatDateTime(iso)}
      className={cn('whitespace-nowrap', overdue && 'font-semibold text-danger-fg')}
    >
      {overdue ? `Vencido ${text}` : text}
    </time>
  )
}
