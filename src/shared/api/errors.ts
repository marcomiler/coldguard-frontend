import type { components } from './schema'

type ProblemDetail = components['schemas']['ProblemDetail']

export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly detail?: string
  readonly correlationId?: string
  readonly fieldErrors: FieldError[]

  constructor(init: {
    status: number
    code: string
    detail?: string
    correlationId?: string
    fieldErrors?: FieldError[]
  }) {
    super(init.code)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.detail = init.detail
    this.correlationId = init.correlationId
    this.fieldErrors = init.fieldErrors ?? []
  }

  static fromProblem(response: Response, body: unknown): ApiError {
    const problem = (
      typeof body === 'object' && body !== null ? body : {}
    ) as Partial<ProblemDetail>
    return new ApiError({
      status: response.status,
      code: problem.code ?? `HTTP_${response.status}`,
      detail: problem.detail,
      correlationId: problem.correlationId ?? response.headers.get('X-Correlation-Id') ?? undefined,
      fieldErrors: problem.errors ?? [],
    })
  }

  static network(): ApiError {
    return new ApiError({ status: 0, code: 'NETWORK_ERROR' })
  }

  /** A timed-out write may still have been applied. */
  static timeout(write: boolean): ApiError {
    return new ApiError({ status: 0, code: write ? 'WRITE_TIMEOUT' : 'REQUEST_TIMEOUT' })
  }
}

export const fieldError = (error: unknown, field: string): string | undefined =>
  isApiError(error) ? error.fieldErrors.find((item) => item.field === field)?.message : undefined

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  REQUEST_TIMEOUT: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
  WRITE_TIMEOUT:
    'La operación tardó demasiado y no sabemos si se aplicó. Revisa el estado antes de repetirla.',
  INVALID_CREDENTIALS:
    'Usuario o contraseña incorrectos, o la cuenta está bloqueada o deshabilitada.',
  USER_ALREADY_EXISTS: 'Ya existe un usuario con ese nombre de usuario o correo.',
  USER_STATE_CONFLICT:
    'No se puede completar: debe quedar al menos un administrador habilitado con el rol de administrador.',
  USER_NOT_FOUND: 'El usuario ya no existe.',
  INVALID_REQUEST: 'Hay datos que no son válidos. Revisa los campos marcados.',
  CONCURRENT_MODIFICATION: 'Alguien más modificó este registro. Recarga y vuelve a intentarlo.',
  CALIBRATION_EVIDENCE_REQUIRED:
    'Antes de reactivar el sensor registra una calibración posterior al mantenimiento.',
  CALIBRATION_EXPIRED: 'La última calibración del sensor ya venció.',
  SENSOR_TRANSITION_NOT_ALLOWED: 'Ese cambio de estado no está permitido para el sensor.',
  INCIDENT_ALREADY_ACKNOWLEDGED: 'El incidente ya fue reconocido.',
  INCIDENT_ALREADY_CLOSED: 'El incidente ya está cerrado.',
  UPSTREAM_UNAVAILABLE: 'El servicio no está disponible por el momento. Inténtalo en unos minutos.',
  UPSTREAM_TIMEOUT: 'El servicio tardó demasiado en responder. Inténtalo de nuevo.',
  UPSTREAM_ERROR: 'El servicio falló al procesar la solicitud. Inténtalo de nuevo.',
}

export function errorMessage(error: unknown): string {
  if (!isApiError(error)) return 'Ocurrió un error inesperado.'
  if (MESSAGES[error.code]) return MESSAGES[error.code] as string
  if (error.status === 403) return 'Tu rol no tiene permiso para realizar esta acción.'
  if (error.status === 404) return 'No se encontró el recurso solicitado.'
  return error.detail ?? 'Ocurrió un error inesperado.'
}
