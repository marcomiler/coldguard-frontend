import { render, screen } from '@testing-library/react'
import { LineChart } from './line-chart'

const points = [
  { time: 0, value: 4 },
  { time: 60_000, value: 9, flagged: true },
  { time: 120_000, value: 6 },
]

describe('LineChart', () => {
  it('exposes the series as an image with a description', () => {
    render(
      <LineChart
        points={points}
        band={{ min: 2, max: 8 }}
        unit="°C"
        ariaLabel="Temperatura: 3 lecturas"
        formatTime={(t) => String(t)}
      />,
    )
    expect(screen.getByRole('img', { name: 'Temperatura: 3 lecturas' })).toBeInTheDocument()
  })

  it('marks only the flagged readings', () => {
    const { container } = render(
      <LineChart points={points} unit="°C" ariaLabel="x" formatTime={(t) => String(t)} />,
    )
    expect(container.querySelectorAll('circle')).toHaveLength(1)
  })
})
