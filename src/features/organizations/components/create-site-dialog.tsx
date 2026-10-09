import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field } from '@/shared/ui/field'
import { useCreateSite } from '../api/organizations'

interface CreateSiteDialogProps {
  readonly organization: { id: string; name: string }
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

export function CreateSiteDialog({ organization, onClose, onDone }: CreateSiteDialogProps) {
  const create = useCreateSite()
  const [nameError, setNameError] = useState<string>()
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Crear sede en ${organization.name}`}
      submitLabel="Crear sede"
      pending={create.isPending}
      error={create.error}
      onSubmit={(data) => {
        const name = String(data.get('name') ?? '').trim()
        const address = String(data.get('address') ?? '').trim()
        if (!name) return setNameError('Ingresa el nombre de la sede')
        create.mutate(
          { organizationId: organization.id, name, address: address || undefined },
          {
            onSuccess: () => {
              onDone(`Sede creada: ${name}.`)
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
      <Field label="Dirección (opcional)" name="address" maxLength={200} autoComplete="off" />
    </FormDialog>
  )
}
