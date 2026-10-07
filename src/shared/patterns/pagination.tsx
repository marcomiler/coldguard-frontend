import { Button } from '@/shared/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

export function Pagination({ page, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <nav aria-label="Paginación" className="flex items-center gap-3">
      <Button variant="secondary" disabled={page === 0} onClick={onPrevious}>
        Anterior
      </Button>
      <span className="font-mono text-small" aria-live="polite">
        Página {page + 1} de {Math.max(totalPages, 1)}
      </span>
      <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={onNext}>
        Siguiente
      </Button>
    </nav>
  )
}
