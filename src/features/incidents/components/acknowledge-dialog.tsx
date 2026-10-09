import type { Incident } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { TextareaField } from '@/shared/ui/field'
import { useAcknowledgeIncident } from '../api/incidents'

interface AcknowledgeDialogProps {
  readonly incident: Incident | null
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

/** Used from the list and from the detail: acknowledging stays possible after the deadline. */
export function AcknowledgeDialog({ incident, onClose, onDone }: AcknowledgeDialogProps) {
  const acknowledge = useAcknowledgeIncident()

  function close() {
    acknowledge.reset()
    onClose()
  }

  return (
    <FormDialog
      open={incident !== null}
      onOpenChange={(open) => !open && close()}
      title="Reconocer incidente"
      description="Confirma que ya lo estás atendiendo. Solo se puede reconocer una vez."
      submitLabel="Reconocer"
      pending={acknowledge.isPending}
      error={acknowledge.error}
      onSubmit={(data) => {
        if (!incident) return
        const note = String(data.get('note') ?? '').trim()
        acknowledge.mutate(
          { incidentId: incident.id, note: note || undefined },
          {
            onSuccess: () => {
              onDone('Incidente reconocido.')
              close()
            },
          },
        )
      }}
    >
      <TextareaField label="Nota (opcional)" name="note" maxLength={500} />
    </FormDialog>
  )
}
