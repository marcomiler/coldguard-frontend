import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { Sensor, SensorStatus } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field, TextareaField } from '@/shared/ui/field'
import { SelectField } from '@/shared/ui/select'
import {
  useChangeSensorStatus,
  useRecordCalibration,
  useReassignSensor,
  useRetireSensor,
  useUpdateSensor,
} from '../api/sensors'
import { SENSOR_STATUS } from './sensor-status-badge'

interface SensorDialogProps {
  readonly sensor: Sensor
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

const text = (data: FormData, name: string) => String(data.get(name) ?? '').trim()

/** Local `datetime-local` value for "now", the default and upper bound of a calibration date. */
const nowLocal = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function StatusDialog({ sensor, onClose, onDone }: SensorDialogProps) {
  const change = useChangeSensorStatus()
  const [reasonError, setReasonError] = useState<string>()
  // Retirement is final and has its own action.
  const targets = (Object.keys(SENSOR_STATUS) as SensorStatus[]).filter(
    (status) => status !== sensor.status && status !== 'RETIRED',
  )
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Cambiar estado de ${sensor.serialNumber}`}
      description="Para volver a Activo se exige una calibración vigente. El motivo queda en el historial."
      submitLabel="Cambiar estado"
      pending={change.isPending}
      error={change.error}
      onSubmit={(data) => {
        const reason = text(data, 'reason')
        if (!reason) return setReasonError('Indica el motivo del cambio')
        change.mutate(
          { sensorId: sensor.id, targetStatus: text(data, 'targetStatus') as SensorStatus, reason },
          {
            onSuccess: () => {
              onDone('Estado del sensor actualizado.')
              onClose()
            },
          },
        )
      }}
    >
      <SelectField label="Nuevo estado" name="targetStatus">
        {targets.map((status) => (
          <option key={status} value={status}>
            {SENSOR_STATUS[status].label}
          </option>
        ))}
      </SelectField>
      <TextareaField
        label="Motivo"
        name="reason"
        maxLength={500}
        error={reasonError ?? fieldError(change.error, 'reason')}
      />
    </FormDialog>
  )
}

export function CalibrationDialog({ sensor, onClose, onDone }: SensorDialogProps) {
  const record = useRecordCalibration()
  const [errors, setErrors] = useState<{ performedAt?: string; reason?: string }>({})
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Registrar calibración de ${sensor.serialNumber}`}
      description="La vigencia se calcula con el perfil del sensor. Registrarla no cambia su estado."
      submitLabel="Registrar"
      pending={record.isPending}
      error={record.error}
      onSubmit={(data) => {
        const performedAt = text(data, 'performedAt')
        const reason = text(data, 'reason')
        const next = {
          performedAt: performedAt ? undefined : 'Indica cuándo se realizó',
          reason: reason ? undefined : 'Indica el motivo',
        }
        setErrors(next)
        if (next.performedAt || next.reason) return
        record.mutate(
          {
            sensorId: sensor.id,
            kind: text(data, 'kind') as 'CALIBRATION' | 'VERIFICATION',
            performedAt: new Date(performedAt).toISOString(),
            reason,
          },
          {
            onSuccess: () => {
              onDone('Calibración registrada.')
              onClose()
            },
          },
        )
      }}
    >
      <SelectField label="Tipo" name="kind">
        <option value="CALIBRATION">Calibración</option>
        <option value="VERIFICATION">Verificación</option>
      </SelectField>
      <Field
        label="Realizada el"
        name="performedAt"
        type="datetime-local"
        defaultValue={nowLocal()}
        max={nowLocal()}
        error={errors.performedAt ?? fieldError(record.error, 'performedAt')}
      />
      <TextareaField
        label="Motivo"
        name="reason"
        maxLength={500}
        error={errors.reason ?? fieldError(record.error, 'reason')}
      />
    </FormDialog>
  )
}

interface ReassignDialogProps extends SensorDialogProps {
  readonly assets: readonly { id: string; name: string }[]
}

export function ReassignDialog({ sensor, assets, onClose, onDone }: ReassignDialogProps) {
  const reassign = useReassignSensor()
  const [errors, setErrors] = useState<{ target?: string; reason?: string }>({})
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Reasignar ${sensor.serialNumber}`}
      description="Solo se puede mover un sensor en mantenimiento; seguirá en mantenimiento en la nueva unidad."
      submitLabel="Reasignar"
      pending={reassign.isPending}
      error={reassign.error}
      onSubmit={(data) => {
        const targetAssetId = text(data, 'targetAssetId')
        const reason = text(data, 'reason')
        const next = {
          target: targetAssetId ? undefined : 'Elige la unidad de destino',
          reason: reason ? undefined : 'Indica el motivo',
        }
        setErrors(next)
        if (next.target || next.reason) return
        reassign.mutate(
          { sensorId: sensor.id, targetAssetId, reason },
          {
            onSuccess: () => {
              onDone('Sensor reasignado.')
              onClose()
            },
          },
        )
      }}
    >
      <div className="flex flex-col gap-1.5">
        <SelectField label="Unidad de destino" name="targetAssetId">
          <option value="">Elige una unidad</option>
          {assets
            .filter((asset) => asset.id !== sensor.assetId)
            .map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
        </SelectField>
        {errors.target && <p className="text-caption text-danger-fg">{errors.target}</p>}
      </div>
      <TextareaField
        label="Motivo"
        name="reason"
        maxLength={500}
        error={errors.reason ?? fieldError(reassign.error, 'reason')}
      />
    </FormDialog>
  )
}

export function RetireDialog({ sensor, onClose, onDone }: SensorDialogProps) {
  const retire = useRetireSensor()
  const [reasonError, setReasonError] = useState<string>()
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Retirar ${sensor.serialNumber}`}
      description="El retiro es definitivo: el sensor deja de operar y su historial se conserva."
      submitLabel="Retirar sensor"
      submitVariant="danger"
      pending={retire.isPending}
      error={retire.error}
      onSubmit={(data) => {
        const reason = text(data, 'reason')
        if (!reason) return setReasonError('Indica el motivo del retiro')
        retire.mutate(
          { sensorId: sensor.id, reason },
          {
            onSuccess: () => {
              onDone('Sensor retirado.')
              onClose()
            },
          },
        )
      }}
    >
      <TextareaField
        label="Motivo"
        name="reason"
        maxLength={500}
        error={reasonError ?? fieldError(retire.error, 'reason')}
      />
    </FormDialog>
  )
}

export function EditSensorDialog({ sensor, onClose, onDone }: SensorDialogProps) {
  const update = useUpdateSensor()
  const [serialError, setSerialError] = useState<string>()
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Editar datos de ${sensor.serialNumber}`}
      submitLabel="Guardar"
      pending={update.isPending}
      error={update.error}
      onSubmit={(data) => {
        const serialNumber = text(data, 'serialNumber')
        if (!serialNumber) return setSerialError('Ingresa el número de serie')
        update.mutate(
          {
            sensorId: sensor.id,
            expectedVersion: sensor.version,
            serialNumber,
            model: text(data, 'model') || undefined,
          },
          {
            onSuccess: () => {
              onDone('Datos del sensor actualizados.')
              onClose()
            },
          },
        )
      }}
    >
      <Field
        label="Número de serie"
        name="serialNumber"
        defaultValue={sensor.serialNumber}
        maxLength={80}
        error={serialError ?? fieldError(update.error, 'serialNumber')}
      />
      <Field
        label="Modelo (opcional)"
        name="model"
        defaultValue={sensor.model ?? ''}
        maxLength={80}
      />
    </FormDialog>
  )
}
