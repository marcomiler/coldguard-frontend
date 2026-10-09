import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field } from '@/shared/ui/field'
import { useCreateOrganization } from '../api/organizations'

interface DialogProps {
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

export function CreateOrganizationDialog({ onClose, onDone }: DialogProps) {
  const create = useCreateOrganization()
  const [nameError, setNameError] = useState<string>()
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Crear organización"
      submitLabel="Crear organización"
      pending={create.isPending}
      error={create.error}
      onSubmit={(data) => {
        const name = String(data.get('name') ?? '').trim()
        if (!name) return setNameError('Ingresa el nombre de la organización')
        create.mutate(
          { name },
          {
            onSuccess: () => {
              onDone(`Organización creada: ${name}.`)
              onClose()
            },
          },
        )
      }}
    >
      <Field
        label="Nombre"
        name="name"
        maxLength={120}
        autoComplete="off"
        error={nameError ?? fieldError(create.error, 'name')}
      />
    </FormDialog>
  )
}
