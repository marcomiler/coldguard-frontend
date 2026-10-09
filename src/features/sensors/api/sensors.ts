import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '@/shared/api/client'
import { useNow } from '@/shared/lib/use-now'
import { isApiError } from '@/shared/api/errors'
import type { SensorStatus } from '@/shared/api/types'
import type { components } from '@/shared/api/schema'

const POLL_MS = 30_000
const ROUND_MS = 60_000

export function useSensors(status: SensorStatus | '', page: number, size = 20) {
  return useQuery({
    queryKey: ['sensors', 'list', status, page],
    queryFn: () =>
      unwrap(
        api.GET('/sensors', { params: { query: { status: status || undefined, page, size } } }),
      ),
    placeholderData: keepPreviousData,
    refetchInterval: POLL_MS,
  })
}

/** Only sensors that have reported at least once have an entry; the maximum page is 100. */
export function useConnectivity() {
  return useQuery({
    queryKey: ['sensors', 'connectivity'],
    queryFn: () => unwrap(api.GET('/sensors/connectivity', { params: { query: { size: 100 } } })),
    refetchInterval: POLL_MS,
  })
}

/** Newest readings of a sensor within the last `hours`, plus its safe range. */
export function useSensorReadings(sensorId: string, hours: number) {
  // Rounded so the query key stays stable between polls.
  const now = Math.ceil(useNow(ROUND_MS) / ROUND_MS) * ROUND_MS
  const from = new Date(now - hours * 3_600_000).toISOString()
  const to = new Date(now + ROUND_MS).toISOString()

  const readings = useQuery({
    queryKey: ['sensors', 'readings', sensorId, from, to],
    queryFn: () =>
      unwrap(
        api.GET('/sensors/{sensorId}/readings', {
          params: { path: { sensorId }, query: { from, to, size: 100 } },
        }),
      ),
    placeholderData: keepPreviousData,
    refetchInterval: POLL_MS,
  })
  const profile = useSensorProfile(sensorId)
  return { readings, profile }
}

type Schemas = components['schemas']

/** A sensor without a profile answers 404, which is a normal state, not an error. */
export function useSensorProfile(sensorId: string) {
  return useQuery({
    queryKey: ['sensors', 'profile', sensorId],
    queryFn: async () => {
      try {
        return await unwrap(
          api.GET('/sensors/{sensorId}/profile', { params: { path: { sensorId } } }),
        )
      } catch (error) {
        if (isApiError(error) && error.status === 404) return null
        throw error
      }
    },
    staleTime: 5 * 60_000,
  })
}

export function useSensorHistory(sensorId: string, cursor: string | undefined) {
  return useQuery({
    queryKey: ['sensors', 'history', sensorId, cursor],
    queryFn: () =>
      unwrap(
        api.GET('/sensors/{sensorId}/history', {
          params: { path: { sensorId }, query: { cursor, size: 10 } },
        }),
      ),
    placeholderData: keepPreviousData,
  })
}

/** Every write changes what the lists, the profile and the history show. */
function useSensorMutation<TVariables, TResult>(run: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sensors'] }),
  })
}

export const useRegisterSensor = () =>
  useSensorMutation((body: Schemas['RegisterSensorRequest']) =>
    unwrap(api.POST('/sensors', { body })),
  )

export const useUpdateSensor = () =>
  useSensorMutation(
    ({ sensorId, ...body }: Schemas['UpdateSensorRequest'] & { sensorId: string }) =>
      unwrap(api.PATCH('/sensors/{sensorId}', { params: { path: { sensorId } }, body })),
  )

export const useChangeSensorStatus = () =>
  useSensorMutation(
    ({ sensorId, ...body }: Schemas['StatusChangeRequest'] & { sensorId: string }) =>
      unwrap(api.POST('/sensors/{sensorId}/status', { params: { path: { sensorId } }, body })),
  )

export const useRecordCalibration = () =>
  useSensorMutation(({ sensorId, ...body }: Schemas['CalibrationRequest'] & { sensorId: string }) =>
    unwrap(api.POST('/sensors/{sensorId}/calibrations', { params: { path: { sensorId } }, body })),
  )

export const useReassignSensor = () =>
  useSensorMutation(
    ({ sensorId, ...body }: Schemas['ReassignmentRequest'] & { sensorId: string }) =>
      unwrap(
        api.POST('/sensors/{sensorId}/reassignment', { params: { path: { sensorId } }, body }),
      ),
  )

export const useRetireSensor = () =>
  useSensorMutation(({ sensorId, ...body }: Schemas['RetirementRequest'] & { sensorId: string }) =>
    unwrap(api.POST('/sensors/{sensorId}/retirement', { params: { path: { sensorId } }, body })),
  )

export const usePutProfile = () =>
  useSensorMutation(
    ({ sensorId, ...body }: Schemas['OperationalProfileRequest'] & { sensorId: string }) =>
      unwrap(api.PUT('/sensors/{sensorId}/profile', { params: { path: { sensorId } }, body })),
  )
