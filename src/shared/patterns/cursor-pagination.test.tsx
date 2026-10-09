import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CursorPagination } from './cursor-pagination'

describe('CursorPagination', () => {
  it('cannot go back from the first page, and cannot go on without more pages', () => {
    render(<CursorPagination page={0} hasMore={false} onPrevious={() => {}} onNext={() => {}} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    expect(screen.getByText('Página 1')).toBeInTheDocument()
  })

  it('moves in both directions when there is more', async () => {
    const onNext = vi.fn()
    const onPrevious = vi.fn()
    render(<CursorPagination page={1} hasMore onPrevious={onPrevious} onNext={onNext} />)
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(onNext).toHaveBeenCalledOnce()
    expect(onPrevious).toHaveBeenCalledOnce()
  })
})
