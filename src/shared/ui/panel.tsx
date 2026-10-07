import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn('flex min-w-0 flex-col rounded-lg border border-border bg-surface', className)}
      {...props}
    />
  )
}

export function PanelHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        'flex min-h-10 items-center gap-2 border-b border-border px-3.5 py-2.5',
        className,
      )}
      {...props}
    />
  )
}

export function PanelBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-3.5', className)} {...props} />
}
