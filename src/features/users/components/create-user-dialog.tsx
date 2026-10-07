import { useState, type FormEvent } from 'react'
import { fieldError, isApiError } from '@/shared/api/errors'
import type { Role } from '@/shared/api/types'
import { ALL_ROLES, ROLE_LABELS } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { CheckboxField, Field } from '@/shared/ui/field'
import { ErrorState } from '@/shared/ui/states'
import { useCreateUser } from '../api/users'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (username: string) => void
}

const FIELDS = ['username', 'displayName', 'email', 'initialPassword'] as const
const REQUIRED: Record<(typeof FIELDS)[number], string> = {
  username: 'Ingresa el nombre de usuario',
  displayName: 'Ingresa el nombre completo',
  email: 'Ingresa el correo',
  initialPassword: 'Ingresa una contraseña inicial',
}

export function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const create = useCreateUser()
  const [errors, setErrors] = useState<Partial<Record<(typeof FIELDS)[number], string>>>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? '').trim()])) as {
      [K in (typeof FIELDS)[number]]: string
    }
    const next = Object.fromEntries(
      FIELDS.filter((f) => !values[f]).map((f) => [f, REQUIRED[f]]),
    ) as typeof errors
    setErrors(next)
    if (Object.keys(next).length > 0) return
    // The password is sent as typed: trimming it would alter it.
    const initialPassword = String(data.get('initialPassword') ?? '')
    const roles = data.getAll('roles').map(String) as Role[]
    create.mutate(
      { ...values, initialPassword, roles },
      {
        onSuccess: () => {
          onCreated(values.username)
          onOpenChange(false)
        },
      },
    )
  }

  const serverError = (field: string) => fieldError(create.error, field)
  const showGeneric =
    create.isError && !(isApiError(create.error) && create.error.fieldErrors.length)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Crear usuario"
      description="Define la contraseña inicial con la que ingresará."
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
        <Field
          label="Nombre de usuario"
          name="username"
          autoComplete="off"
          error={errors.username ?? serverError('username')}
        />
        <Field
          label="Nombre completo"
          name="displayName"
          autoComplete="off"
          error={errors.displayName ?? serverError('displayName')}
        />
        <Field
          label="Correo"
          name="email"
          type="email"
          autoComplete="off"
          error={errors.email ?? serverError('email')}
        />
        <Field
          label="Contraseña inicial"
          name="initialPassword"
          type="password"
          autoComplete="new-password"
          error={errors.initialPassword ?? serverError('initialPassword')}
        />
        <fieldset className="flex flex-col gap-0.5">
          <legend className="mb-1 text-caption font-semibold text-fg-muted">Roles</legend>
          {ALL_ROLES.map((role) => (
            <CheckboxField key={role} name="roles" value={role} label={ROLE_LABELS[role]} />
          ))}
          {serverError('roles') && (
            <p className="text-caption text-danger-fg">{serverError('roles')}</p>
          )}
        </fieldset>
        {showGeneric && <ErrorState error={create.error} />}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" loading={create.isPending}>
            Crear usuario
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
