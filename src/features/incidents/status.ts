/**
 * El backend de incidentes (SPEC-007) aún es `planned` en openapi.yaml. Mientras sea false, la
 * pantalla se construye contra mocks de desarrollo (src/mocks) y avisa al usuario.
 * Cuando el contrato marque `implemented`: poner true y borrar los handlers de incidentes y métricas.
 */
export const INCIDENTS_BACKEND_READY = false
