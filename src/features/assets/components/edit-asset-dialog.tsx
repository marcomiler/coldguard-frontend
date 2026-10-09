import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { Asset, Criticality } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field, TextareaField } from '@/shared/ui/field'
import { SelectField } from '@/shared/ui/select'
import { useUpdateAsset } from '../api/assets'
import { CRITICALITY_OPTIONS } from './criticality-badge'

interface EditAssetDialogProps {
  readonly asset: Asset
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

export function EditAssetDialog({ asset, onClose, onDone }: EditAssetDialogProps) {
  const update = useUpdateAsset()
  const [nameError, setNameError] = useState<string>()
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Editar ${asset.name}`}
      description="Si alguien más la modificó antes, se te pedirá recargar para no pisar sus cambios."
      submitLabel="Guardar cambios"
      pending={update.isPending}
      error={update.error}
      onSubmit={(data) => {
        const name = String(data.get('name') ?? '').trim()
        if (!name) return setNameError('Ingresa el nombre de la unidad')
        update.mutate(
          {
            assetId: asset.id,
            expectedVersion: asset.version,
            name,
            // A blank description clears it on the backend.
            description: String(data.get('description') ?? '').trim(),
            criticality: String(data.get('criticality')) as Criticality,
          },
          {
            onSuccess: () => {
              onDone(`Unidad actualizada: ${name}.`)
              onClose()
            },
          },
        )
      }}
    >
      <Field
        label="Nombre"
        name="name"
        defaultValue={asset.name}
        maxLength={120}
        autoComplete="off"
        error={nameError ?? fieldError(update.error, 'name')}
      />
      <TextareaField
        label="Descripción (opcional)"
        name="description"
        defaultValue={asset.description ?? ''}
        maxLength={500}
      />
      <SelectField label="Criticidad" name="criticality" defaultValue={asset.criticality}>
        {CRITICALITY_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
    </FormDialog>
  )
}
