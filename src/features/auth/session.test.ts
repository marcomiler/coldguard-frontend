import { parseSession, useSession } from './session'

const jwt = (claims: object) => `h.${btoa(JSON.stringify(claims))}.s`

describe('parseSession', () => {
  it('lee usuario y roles del token', () => {
    const session = parseSession(
      jwt({ sub: 'u1', preferred_username: 'admin', roles: ['PLATFORM_ADMIN'] }),
    )
    expect(session).toMatchObject({ userId: 'u1', username: 'admin', roles: ['PLATFORM_ADMIN'] })
  })

  it('rechaza tokens mal formados o con roles desconocidos', () => {
    expect(parseSession('basura')).toBeNull()
    expect(parseSession(jwt({ sub: 'u', preferred_username: 'x', roles: ['ROOT'] }))).toBeNull()
  })
})

describe('useSession', () => {
  afterEach(() => useSession.getState().signOut())

  it('marca la sesión como terminada solo cuando termina sola', () => {
    const token = jwt({ sub: 'u1', preferred_username: 'op', roles: ['OPERATOR'] })
    useSession.getState().signIn(token, 3600)
    useSession.getState().endSession()
    expect(useSession.getState()).toMatchObject({ session: null, ended: true })

    useSession.getState().signIn(token, 3600)
    useSession.getState().signOut()
    expect(useSession.getState()).toMatchObject({ session: null, ended: false })
  })
})
