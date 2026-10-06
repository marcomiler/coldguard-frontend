import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const TONES = {
  neutral: 'bg-neutral-subtle text-neutral-fg',
  info: 'bg-accent-subtle text-accent-subtle-fg',
  warning: 'bg-warning-subtle text-warning-fg',
  danger: 'bg-danger-subtle text-danger-fg',
} as const

export type Tone = keyof typeof TONES

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn('inline-block rounded-sm px-2 py-0.5 text-caption font-medium', TONES[tone])}
    >
      {children}
    </span>
  )
}
