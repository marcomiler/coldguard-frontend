import { useState } from 'react'
import { useAssetOptions } from '@/shared/api/asset-names'
import { fieldError } from '@/shared/api/errors'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field } from '@/shared/ui/field'
import { SelectField } from '@/shared/ui/select'
import { useRegisterSensor } from '../api/sensors'

interface RegisterSensorDialogProps {
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

export function RegisterSensorDialog({ onClose, onDone }: RegisterSensorDialogProps) {
  const register = useRegisterSensor()
  const assets = useAssetOptions(true)
  const [errors, setErrors] = useState<{ assetId?: string; serialNumber?: string }>({})
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Registrar sensor"
      description="Nace activo y asociado a una unidad. Después podrás definir su perfil y calibrarlo."
      submitLabel="Registrar sensor"
      pending={register.isPending}
      error={assets.error ?? register.error}
      onSubmit={(data) => {
        const assetId = String(data.get('assetId') ?? '')
        const serialNumber = String(data.get('serialNumber') ?? '').trim()
        const model = String(data.get('model') ?? '').trim()
        const next = {
          assetId: assetId ? undefined : 'Elige la unidad',
          serialNumber: serialNumber ? undefined : 'Ingresa el número de serie',
        }
        setErrors(next)
        if (next.assetId || next.serialNumber) return
        register.mutate(
          { assetId, serialNumber, model: model || undefined, measurementUnit: 'CELSIUS' },
          {
            onSuccess: () => {
              onDone(`Sensor registrado: ${serialNumber}.`)
              onClose()
            },
          },
        )
      }}
    >
      <div className="flex flex-col gap-1.5">
        <SelectField label="Unidad" name="assetId">
          <option value="">Elige una unidad</option>
          {assets.data?.items.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </SelectField>
        {errors.assetId && <p className="text-caption text-danger-fg">{errors.assetId}</p>}
      </div>
      <Field
        label="Número de serie"
        name="serialNumber"
        maxLength={80}
        autoComplete="off"
        error={errors.serialNumber ?? fieldError(register.error, 'serialNumber')}
      />
      <Field label="Modelo (opcional)" name="model" maxLength={80} autoComplete="off" />
    </FormDialog>
  )
}
