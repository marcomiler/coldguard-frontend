import { actionLabel, actorLabel, describeChange } from './format'

describe('actionLabel', () => {
  it('names generic actions after their entity', () => {
    expect(actionLabel('CREATED', 'Incident')).toBe('Incidente creado')
    expect(actionLabel('ACKNOWLEDGED', 'Incident')).toBe('Incidente reconocido')
    expect(actionLabel('CREATED', 'Site')).toBe('Alta de sede')
  })

  it('translates known actions and humanizes unknown ones', () => {
    expect(actionLabel('SENSOR_CALIBRATION_EXPIRED', 'Sensor')).toBe('Calibración vencida')
    expect(actionLabel('SOMETHING_NEW_HAPPENED', 'Sensor')).toBe('Something new happened')
  })
})

describe('actorLabel', () => {
  it('names the system actors and leaves unknown ids as they are', () => {
    expect(actorLabel('connectivity-monitor')).toBe('Monitor de conectividad')
    expect(actorLabel('some-new-job')).toBe('some-new-job')
  })
})

describe('describeChange', () => {
  it('shows before and after only for what changed, with readable labels and values', () => {
    const lines = describeChange(
      { priority: 'P2', urgency: 'LOW' },
      { priority: 'P1', urgency: 'LOW', ackDueAt: '2026-10-07T01:56:43Z' },
    )
    expect(lines.map((line) => line.label)).toEqual(['Prioridad', 'Plazo para reconocer'])
    expect(lines[0]).toMatchObject({ before: 'P2', after: 'P1' })
    expect(lines[1]?.before).toBeUndefined()
    expect(lines[1]?.after).not.toMatch(/T01:56/)
  })

  it('formats temperatures, durations, enums and ids', () => {
    const lines = describeChange(null, {
      maxTemperature: 8,
      expectedIntervalSeconds: '5',
      status: 'IN_MAINTENANCE',
      siteId: 'aca9acfd-e187-4d35-bb22-14ceb3dad183',
    })
    expect(lines.map((line) => line.after)).toEqual(['8 °C', '5 s', 'En mantenimiento', 'aca9acfd'])
  })

  it('never produces JSON-looking text', () => {
    const lines = describeChange(null, { name: 'Almacén', criticality: 'LOW' })
    expect(JSON.stringify(lines.map((line) => line.after))).not.toMatch(/[{}]/)
  })
})
