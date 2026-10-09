import type { ReactNode, SubmitEvent } from 'react'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { ErrorState } from '@/shared/ui/states'

interface FormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description?: string
  readonly submitLabel: string
  readonly submitVariant?: 'primary' | 'danger'
  readonly pending: boolean
  readonly error?: unknown
  readonly onSubmit: (data: FormData) => void
  readonly children: ReactNode
}

/** Dialog around a form: fields as children, cancel and submit buttons, and the API error. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  submitVariant = 'primary',
  pending,
  error,
  onSubmit,
  children,
}: FormDialogProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        {children}
        {error != null && <ErrorState error={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant={submitVariant} loading={pending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
