import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const TONES = {
  info: 'border-info bg-info-subtle text-info-fg',
  success: 'border-success bg-success-subtle text-success-fg',
  warning: 'border-warning bg-warning-subtle text-warning-fg',
  danger: 'border-danger bg-danger-subtle text-danger-fg',
} as const

interface AlertProps {
  tone: keyof typeof TONES
  children: ReactNode
}

/** Success and info messages are announced politely; warnings and errors immediately. */
export function Alert({ tone, children }: AlertProps) {
  const urgent = tone === 'warning' || tone === 'danger'
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cn('rounded-md border px-3 py-2.5 text-small', TONES[tone])}
    >
      {children}
    </div>
  )
}
