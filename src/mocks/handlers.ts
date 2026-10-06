// Mocks only for operations marked x-status: planned in the contract; delete a handler once
// its operation is implemented.
import { http, HttpResponse } from 'msw'
import type { components } from '@/shared/api/schema'
import { env } from '@/shared/config/env'

type Incident = components['schemas']['Incident']
type Metrics = components['schemas']['IncidentMetrics']

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const minutesAhead = (m: number) => new Date(Date.now() + m * 60_000).toISOString()

const incidents: Incident[] = [
  {
    id: 'inc-1',
    status: 'CREATED',
    assetId: 'asset-1',
    sensorId: 'sensor-1',
    anomalyType: 'HIGH_TEMPERATURE',
    impact: 'CRITICAL',
    urgency: 'IMMEDIATE',
    priority: 'P1',
    createdAt: minutesAgo(4),
    ackDueAt: minutesAhead(1),
    escalationCount: 0,
    occurrenceCount: 3,
  },
  {
    id: 'inc-2',
    status: 'ACKNOWLEDGED',
    assetId: 'asset-2',
    sensorId: 'sensor-3',
    anomalyType: 'HIGH_TEMPERATURE',
    impact: 'HIGH',
    urgency: 'HIGH',
    priority: 'P2',
    createdAt: minutesAgo(35),
    ackDueAt: minutesAgo(20),
    acknowledgedAt: minutesAgo(30),
    acknowledgedBy: 'supervisor',
    escalationCount: 0,
    occurrenceCount: 1,
  },
  {
    id: 'inc-3',
    status: 'ESCALATED',
    assetId: 'asset-1',
    sensorId: 'sensor-2',
    anomalyType: 'LOW_TEMPERATURE',
    impact: 'MEDIUM',
    urgency: 'MEDIUM',
    priority: 'P3',
    createdAt: minutesAgo(180),
    ackDueAt: minutesAgo(120),
    lastEscalatedAt: minutesAgo(60),
    escalationCount: 1,
    occurrenceCount: 2,
  },
  {
    id: 'inc-4',
    status: 'CLOSED',
    assetId: 'asset-3',
    sensorId: 'sensor-5',
    anomalyType: 'HIGH_TEMPERATURE',
    impact: 'LOW',
    urgency: 'LOW',
    priority: 'P4',
    createdAt: minutesAgo(600),
    closedAt: minutesAgo(500),
    closedBy: 'technician',
    cause: 'Puerta mal cerrada',
    resolutionComment: 'Se reemplazó el sello.',
    escalationCount: 0,
    occurrenceCount: 1,
  },
]

const metrics: Metrics = {
  countByStatus: { CREATED: 1, ACKNOWLEDGED: 1, ESCALATED: 1, CLOSED: 1 },
  countByPriority: { P1: 1, P2: 1, P3: 1, P4: 1 },
  mttaSeconds: 420,
  mttrSeconds: 6000,
  byPriority: [],
}

const url = (path: string) => `${env.apiBaseUrl}${path}`

export const handlers = [
  http.get(url('/incidents'), ({ request }) => {
    const params = new URL(request.url).searchParams
    const statuses = params.getAll('status')
    const priorities = params.getAll('priority')
    const items = incidents.filter(
      (i) =>
        (statuses.length === 0 || statuses.includes(i.status)) &&
        (priorities.length === 0 || priorities.includes(i.priority)),
    )
    return HttpResponse.json({
      items,
      page: { page: 0, size: 20, totalElements: items.length, totalPages: items.length ? 1 : 0 },
    })
  }),
  http.get(url('/metrics/incidents'), () => HttpResponse.json(metrics)),
]
