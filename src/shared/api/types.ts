// Alias de los esquemas del contrato (generados en schema.d.ts, no editar a mano).
import type { components } from './schema'

type Schemas = components['schemas']

export type Role = Schemas['Role']
export type PageInfo = Schemas['PageInfo']
export type User = Schemas['User']
export type Asset = Schemas['Asset']
export type Criticality = Schemas['Criticality']
export type Incident = Schemas['Incident']
export type IncidentStatus = Schemas['IncidentStatus']
export type IncidentMetrics = Schemas['IncidentMetrics']
export type Priority = Schemas['Priority']
export type Impact = Schemas['Impact']
export type Urgency = Schemas['Urgency']
export type AuditRecord = Schemas['AuditRecord']
export type CreateUserRequest = Schemas['CreateUserRequest']
export type Sensor = Schemas['Sensor']
export type SensorStatus = Schemas['SensorStatus']
export type Connectivity = Schemas['Connectivity']
