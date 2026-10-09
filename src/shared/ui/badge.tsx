import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const TONES = {
  neutral: 'bg-neutral-subtle text-neutral-fg',
  accent: 'bg-accent-subtle text-accent-subtle-fg',
  info: 'bg-info-subtle text-info-fg',
  success: 'bg-success-subtle text-success-fg',
  warning: 'bg-warning-subtle text-warning-fg',
  danger: 'bg-danger-subtle text-danger-fg',
} as const

export type Tone = keyof typeof TONES

interface BadgeProps {
  readonly tone?: Tone
  readonly dot?: boolean
  readonly children: ReactNode
}

export function Badge({ tone = 'neutral', dot, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 rounded-sm px-1.5 text-caption font-semibold whitespace-nowrap',
        TONES[tone],
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
