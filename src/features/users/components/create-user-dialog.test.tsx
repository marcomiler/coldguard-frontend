import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateUserDialog } from './create-user-dialog'

function renderDialog() {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CreateUserDialog open onOpenChange={() => {}} onCreated={() => {}} />
    </QueryClientProvider>,
  )
  return fetchSpy
}

describe('CreateUserDialog', () => {
  afterEach(() => vi.restoreAllMocks())

  it('asks for the required fields without calling the API', async () => {
    const fetchSpy = renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
    expect(screen.getByText('Ingresa el nombre de usuario')).toBeInTheDocument()
    expect(screen.getByText('Ingresa el correo')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('offers every role as a labelled checkbox', () => {
    renderDialog()
    expect(screen.getAllByRole('checkbox')).toHaveLength(5)
    expect(screen.getByRole('checkbox', { name: 'Auditor' })).toBeInTheDocument()
  })
})
