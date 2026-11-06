import { act, renderHook } from '@testing-library/react'
import { setTheme, useTheme } from './theme'

describe('theme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('defaults to dark and toggles on the root element', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    act(() => result.current.toggle())
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(result.current.theme).toBe('light')
  })

  it('persists the choice', () => {
    setTheme('light')
    expect(localStorage.getItem('cg-theme')).toBe('light')
  })
})
