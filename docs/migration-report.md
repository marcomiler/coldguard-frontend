# Reporte de migración de /docs

Fecha de migración inicial: 2026-08-28.
Fecha de limpieza final: 2026-08-28.

## Estado previo (auditoría)

`/docs` contenía 4 archivos, sin subcarpetas:

| Archivo original | Contenido | Estado |
|---|---|---|
| `docs/frontend-scope.md` | Módulos iniciales del frontend y criterio de evidencia APF1 | Con contenido |
| `docs/wireframes.md` | Listado de 5 pantallas iniciales | Con contenido |
| `docs/ux-decisions.md` | — | Vacío |
| `docs/wpo.md` | — | Vacío |

No se encontró contenido duplicado entre archivos.

## Acciones realizadas

| Origen | Destino | Acción | Justificación |
|---|---|---|---|
| `docs/frontend-scope.md` | `docs/product/frontend-scope.md` | Migrado (contenido preservado, se agregó nota de origen y TODO de ampliación) | Define alcance de producto/negocio, corresponde a `/product` |
| `docs/wireframes.md` | `docs/ux/wireframes.md` | Migrado (contenido preservado, se agregó nota de origen y TODOs de enlace) | Contenido de pantallas/navegación, corresponde a `/ux` |
| `docs/ux-decisions.md` | `docs/ux/design-decisions.md` | Recreado como stub con TODO (archivo original estaba vacío) | Nombre y ubicación alineados a la estructura objetivo |
| `docs/wpo.md` | `docs/ux/wpo-strategy.md` | Recreado como stub con TODO (archivo original estaba vacío) | Nombre y ubicación alineados a la estructura objetivo |

Todos los demás archivos de la estructura objetivo (`/product`, `/ux`, `/architecture`, `/quality`, `/research`, `/academic`) no tenían contenido previo en el repositorio y fueron creados como stubs con encabezados y TODOs, sin contenido inventado.

`docs/academic/_legacy/` se creó vacía (solo con un README explicativo) porque no se encontró contenido duplicado que archivar en esta primera reorganización.

## Reglas seguidas
- No se eliminó contenido con información real; los dos archivos vacíos (`ux-decisions.md`, `wpo.md`) no tenían contenido que perder.
- No se inventaron resultados de pruebas, enlaces de Figma/Stitch, ni decisiones visuales no documentadas.
- Se preservó el texto original de `frontend-scope.md` y `wireframes.md` sin modificaciones.

## Limpieza final (segunda pasada)

Alcance: validación y homogeneización de toda la documentación migrada en `/docs`. `docs/academic/_legacy/` no fue modificada, solo referenciada desde aquí y desde `academic/_legacy/README.md` (ya existente).

### Enlaces internos
- Se extrajeron y validaron todos los enlaces Markdown internos (`[texto](ruta.md)`) de los 29 archivos de `/docs`.
- Resultado: **0 enlaces rotos**. Todas las rutas relativas resuelven correctamente tras la migración a subcarpetas.
- No se requirió corrección de rutas.

### Homogeneización de títulos y encabezados
Convención verificada: un único `#` (H1) como título por archivo, secciones con `##` (H2), sección final `## TODO` en los stubs pendientes de contenido. Se corrigieron dos desviaciones:
- `product/user-journeys.md`: título estaba en inglés (`# User Journeys`) mientras el resto de la documentación está en español → renombrado a `# Recorridos de usuario (User Journeys)`. No se encontraron otras referencias a ese título que actualizar.
- `product/screen-inventory.md`: la tabla de pantallas no tenía un encabezado `##` propio (inconsistente con `ux/wireframes.md`, que sí usa `## Pantallas`) → se agregó `## Pantallas` antes de la tabla.

### Archivos vacíos o casi vacíos
No quedan archivos con 0 bytes. Inventario de contenido real vs. stub:

| Categoría | Archivos | Detalle |
|---|---|---|
| Contenido original preservado | `product/frontend-scope.md`, `ux/wireframes.md` | Texto original migrado sin cambios |
| Contenido estructurado no inventado | `product/screen-inventory.md`, `academic/apf1-mapping.md`, `academic/prototype-artifacts-index.md` | Reorganizan/citan contenido ya existente en otros archivos, no agregan hechos nuevos |
| Stubs "casi vacíos" (solo estado + checklist TODO, sin contenido de negocio) | `product/personas.md`, `product/user-journeys.md`, `product/ui-copy-guidelines.md`, `ux/information-architecture.md`, `ux/sitemap.md`, `ux/user-flows.md`, `ux/mockups.md`, `ux/design-decisions.md`, `ux/accessibility-notes.md`, `ux/wpo-strategy.md`, `ux/figma-links.md`, `architecture/frontend-architecture.md`, `architecture/routing.md`, `architecture/state-management.md`, `architecture/api-contract-consumption.md`, `architecture/component-structure.md`, `quality/acceptance-criteria.md`, `quality/ui-test-strategy.md`, `quality/usability-checklist.md`, `quality/performance-budget.md`, `research/references.md`, `research/apa-sources.md` | 21 archivos. Es el estado esperado: no existía contenido previo del que migrar y no se inventa contenido de negocio para llenarlos |

Estos 21 stubs no se eliminan ni se rellenan con contenido inventado; quedan marcados con TODO explícito para que el equipo los complete con información real.

### Duplicados menores
- No se encontró contenido de negocio duplicado entre archivos de `/docs` que requiera consolidación o archivado en `_legacy/`.
- `product/screen-inventory.md` y `ux/wireframes.md` listan las mismas 5 pantallas, pero es una referencia cruzada intencional (una en formato narrativo, otra en tabla de trazabilidad), no una duplicación a resolver.
- El texto de estado boilerplate ("Estado: sin definir. No existía contenido previo...") se repite en los 21 stubs por diseño, para mantener consistencia de formato; no es contenido de negocio duplicado.
- Fuera del alcance de `/docs`: el `README.md` en la raíz del repositorio contiene una lista de alcance ("Alcance inicial") que se superpone parcialmente con `docs/product/frontend-scope.md`. No se modificó por no ser parte de `/docs`; queda anotado aquí para trazabilidad futura si se decide consolidar.

### Trazabilidad archivo original → destino (actualizada)

| Original en `/docs` (previo a la reorganización) | Destino final | Estado tras limpieza |
|---|---|---|
| `docs/frontend-scope.md` | `docs/product/frontend-scope.md` | Contenido original intacto |
| `docs/wireframes.md` | `docs/ux/wireframes.md` | Contenido original intacto |
| `docs/ux-decisions.md` (vacío) | `docs/ux/design-decisions.md` | Stub con TODO, sin contenido inventado |
| `docs/wpo.md` (vacío) | `docs/ux/wpo-strategy.md` | Stub con TODO, sin contenido inventado |

## Pendiente
Ver TODOs en cada archivo individual (21 stubs listados arriba). Los más relevantes para siguientes iteraciones:
- Completar `product/personas.md`, `product/user-journeys.md`.
- Definir `ux/design-decisions.md`, `ux/accessibility-notes.md`, `ux/wpo-strategy.md` con contenido real.
- Documentar `architecture/*` una vez existan decisiones técnicas concretas.
- Completar `ux/figma-links.md` cuando existan enlaces reales.
- Evaluar si conviene consolidar el "Alcance inicial" del `README.md` raíz con `docs/product/frontend-scope.md` (fuera del alcance de esta limpieza).
