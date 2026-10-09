import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from './button'
import { CloseIcon } from './icons'

const TONES = {
  info: 'border-info bg-info-subtle text-info-fg',
  success: 'border-success bg-success-subtle text-success-fg',
  warning: 'border-warning bg-warning-subtle text-warning-fg',
  danger: 'border-danger bg-danger-subtle text-danger-fg',
} as const

interface AlertProps {
  tone: keyof typeof TONES
  children: ReactNode
  onDismiss?: () => void
}

/** Success and info messages are announced politely; warnings and errors immediately. */
export function Alert({ tone, children, onDismiss }: AlertProps) {
  const urgent = tone === 'warning' || tone === 'danger'
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cn('flex items-center gap-2 rounded-md border px-3 py-2 text-small', TONES[tone])}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Cerrar aviso">
          <CloseIcon />
        </Button>
      )}
    </div>
  )
}
