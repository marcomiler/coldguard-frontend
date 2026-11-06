import { formatRelative } from './format'

const now = Date.parse('2026-10-06T12:00:00Z')

describe('formatRelative', () => {
  it('describes a future deadline without marking it overdue', () => {
    const result = formatRelative('2026-10-06T12:04:00Z', now)
    expect(result.isPast).toBe(false)
    expect(result.text).toMatch(/4 minutos/)
  })

  it('marks a missed deadline as past and picks a readable unit', () => {
    const result = formatRelative('2026-10-06T09:00:00Z', now)
    expect(result.isPast).toBe(true)
    expect(result.text).toMatch(/3 horas/)
  })
})
