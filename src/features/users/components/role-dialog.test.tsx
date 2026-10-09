import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@/shared/api/types'
import { RoleDialog } from './role-dialog'

const user: User = {
  userId: 'u1',
  username: 'ana',
  email: 'ana@example.com',
  displayName: 'Ana',
  roles: ['OPERATOR'],
  enabled: true,
  createdAt: '2026-10-06T00:00:00Z',
}

function renderDialog() {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RoleDialog user={user} onClose={() => {}} onDone={() => {}} />
    </QueryClientProvider>,
  )
  return fetchSpy
}

describe('RoleDialog', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the current roles checked and nothing to save yet', () => {
    renderDialog()
    expect(screen.getByRole('checkbox', { name: 'Operador' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Auditor' })).not.toBeChecked()
    expect(screen.getByText('Sin cambios por guardar.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
  })

  it('summarizes the diff and requires a reason before calling the API', async () => {
    const fetchSpy = renderDialog()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Auditor' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Operador' }))
    expect(screen.getByText('Se asignará: Auditor. Se revocará: Operador.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('Indica el motivo del cambio')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
