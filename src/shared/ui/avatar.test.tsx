import { render, screen } from '@testing-library/react'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('shows the initial of the name and stays out of the accessibility tree', () => {
    render(<Avatar name="supervisor" />)
    const avatar = screen.getByText('s')
    expect(avatar).toHaveAttribute('aria-hidden', 'true')
  })

  it('falls back to a placeholder for an empty name', () => {
    render(<Avatar name="  " />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
