const dateTime = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDateTime = (iso: string | null | undefined): string =>
  iso ? dateTime.format(new Date(iso)) : '—'

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours} h ${minutes % 60} min`
}

export const formatPercent = (ratio: number | null | undefined): string =>
  ratio == null ? '—' : `${Math.round(ratio * 100)} %`

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/** "en 4 minutos" / "hace 2 horas", relative to `now`; `isPast` tells overdue deadlines apart. */
export function formatRelative(iso: string, now: number): { text: string; isPast: boolean } {
  const diff = new Date(iso).getTime() - now
  const abs = Math.abs(diff)
  const [unit, size] = UNITS.find(([, ms]) => abs >= ms) ?? UNITS[UNITS.length - 1]!
  const value = Math.round(diff / size)
  return { text: relative.format(value, unit), isPast: diff < 0 }
}
