import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { resolveLanding } from '@/shared/lib/roles'
import { BrandMark } from '@/shared/ui/brand-mark'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { ErrorState, Notice } from '@/shared/ui/states'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { useLogin } from '../api/login'
import { useSession } from '../session'

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
    return <Navigate to={resolveLanding(session.roles, from)} replace />
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <section className="flex flex-col gap-10 border-b border-border bg-surface px-6 py-8 md:flex-1 md:border-r md:border-b-0 md:px-14 md:py-12">
        <div className="flex items-center gap-2.5">
          <BrandMark size={26} />
          <span className="text-heading-2 font-semibold">ColdGuard</span>
          <span className="ml-auto">
            <ThemeToggle />
          </span>
        </div>
        <div className="flex max-w-xl flex-col gap-3 md:mt-auto md:mb-auto">
          <p className="text-heading-4 text-fg-muted uppercase">
            Monitoreo térmico · Cadena de frío
          </p>
          <p className="text-display font-semibold">Qué requiere tu atención, en segundos.</p>
          <p className="max-w-md text-body text-fg-muted">
            Supervisa unidades refrigeradas, sensores e incidentes de toda la operación desde un
            solo panel.
          </p>
        </div>
      </section>

      <main className="flex flex-1 items-center justify-center px-6 py-10 md:px-14">
        <div className="flex w-full max-w-sm flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-heading-1 font-semibold">Ingresar</h1>
            <p className="text-small text-fg-muted">Usa tu cuenta de ColdGuard.</p>
          </div>
          {ended && <Notice>Tu sesión terminó. Vuelve a ingresar para continuar.</Notice>}
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field
              label="Usuario"
              name="username"
              autoComplete="username"
              size="lg"
              error={errors.username}
            />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              size="lg"
              error={errors.password}
            />
            {login.isError && <ErrorState error={login.error} />}
            <Button type="submit" size="lg" loading={login.isPending}>
              {login.isPending ? 'Ingresando' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
