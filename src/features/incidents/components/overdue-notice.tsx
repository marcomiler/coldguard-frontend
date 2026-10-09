import type { Incident } from '@/shared/api/types'
import { formatRelative } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { Alert } from '@/shared/ui/alert'

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Explains an overdue deadline. A missed deadline does not block anything in the backend: it only
 * counts against the SLA metrics, and acknowledging or closing remain possible.
 */
export function OverdueNotice({ incident }: Readonly<{ incident: Incident }>) {
  const now = useNow()
  if (incident.status === 'CLOSED') return null

  const missed: string[] = []
  if (!incident.acknowledgedAt && incident.ackDueAt) {
    const { text, isPast } = formatRelative(incident.ackDueAt, now)
    if (isPast) missed.push(`el plazo para reconocerlo venció ${text}`)
  }
  if (incident.resolveDueAt) {
    const { text, isPast } = formatRelative(incident.resolveDueAt, now)
    if (isPast) missed.push(`el plazo para resolverlo venció ${text}`)
  }
  if (missed.length === 0) return null

  return (
    <Alert tone="warning">
      <p className="font-semibold">Incidente fuera de plazo</p>
      <p>
        {capitalize(missed.join(' y '))}.{' '}
        {incident.acknowledgedAt ? 'Sigue abierto hasta que se cierre.' : 'Aún puedes reconocerlo.'}{' '}
        Queda registrado como incumplimiento en las métricas de SLA.
      </p>
    </Alert>
  )
}
