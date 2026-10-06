import type { ReactNode } from 'react'
import { errorMessage, isApiError } from '@/shared/api/errors'
import { Button } from './button'

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-slate-600 dark:text-slate-300">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-700 motion-reduce:animate-none"
      />
      {label}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
      <p className="font-medium">{title}</p>
      {children && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{children}</p>}
    </div>
  )
}

/** Error recuperable: mensaje por `code`, correlationId visible para soporte y reintento. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const correlationId = isApiError(error) ? error.correlationId : undefined
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
    >
      <p className="font-medium">{errorMessage(error)}</p>
      {correlationId && (
        <p className="mt-1 text-xs">
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
    <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
      {children}
    </p>
  )
}
