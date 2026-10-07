import { render, screen } from '@testing-library/react'
import { PriorityBadge } from './priority-badge'

describe('PriorityBadge', () => {
  it('shows the priority as text, never only as color', () => {
    render(<PriorityBadge priority="P2" />)
    expect(screen.getByText('P2')).toBeInTheDocument()
  })

  it('pulses only for an unacknowledged P1', () => {
    const { rerender } = render(<PriorityBadge priority="P1" pulse />)
    expect(screen.getByText('P1').className).toMatch(/animate-pulse-ring/)
    rerender(<PriorityBadge priority="P3" pulse />)
    expect(screen.getByText('P3').className).not.toMatch(/animate-pulse-ring/)
  })
})
