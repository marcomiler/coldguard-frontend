import { ApiError, errorMessage } from './errors'

describe('ApiError.fromProblem', () => {
  it('toma code, detail y correlationId del Problem Details', () => {
    const response = new Response(null, { status: 409 })
    const error = ApiError.fromProblem(response, {
      status: 409,
      code: 'CONCURRENT_MODIFICATION',
      correlationId: 'abc',
    })
    expect(error.code).toBe('CONCURRENT_MODIFICATION')
    expect(error.correlationId).toBe('abc')
  })

  it('cae al header X-Correlation-Id y a un code HTTP si el cuerpo no es Problem Details', () => {
    const response = new Response(null, { status: 502, headers: { 'X-Correlation-Id': 'hdr' } })
    const error = ApiError.fromProblem(response, 'Bad Gateway')
    expect(error.code).toBe('HTTP_502')
    expect(error.correlationId).toBe('hdr')
  })
})

describe('errorMessage', () => {
  it('decide por code, no por detail', () => {
    const error = new ApiError({ status: 409, code: 'CALIBRATION_EVIDENCE_REQUIRED', detail: 'x' })
    expect(errorMessage(error)).toMatch(/calibración/)
  })

  it('explica un 403 sin code conocido', () => {
    expect(errorMessage(new ApiError({ status: 403, code: 'FORBIDDEN' }))).toMatch(/rol/)
  })
})
