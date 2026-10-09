import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('is a switch that starts on dark and flips the theme', async () => {
    render(<ThemeToggle />)
    const toggle = screen.getByRole('switch', { name: 'Tema oscuro' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
