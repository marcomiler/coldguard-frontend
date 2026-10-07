# Consumo de contratos de API

Fuente de verdad: `../coldguard-platform/contracts/rest/openapi.yaml` y `../coldguard-platform/docs/frontend-integration.md`. Este repo no modifica el backend.

## Flujo

1. `pnpm api:types` genera `src/shared/api/schema.d.ts` desde el contrato (`OPENAPI_PATH` permite otra ruta). El archivo generado se versiona; se regenera cuando el backend anuncia cambios.
2. `src/shared/api/client.ts` expone el cliente `api` (openapi-fetch) y `unwrap()`, que devuelve los datos o lanza `ApiError`.
3. Cada feature tiene hooks en `features/<área>/api/` (TanStack Query). Las páginas solo usan esos hooks.

## Convenciones del contrato que el cliente respeta

- Base URL: `VITE_API_BASE_URL` (Gateway, `http://localhost:8080/api/v1`). El Gateway es el único punto de entrada.
- Auth: `Authorization: Bearer`, token de 1 h en memoria, sin refresh. Un `401` fuera del login termina la sesión y vuelve al login.
- Errores: Problem Details. Se decide por `code` (`ApiError.code`), nunca por `detail`; `correlationId` se muestra para soporte. Mensajes propios en `shared/api/errors.ts`.
- Cada petición envía `X-Correlation-Id`.
- Timeouts: ver la sección siguiente.
- Roles: `x-roles` del contrato vive reflejado en `shared/lib/roles.ts` (`AREA_ROLES`). La UI solo oculta; la autoridad es el backend.

## Timeouts y reintentos

Cada petición tiene un plazo propio (`TIMEOUTS_MS` en `shared/api/client.ts`), aplicado por un middleware con `AbortSignal.timeout` y combinado con la señal del llamador (TanStack Query sigue pudiendo cancelar).

| Tipo                                | Plazo | Por qué                                                                                                                                                                                           |
| ----------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lectura (`GET`)                     | 10 s  | Mayor que el deadline del Gateway a cada servicio (5 s, `*_SERVICE_DEADLINE`): normalmente llega antes su `504 UPSTREAM_TIMEOUT` con `correlationId`; el plazo del cliente es la red de seguridad |
| Escritura (`POST/PUT/PATCH/DELETE`) | 20 s  | Una escritura puede encadenar varias llamadas internas (p. ej. alta de sensor con calibración y perfil)                                                                                           |

- Si vence: `REQUEST_TIMEOUT` (lectura) o `WRITE_TIMEOUT` (escritura). Son distintos a propósito: tras un timeout de escritura **no se sabe si se aplicó**, y el mensaje pide revisar el estado antes de repetir. Distintos también de `NETWORK_ERROR` y de la cancelación (`AbortError`, que se propaga sin mostrar error).
- Reintentos (`shared/api/retry.ts`): las lecturas se reintentan **una vez** y solo ante `NETWORK_ERROR`, `UPSTREAM_UNAVAILABLE` o `UPSTREAM_ERROR`. Nunca ante timeouts (apilarían carga sobre un servicio lento y retrasarían el aviso), ni ante 4xx. Las escrituras **nunca** se reintentan solas.
- Los plazos deben revisarse si el backend cambia sus deadlines.
- Si una operación concreta necesita otro plazo, se pasa una `signal` propia en la llamada (p. ej. `AbortSignal.timeout(n)`); el plazo por defecto sigue aplicando como tope adicional.

## Operaciones `planned`: sin mocks

La web **no muestra datos simulados**: todo va al Gateway real. Una área cuyo backend sigue `x-status: planned` se oculta por completo (menú, aterrizaje y ruta) con `ready: false` en `AREAS` (`src/shared/lib/roles.ts`); quien llegue por URL ve «Esta sección aún no está disponible». Cuando el contrato la marque `implemented` y el Gateway la sirva, se pasa `ready` a `true` y se regeneran los tipos.

| Área                   | Operaciones                                                                       | Estado hoy                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Login                  | `POST /auth/login`                                                                | real                                                                                             |
| Activos (lista)        | `GET /assets`                                                                     | real                                                                                             |
| Usuarios (admin)       | `/users`, `/users/{id}/roles`, `/users/{id}/enabled`                              | real                                                                                             |
| Incidentes y métricas  | `GET /incidents`, `/incidents/{id}`, reconocer, escalar, `GET /metrics/incidents` | planned (SPEC-007): **ocultas**. Comprobado contra el Gateway en ejecución: no expone esas rutas |
| Lecturas, conectividad | `/sensors/{id}/readings`, `/sensors/connectivity`                                 | real desde SPEC-006 (sin pantalla aún)                                                           |

No integrar `POST /incidents` ni `POST /incidents/{id}/close`: su forma es legada y la reemplaza SPEC-007.

## Pendiente

- Paginación por cursor (historial del sensor, lecturas) cuando se construyan esas pantallas.
