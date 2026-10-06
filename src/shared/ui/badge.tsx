import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const TONES = {
  neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  info: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
  danger: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
} as const

export type Tone = keyof typeof TONES

/** El significado nunca depende solo del color: siempre lleva texto. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn('inline-block rounded px-2 py-0.5 text-xs font-medium', TONES[tone])}>
      {children}
    </span>
  )
}
