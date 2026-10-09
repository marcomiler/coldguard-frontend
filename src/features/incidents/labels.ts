import type { Impact, Urgency } from '@/shared/api/types'

const ANOMALIES: Record<string, string> = {
  'high temperature': 'Temperatura alta',
  'temperature above max': 'Temperatura sobre el máximo',
  'low temperature': 'Temperatura baja',
  'temperature below min': 'Temperatura bajo el mínimo',
}

/** Backend codes come in several spellings (`TEMPERATURE_ABOVE_MAX`, `High-temperature`). */
export function anomalyLabel(code: string): string {
  const words = code.toLowerCase().replaceAll(/[_-]/g, ' ')
  return ANOMALIES[words] ?? words.charAt(0).toUpperCase() + words.slice(1)
}

export const IMPACT_LABELS: Record<Impact, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico',
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  IMMEDIATE: 'Inmediata',
}
