import { cn } from '@/shared/lib/cn'

/** Placeholder avatar: the first letter of the name until there are profile pictures. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-small font-semibold text-accent-subtle-fg uppercase',
        className,
      )}
    >
      {name.trim().charAt(0) || '?'}
    </span>
  )
}
