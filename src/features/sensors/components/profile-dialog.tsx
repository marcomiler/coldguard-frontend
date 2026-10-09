import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { components } from '@/shared/api/schema'
import type { Sensor } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field } from '@/shared/ui/field'
import { usePutProfile } from '../api/sensors'

type Profile = components['schemas']['OperationalProfile']

interface ProfileDialogProps {
  readonly sensor: Sensor
  readonly profile: Profile | null | undefined
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

const NUMBER_FIELDS = [
  ['minTemperature', 'Temperatura mínima (°C)'],
  ['maxTemperature', 'Temperatura máxima (°C)'],
  ['mediumFrom', 'Magnitud media desde (± °C)'],
  ['highFrom', 'Magnitud alta desde (± °C)'],
  ['criticalFrom', 'Magnitud crítica desde (± °C)'],
  ['minConsecutiveBreaches', 'Lecturas consecutivas fuera de rango'],
  ['windowSeconds', 'Ventana de persistencia (s)'],
  ['expectedReadingIntervalSeconds', 'Intervalo esperado de lecturas (s)'],
] as const

type FieldName = (typeof NUMBER_FIELDS)[number][0]

const initial = (profile: Profile | null | undefined): Record<FieldName, string> => ({
  minTemperature: String(profile?.minTemperature ?? ''),
  maxTemperature: String(profile?.maxTemperature ?? ''),
  mediumFrom: String(profile?.magnitudeBands.mediumFrom ?? ''),
  highFrom: String(profile?.magnitudeBands.highFrom ?? ''),
  criticalFrom: String(profile?.magnitudeBands.criticalFrom ?? ''),
  minConsecutiveBreaches: String(profile?.persistence.minConsecutiveBreaches ?? ''),
  windowSeconds: String(profile?.persistence.windowSeconds ?? ''),
  expectedReadingIntervalSeconds: String(profile?.expectedReadingIntervalSeconds ?? ''),
})

export function ProfileDialog({ sensor, profile, onClose, onDone }: ProfileDialogProps) {
  const put = usePutProfile()
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const defaults = initial(profile)
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Perfil operativo de ${sensor.serialNumber}`}
      description="Define el rango seguro, cuándo una desviación es leve o crítica y cada cuánto debe reportar."
      submitLabel="Guardar perfil"
      pending={put.isPending}
      error={put.error}
      onSubmit={(data) => {
        const values = Object.fromEntries(
          NUMBER_FIELDS.map(([name]) => [name, String(data.get(name) ?? '').trim()]),
        ) as Record<FieldName, string>
        const next: Partial<Record<FieldName, string>> = {}
        for (const [name] of NUMBER_FIELDS) {
          if (values[name] === '' || !Number.isFinite(Number(values[name]))) {
            next[name] = 'Ingresa un número'
          }
        }
        setErrors(next)
        if (Object.keys(next).length > 0) return
        const validity = String(data.get('calibrationValiditySeconds') ?? '').trim()
        put.mutate(
          {
            sensorId: sensor.id,
            minTemperature: Number(values.minTemperature),
            maxTemperature: Number(values.maxTemperature),
            unit: sensor.measurementUnit,
            magnitudeBands: {
              mediumFrom: Number(values.mediumFrom),
              highFrom: Number(values.highFrom),
              criticalFrom: Number(values.criticalFrom),
            },
            persistence: {
              minConsecutiveBreaches: Number(values.minConsecutiveBreaches),
              windowSeconds: Number(values.windowSeconds),
            },
            expectedReadingIntervalSeconds: Number(values.expectedReadingIntervalSeconds),
            calibrationValiditySeconds: validity ? Number(validity) : null,
            version: profile?.version ?? 0,
          },
          {
            onSuccess: () => {
              onDone('Perfil operativo guardado.')
              onClose()
            },
          },
        )
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {NUMBER_FIELDS.map(([name, label]) => (
          <Field
            key={name}
            label={label}
            name={name}
            inputMode="decimal"
            autoComplete="off"
            defaultValue={defaults[name]}
            error={errors[name] ?? fieldError(put.error, name)}
          />
        ))}
        <Field
          label="Vigencia de calibración (s, opcional)"
          name="calibrationValiditySeconds"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={profile?.calibrationValiditySeconds ?? ''}
          hint="Vacío usa el valor por defecto del servicio."
        />
      </div>
    </FormDialog>
  )
}
