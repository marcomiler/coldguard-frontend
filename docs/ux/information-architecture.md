# Arquitectura de información y flujos

Reemplaza a `sitemap.md` y `user-flows.md` (fusionados aquí). La implementación de rutas está en [routing.md](../architecture/routing.md). Todo lo de esta página sale del contrato y de la guía de integración del backend (`coldguard-platform`); lo marcado *planificado* depende de SPEC-007 y puede cambiar.

## Quién ve qué

Roles del backend (`x-roles` del contrato). Cada rol define la **tarea principal** que la interfaz debe priorizar.

| Rol | Tarea principal | Áreas | Estado |
|---|---|---|---|
| `OPERATOR` | Vigilar incidentes | Incidentes (lectura) | Tablero con datos simulados |
| `MAINTENANCE_TECHNICIAN` | Atender y cerrar incidentes | Incidentes (lectura y cierre) | Cierre: forma legada, no integrar aún |
| `OPERATIONS_SUPERVISOR` | Supervisar y reconocer/escalar; ver métricas | Incidentes, métricas, activos y sensores (lectura) | Tablero y métricas simulados; activos real |
| `PLATFORM_ADMIN` | Configurar la plataforma | Usuarios, organizaciones y sedes, activos, sensores, historial | Backend real; solo lista de activos construida |
| `AUDITOR` | Revisar la bitácora | Bitácora de auditoría | *Planificado* (sin pantalla aún) |

## Mapa de navegación

```
/login
/ (redirige a la pantalla de inicio del rol)
├─ Incidentes ........ OPERATIONS_SUPERVISOR · OPERATOR · MAINTENANCE_TECHNICIAN
│    ├─ Tablero (por prioridad + listado)        [planificado]
│    └─ Detalle de incidente (+ reconocer/escalar/cerrar) [planificado]
├─ Activos ........... PLATFORM_ADMIN · OPERATIONS_SUPERVISOR
│    ├─ Lista                                     [real]
│    ├─ Registro / edición de unidad              [real]
│    └─ Sensores de la unidad
│         ├─ Detalle, perfil operativo, historial [real]
│         ├─ Estado, calibración, reasignación, retiro [real]
│         └─ Lecturas y conectividad              [real, SPEC-006]
├─ Métricas operativas ... OPERATIONS_SUPERVISOR  [planificado]
├─ Administración ........ PLATFORM_ADMIN
│    ├─ Usuarios y roles                          [real]
│    └─ Organizaciones y sedes                    [real]
└─ Bitácora de auditoría . AUDITOR                [planificado]
```

Principios de navegación:
- **Navegación principal por área**, filtrada por rol; máximo 5 ítems. La profundidad no pasa de 3 niveles (área → lista → detalle).
- **Cada rol aterriza en su tarea principal**, no en una portada genérica.
- El detalle de una entidad se alcanza desde su lista y desde cualquier referencia a ella (p. ej. el activo de un incidente).

## Flujos principales

1. **Ingreso.** Login → pantalla de inicio del rol. Token de 1 h sin refresh: al vencer o recibir `401`, vuelta al login con aviso «Tu sesión terminó», conservando la ruta de destino.
2. **Atención de un incidente** *(planificado)*. Tablero (por prioridad) → detalle → **reconocer** (supervisor) → **escalar** con motivo (supervisor) → **cerrar** con causa y comentario de resolución (técnico). Conflictos: `INCIDENT_ALREADY_ACKNOWLEDGED` / `INCIDENT_ALREADY_CLOSED` se explican, no se ocultan.
3. **Alta de unidad y sensor** *(real)*. Lista de activos → registrar unidad (sede, nombre, criticidad) → registrar sensor (opcionalmente calibración inicial y perfil operativo).
4. **Ciclo de vida del sensor** *(real)*. Cambiar a mantenimiento → registrar calibración (**no** cambia el estado) → reactivar; el backend rechaza reactivar sin calibración posterior (`CALIBRATION_EVIDENCE_REQUIRED`). Reasignar solo en mantenimiento. Todo con motivo; la UI muestra el `code` explicado, no replica la regla.
5. **Administración de usuarios** *(real)*. Asignar/revocar rol y habilitar/deshabilitar exigen motivo; el último administrador no puede degradarse (`USER_STATE_CONFLICT`).
6. **Conflicto de versión.** Editar activo/sensor/perfil envía `expectedVersion`; ante `CONCURRENT_MODIFICATION`, aviso con «Recargar» sin perder lo escrito.

Los recorridos por persona se detallan en [user-journeys.md](../product/user-journeys.md); las pantallas, en [screen-inventory.md](../product/screen-inventory.md).
