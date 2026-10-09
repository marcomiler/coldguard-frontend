import { useState } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { Criticality } from '@/shared/api/types'
import { FormDialog } from '@/shared/patterns/form-dialog'
import { Field, TextareaField } from '@/shared/ui/field'
import { SelectField } from '@/shared/ui/select'
import { CRITICALITY_OPTIONS } from './criticality-badge'
import { useOrganizations, useRegisterAsset, useSites } from '../api/assets'

interface RegisterAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (name: string) => void
}

export function RegisterAssetDialog({ open, onOpenChange, onCreated }: RegisterAssetDialogProps) {
  const register = useRegisterAsset()
  const organizations = useOrganizations(open)
  const [organizationId, setOrganizationId] = useState('')
  const sites = useSites(organizationId)
  const [errors, setErrors] = useState<{ siteId?: string; name?: string }>({})

  function dismiss(isOpen: boolean) {
    if (isOpen) return
    register.reset()
    setOrganizationId('')
    setErrors({})
    onOpenChange(false)
  }

  const noOrganizations = organizations.data && organizations.data.items.length === 0

  return (
    <FormDialog
      open={open}
      onOpenChange={dismiss}
      title="Registrar unidad de frío"
      description="Una unidad pertenece a una sede. Después podrás agregarle sensores."
      submitLabel="Registrar unidad"
      pending={register.isPending}
      error={organizations.error ?? sites.error ?? register.error}
      onSubmit={(data) => {
        const siteId = String(data.get('siteId') ?? '')
        const name = String(data.get('name') ?? '').trim()
        const description = String(data.get('description') ?? '').trim()
        const next = {
          siteId: siteId ? undefined : 'Elige la sede',
          name: name ? undefined : 'Ingresa el nombre de la unidad',
        }
        setErrors(next)
        if (next.siteId || next.name) return
        register.mutate(
          {
            siteId,
            name,
            description: description || undefined,
            criticality: String(data.get('criticality')) as Criticality,
          },
          {
            onSuccess: () => {
              onCreated(name)
              dismiss(false)
            },
          },
        )
      }}
    >
      {noOrganizations ? (
        <p className="text-small text-fg-muted">
          Aún no hay organizaciones ni sedes. Deben existir antes de registrar una unidad.
        </p>
      ) : (
        <>
          <SelectField
            label="Organización"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
          >
            <option value="">Elige una organización</option>
            {organizations.data?.items.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </SelectField>
          <div className="flex flex-col gap-1.5">
            <SelectField label="Sede" name="siteId" disabled={organizationId === ''}>
              <option value="">Elige una sede</option>
              {sites.data?.items.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </SelectField>
            {(errors.siteId ?? fieldError(register.error, 'siteId')) && (
              <p className="text-caption text-danger-fg">
                {errors.siteId ?? fieldError(register.error, 'siteId')}
              </p>
            )}
          </div>
        </>
      )}
      <Field
        label="Nombre"
        name="name"
        maxLength={120}
        autoComplete="off"
        error={errors.name ?? fieldError(register.error, 'name')}
      />
      <TextareaField label="Descripción (opcional)" name="description" maxLength={500} />
      <SelectField label="Criticidad" name="criticality" defaultValue="MEDIUM">
        {CRITICALITY_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
    </FormDialog>
  )
}
