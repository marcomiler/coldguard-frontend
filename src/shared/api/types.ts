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
export type CreateUserRequest = Schemas['CreateUserRequest']
