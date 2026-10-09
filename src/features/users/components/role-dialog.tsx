import { useState, type SubmitEvent } from 'react'
import type { Role, User } from '@/shared/api/types'
import { ALL_ROLES, ROLE_LABELS } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { CheckboxField, TextareaField } from '@/shared/ui/field'
import { ErrorState } from '@/shared/ui/states'
import { useChangeRoles } from '../api/users'

interface RoleDialogProps {
  readonly user: User | null
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

const labels = (roles: Role[]) => roles.map((role) => ROLE_LABELS[role]).join(', ')

export function RoleDialog({ user, onClose, onDone }: RoleDialogProps) {
  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => !open && onClose()}
      title={user ? `Roles de ${user.username}` : 'Roles'}
      description="Marca los roles que debe tener. El motivo es obligatorio y queda en el historial."
    >
      {user && <RoleForm key={user.userId} user={user} onClose={onClose} onDone={onDone} />}
    </Dialog>
  )
}

function RoleForm({
  user,
  onClose,
  onDone,
}: {
  readonly user: User
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}) {
  const change = useChangeRoles()
  const [selected, setSelected] = useState<Set<Role>>(new Set(user.roles))
  const [reasonError, setReasonError] = useState<string>()

  const add = ALL_ROLES.filter((role) => selected.has(role) && !user.roles.includes(role))
  const remove = ALL_ROLES.filter((role) => !selected.has(role) && user.roles.includes(role))
  const hasChanges = add.length + remove.length > 0
  const result = change.data

  function toggle(role: Role, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(role)
      else next.delete(role)
      return next
    })
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const reasonValue = new FormData(event.currentTarget).get('reason')
    const reason = typeof reasonValue === 'string' ? reasonValue.trim() : ''
    if (!reason) {
      setReasonError('Indica el motivo del cambio')
      return
    }
    setReasonError(undefined)
    change.mutate(
      { userId: user.userId, add, remove, reason },
      {
        onSuccess: ({ added, removed, failed }) => {
          if (failed) return
          const parts = [
            added.length ? `asignados: ${labels(added)}` : '',
            removed.length ? `revocados: ${labels(removed)}` : '',
          ].filter(Boolean)
          onDone(`Roles de ${user.username} actualizados (${parts.join(' · ')}).`)
          onClose()
        },
      },
    )
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
      <fieldset className="flex flex-col gap-0.5">
        <legend className="mb-1 text-caption font-semibold text-fg-muted">Roles</legend>
        {ALL_ROLES.map((role) => (
          <CheckboxField
            key={role}
            label={ROLE_LABELS[role]}
            checked={selected.has(role)}
            onChange={(event) => toggle(role, event.target.checked)}
          />
        ))}
      </fieldset>

      <p className="text-small text-fg-muted" aria-live="polite">
        {hasChanges
          ? [
              add.length ? `Se asignará: ${labels(add)}.` : '',
              remove.length ? `Se revocará: ${labels(remove)}.` : '',
            ]
              .filter(Boolean)
              .join(' ')
          : 'Sin cambios por guardar.'}
      </p>

      {hasChanges && <TextareaField label="Motivo" name="reason" error={reasonError} />}

      {result?.failed && (
        <div className="flex flex-col gap-2">
          <ErrorState error={result.failed} />
          {result.added.length + result.removed.length > 0 && (
            <p className="text-small text-fg-muted">
              Antes del error se aplicó: {labels([...result.added, ...result.removed])}. Revisa la
              lista.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!hasChanges} loading={change.isPending}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
