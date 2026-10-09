import { useState, type SubmitEvent } from 'react'
import { fieldError } from '@/shared/api/errors'
import type { User } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { TextareaField } from '@/shared/ui/field'
import { ErrorState } from '@/shared/ui/states'
import { useSetUserEnabled } from '../api/users'

interface EnabledDialogProps {
  readonly user: User | null
  readonly onClose: () => void
  readonly onDone: (message: string) => void
}

export function EnabledDialog({ user, onClose, onDone }: EnabledDialogProps) {
  const setEnabled = useSetUserEnabled()
  const [reasonError, setReasonError] = useState<string>()
  const enable = user ? !user.enabled : false
  const action = enable ? 'Habilitar' : 'Deshabilitar'

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const reasonValue = new FormData(event.currentTarget).get('reason')
    const reason = typeof reasonValue === 'string' ? reasonValue.trim() : ''

    if (!reason) {
      setReasonError('Indica el motivo del cambio')
      return
    }

    setReasonError(undefined)
    setEnabled.mutate(
      { userId: user.userId, enabled: enable, reason },
      {
        onSuccess: () => {
          onDone(`${enable ? 'Usuario habilitado' : 'Usuario deshabilitado'}: ${user.username}.`)
          onClose()
        },
      },
    )
  }

  function close(open: boolean) {
    if (open) return
    setEnabled.reset()
    setReasonError(undefined)
    onClose()
  }

  return (
    <Dialog
      open={user !== null}
      onOpenChange={close}
      title={user ? `${action} a ${user.username}` : 'Estado'}
      description={
        enable
          ? 'Podrá volver a ingresar a ColdGuard.'
          : 'No podrá ingresar mientras esté deshabilitado. El motivo queda en el historial.'
      }
    >
      {user && (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
          <TextareaField
            label="Motivo"
            name="reason"
            error={reasonError ?? fieldError(setEnabled.error, 'reason')}
          />
          {setEnabled.isError && <ErrorState error={setEnabled.error} />}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => close(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={enable ? 'primary' : 'danger'}
              loading={setEnabled.isPending}
            >
              {enable ? 'Habilitar usuario' : 'Deshabilitar usuario'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
