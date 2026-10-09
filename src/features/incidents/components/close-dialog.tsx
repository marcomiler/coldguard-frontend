import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { Incident } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { TextareaField } from '@/shared/ui/field'
import { useCloseIncident } from '../api/incidents'

interface CloseDialogProps {
  readonly incident: Incident | null
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

const MAX = 500

/** Closing is how an incident gets resolved: the backend has no separate "resolved" state. */
export function CloseDialog({ incident, onClose, onDone }: CloseDialogProps) {
  const close = useCloseIncident()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function dismiss() {
    close.reset()
    setErrors({})
    onClose()
  }

  return (
    <FormDialog
      open={incident !== null}
      onOpenChange={(open) => !open && dismiss()}
      title="Cerrar incidente"
      description="Indica la causa y cómo se resolvió. Quedará en el historial."
      submitLabel="Cerrar incidente"
      pending={close.isPending}
      error={close.error}
      onSubmit={(data) => {
        if (!incident) return
        const causeValue = data.get('cause')
        const cause = typeof causeValue === 'string' ? causeValue.trim() : ''

        const resolutionCommentValue = data.get('resolutionComment')
        const resolutionComment =
          typeof resolutionCommentValue === 'string' ? resolutionCommentValue.trim() : ''

        const next: Record<string, string> = {}
        if (!cause) next.cause = 'Indica la causa'
        if (!resolutionComment) next.resolutionComment = 'Describe cómo se resolvió'
        setErrors(next)
        if (Object.keys(next).length > 0) return
        close.mutate(
          { incidentId: incident.id, cause, resolutionComment },
          {
            onSuccess: () => {
              onDone('Incidente cerrado.')
              dismiss()
            },
          },
        )
      }}
    >
      <TextareaField
        label="Causa"
        name="cause"
        maxLength={MAX}
        error={errors.cause ?? fieldError(close.error, 'cause')}
      />
      <TextareaField
        label="Cómo se resolvió"
        name="resolutionComment"
        maxLength={MAX}
        error={errors.resolutionComment ?? fieldError(close.error, 'resolutionComment')}
      />
    </FormDialog>
  )
}
