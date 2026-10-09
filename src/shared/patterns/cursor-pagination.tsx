import { Button } from '@/shared/ui/button'

interface CursorPaginationProps {
  readonly page: number
  readonly hasMore: boolean
  readonly onPrevious: () => void
  readonly onNext: () => void
}

/** For lists paged by an opaque cursor: the total is unknown, so there is no "of N". */
export function CursorPagination({ page, hasMore, onPrevious, onNext }: CursorPaginationProps) {
  return (
    <nav aria-label="Paginación" className="flex items-center gap-3">
      <Button variant="secondary" disabled={page === 0} onClick={onPrevious}>
        Anterior
      </Button>
      <span className="font-mono text-small" aria-live="polite">
        Página {page + 1}
      </span>
      <Button variant="secondary" disabled={!hasMore} onClick={onNext}>
        Siguiente
      </Button>
    </nav>
  )
}
