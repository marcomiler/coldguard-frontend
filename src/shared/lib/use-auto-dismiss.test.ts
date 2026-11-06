import { act, renderHook } from '@testing-library/react'
import { useAutoDismiss } from './use-auto-dismiss'

describe('useAutoDismiss', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('clears the message after the delay', () => {
    const { result } = renderHook(() => useAutoDismiss(1000))
    act(() => result.current.show('Hecho'))
    expect(result.current.message).toBe('Hecho')
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.message).toBeNull()
  })

  it('restarts the timer when the same text is shown again', () => {
    const { result } = renderHook(() => useAutoDismiss(1000))
    act(() => result.current.show('Hecho'))
    act(() => vi.advanceTimersByTime(800))
    act(() => result.current.show('Hecho'))
    act(() => vi.advanceTimersByTime(800))
    expect(result.current.message).toBe('Hecho')
    act(() => vi.advanceTimersByTime(200))
    expect(result.current.message).toBeNull()
  })

  it('can be dismissed by hand', () => {
    const { result } = renderHook(() => useAutoDismiss())
    act(() => result.current.show('Hecho'))
    act(() => result.current.dismiss())
    expect(result.current.message).toBeNull()
  })
})
