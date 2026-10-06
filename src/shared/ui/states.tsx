import type { ReactNode } from 'react'
import { errorMessage, isApiError } from '@/shared/api/errors'
import { Button } from './button'

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-fg-muted">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-border-strong border-t-accent motion-reduce:animate-none"
      />
      {label}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong p-8 text-center">
      <p className="font-medium">{title}</p>
      {children && <p className="mt-1 text-small text-fg-muted">{children}</p>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const correlationId = isApiError(error) ? error.correlationId : undefined
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger bg-danger-subtle p-4 text-danger-fg"
    >
      <p className="font-medium">{errorMessage(error)}</p>
      {correlationId && (
        <p className="mt-1 text-caption">
          Código de seguimiento: <code>{correlationId}</code>
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-small text-warning-fg">
      {children}
    </p>
  )
}
