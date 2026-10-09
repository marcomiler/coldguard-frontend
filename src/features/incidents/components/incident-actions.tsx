import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { Incident, Role } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Button } from '@/shared/ui/button'
import { TextareaField } from '@/shared/ui/field'
import { useEscalateIncident } from '../api/incidents'
import { incidentPermissions } from '../permissions'
import { AcknowledgeDialog } from './acknowledge-dialog'
import { CloseDialog } from './close-dialog'

type Action = 'acknowledge' | 'escalate' | 'close'

interface IncidentActionsProps {
  readonly incident: Incident
  readonly roles: readonly Role[]
  readonly onDone: (message: string) => void
}

export function IncidentActions({ incident, roles, onDone }: IncidentActionsProps) {
  const [open, setOpen] = useState<Action | null>(null)
  const [reasonError, setReasonError] = useState<string>()
  const escalate = useEscalateIncident()
  const can = incidentPermissions(roles, incident)

  function closeEscalate() {
    setOpen(null)
    setReasonError(undefined)
    escalate.reset()
  }

  if (!can.canAcknowledge && !can.canEscalate && !can.canClose) return null

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {can.canEscalate && (
          <Button variant="danger" onClick={() => setOpen('escalate')}>
            Escalar
          </Button>
        )}
        {can.canAcknowledge && <Button onClick={() => setOpen('acknowledge')}>Reconocer</Button>}
        {can.canClose && <Button onClick={() => setOpen('close')}>Cerrar incidente</Button>}
      </div>

      <AcknowledgeDialog
        incident={open === 'acknowledge' ? incident : null}
        onClose={() => setOpen(null)}
        onDone={onDone}
      />
      <CloseDialog
        incident={open === 'close' ? incident : null}
        onClose={() => setOpen(null)}
        onDone={onDone}
      />

      <FormDialog
        open={open === 'escalate'}
        onOpenChange={(isOpen) => !isOpen && closeEscalate()}
        title="Escalar incidente"
        description="El motivo es obligatorio y queda en el historial."
        submitLabel="Escalar incidente"
        submitVariant="danger"
        pending={escalate.isPending}
        error={escalate.error}
        onSubmit={(data) => {
          const reason = String(data.get('reason') ?? '').trim()
          if (!reason) {
            setReasonError('Indica el motivo del escalamiento')
            return
          }
          escalate.mutate(
            { incidentId: incident.id, reason },
            {
              onSuccess: () => {
                onDone('Incidente escalado.')
                closeEscalate()
              },
            },
          )
        }}
      >
        <TextareaField
          label="Motivo"
          name="reason"
          maxLength={500}
          error={reasonError ?? fieldError(escalate.error, 'reason')}
        />
      </FormDialog>
    </>
  )
}
