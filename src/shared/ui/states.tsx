import type { ReactNode } from 'react'
import { errorMessage, isApiError } from '@/shared/api/errors'
import { Button } from './button'

export function LoadingState({ label = 'Cargando…' }: { readonly label?: string }) {
  return (
    <output className="flex items-center gap-3 p-6 text-fg-muted">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-border-strong border-t-accent motion-reduce:animate-none"
      />
      {label}
    </output>
  )
}

export function EmptyState({
  title,
  children,
}: {
  readonly title: string
  readonly children?: ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-border-strong p-8 text-center">
      <p className="text-heading-3 font-semibold">{title}</p>
      {children && <p className="mt-1 text-small text-fg-muted">{children}</p>}
    </div>
  )
}

export function ErrorState({
  error,
  onRetry,
}: {
  readonly error: unknown
  readonly onRetry?: () => void
}) {
  const correlationId = isApiError(error) ? error.correlationId : undefined
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-md border border-danger bg-danger-subtle px-3 py-2.5 text-danger-fg"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{errorMessage(error)}</p>
        {correlationId && (
          <p className="mt-0.5 text-caption">
            Código de seguimiento: <code className="font-mono text-code">{correlationId}</code>
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function Notice({ children }: { readonly children: ReactNode }) {
  return (
    <p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-small text-warning-fg">
      {children}
    </p>
  )
}
