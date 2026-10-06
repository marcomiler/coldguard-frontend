import { useState } from 'react'
import type { Criticality } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/format'
import { Badge, type Tone } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/states'
import { useAssets } from '../api/assets'

const CRITICALITY: Record<Criticality, { label: string; tone: Tone }> = {
  LOW: { label: 'Baja', tone: 'neutral' },
  MEDIUM: { label: 'Media', tone: 'info' },
  HIGH: { label: 'Alta', tone: 'warning' },
  CRITICAL: { label: 'Crítica', tone: 'danger' },
}

export function AssetsPage() {
  const [page, setPage] = useState(0)
  const { data, error, isPending, isError, isFetching, refetch } = useAssets(page)

  return (
    <section aria-labelledby="assets-title" className="flex flex-col gap-4">
      <h1 id="assets-title" className="text-heading-1 font-semibold">
        Activos
      </h1>

      {isPending && <LoadingState label="Cargando activos…" />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
      {data && data.items.length === 0 && (
        <EmptyState title="Aún no hay activos registrados">
          Cuando se registre una unidad de frío aparecerá aquí.
        </EmptyState>
      )}
      {data && data.items.length > 0 && (
        <>
          <div className="overflow-x-auto" aria-busy={isFetching}>
            <table className="w-full text-left text-small">
              <caption className="sr-only">Unidades de frío registradas</caption>
              <thead className="border-b border-border-strong">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Nombre
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Criticidad
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Descripción
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Actualizado
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((asset) => (
                  <tr key={asset.id} className="border-b border-border">
                    <th scope="row" className="py-2 pr-4 font-medium">
                      {asset.name}
                    </th>
                    <td className="py-2 pr-4">
                      <Badge tone={CRITICALITY[asset.criticality].tone}>
                        {CRITICALITY[asset.criticality].label}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">{asset.description ?? '—'}</td>
                    <td className="py-2">{formatDateTime(asset.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav aria-label="Paginación" className="flex items-center gap-3">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-small" aria-live="polite">
              Página {data.page.page + 1} de {Math.max(data.page.totalPages, 1)}
            </span>
            <Button
              variant="secondary"
              disabled={page + 1 >= data.page.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </nav>
        </>
      )}
    </section>
  )
}
