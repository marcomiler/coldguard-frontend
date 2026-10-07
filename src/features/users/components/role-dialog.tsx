import { useState, type FormEvent } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { Role, User } from '@/shared/api/types'
import { ALL_ROLES, ROLE_LABELS } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { TextareaField } from '@/shared/ui/field'
import { SelectField } from '@/shared/ui/select'
import { ErrorState } from '@/shared/ui/states'
import { useChangeRole } from '../api/users'

interface RoleDialogProps {
  user: User | null
  onClose: () => void
  onDone: (message: string) => void
}

export function RoleDialog({ user, onClose, onDone }: RoleDialogProps) {
  const change = useChangeRole()
  const [action, setAction] = useState<'assign' | 'revoke'>('assign')
  const [reasonError, setReasonError] = useState<string>()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const data = new FormData(event.currentTarget)
    const reason = String(data.get('reason') ?? '').trim()
    const role = String(data.get('role')) as Role
    if (!reason) {
      setReasonError('Indica el motivo del cambio')
      return
    }
    setReasonError(undefined)
    change.mutate(
      { userId: user.userId, action, role, reason },
      {
        onSuccess: () => {
          onDone(
            `${action === 'assign' ? 'Rol asignado' : 'Rol revocado'}: ${ROLE_LABELS[role]} · ${user.username}.`,
          )
          onClose()
        },
      },
    )
  }

  function close(open: boolean) {
    if (open) return
    change.reset()
    setReasonError(undefined)
    onClose()
  }

  return (
    <Dialog
      open={user !== null}
      onOpenChange={close}
      title={user ? `Roles de ${user.username}` : 'Roles'}
      description="El motivo es obligatorio y queda en el historial."
    >
      {user && (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
          <SelectField
            label="Acción"
            value={action}
            onChange={(event) => setAction(event.target.value as 'assign' | 'revoke')}
          >
            <option value="assign">Asignar rol</option>
            <option value="revoke">Revocar rol</option>
          </SelectField>
          <SelectField label="Rol" name="role" defaultValue={user.roles[0] ?? ALL_ROLES[0]}>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
                {user.roles.includes(role) ? ' (actual)' : ''}
              </option>
            ))}
          </SelectField>
          <TextareaField
            label="Motivo"
            name="reason"
            error={reasonError ?? fieldError(change.error, 'reason')}
          />
          {change.isError && <ErrorState error={change.error} />}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => close(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={action === 'revoke' ? 'danger' : 'primary'}
              loading={change.isPending}
            >
              {action === 'assign' ? 'Asignar rol' : 'Revocar rol'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
