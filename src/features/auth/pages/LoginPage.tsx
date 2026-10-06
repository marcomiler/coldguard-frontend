import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { homePathFor } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { ErrorState, Notice } from '@/shared/ui/states'
import { useLogin } from '../api/login'
import { useSession } from '../session'

// Formulario mínimo sin librerías: mantiene liviano el bundle inicial (ver performance-budget.md).
type Errors = { username?: string; password?: string }

export function LoginPage() {
  const session = useSession((state) => state.session)
  const ended = useSession((state) => state.ended)
  const location = useLocation()
  const login = useLogin()
  const [errors, setErrors] = useState<Errors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const username = String(data.get('username') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const next: Errors = {
      username: username ? undefined : 'Ingresa tu usuario',
      password: password ? undefined : 'Ingresa tu contraseña',
    }
    setErrors(next)
    if (!next.username && !next.password) login.mutate({ username, password })
  }

  if (session) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? homePathFor(session.roles) ?? '/'} replace />
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Ingresar a ColdGuard</h1>
      {ended && <Notice>Tu sesión terminó. Vuelve a ingresar para continuar.</Notice>}
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Usuario" name="username" autoComplete="username" error={errors.username} />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
        />
        {login.isError && <ErrorState error={login.error} />}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </main>
  )
}
