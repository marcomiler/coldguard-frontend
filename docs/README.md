# Documentación — ColdGuard Frontend

Índice de `/docs`. ColdGuard es una plataforma de monitoreo y gestión de incidentes de temperatura; este repositorio contiene únicamente su capa de presentación (ver `CLAUDE.md`).

**Leyenda:** ✅ contenido real · 🚧 stub pendiente (estructura y TODO, sin contenido inventado).

## /product — Qué construimos y para quién
- ✅ [frontend-scope.md](product/frontend-scope.md) — módulos del frontend.
- ✅ [screen-inventory.md](product/screen-inventory.md) — inventario de pantallas.
- 🚧 [personas.md](product/personas.md) — los roles y su tarea principal ya están en [information-architecture.md](ux/information-architecture.md).
- 🚧 [user-journeys.md](product/user-journeys.md)
- 🚧 [ui-copy-guidelines.md](product/ui-copy-guidelines.md) — las reglas base de voz están en [design-system.md](ux/design-system.md) §7.

## /ux — Diseño y experiencia
- ✅ **[design-system.md](ux/design-system.md) — arquitectura y reglas del sistema de diseño (fuente de verdad).**
- ✅ [design-decisions.md](ux/design-decisions.md) — registro de decisiones.
- ✅ [information-architecture.md](ux/information-architecture.md) — roles, mapa de navegación y flujos.
- ✅ [design-assets.md](ux/design-assets.md) — enlaces a wireframes, mockups y salidas de Claude Design.

## /architecture — Cómo está construido
- ✅ [frontend-architecture.md](architecture/frontend-architecture.md) — stack, capas y estructura.
- ✅ [component-structure.md](architecture/component-structure.md) — niveles y contrato de componentes.
- ✅ [routing.md](architecture/routing.md)
- ✅ [state-management.md](architecture/state-management.md)
- ✅ [api-contract-consumption.md](architecture/api-contract-consumption.md) — contrato, timeouts, reintentos y mocks.

## /quality — Cómo verificamos
- ✅ [performance-budget.md](quality/performance-budget.md) — presupuesto de peso verificado en cada build.
- ✅ [usability-checklist.md](quality/usability-checklist.md) — checklist por pantalla (usabilidad + accesibilidad).
- 🚧 [acceptance-criteria.md](quality/acceptance-criteria.md)
- 🚧 [ui-test-strategy.md](quality/ui-test-strategy.md)

## /research — Fuentes
- ✅ [references.md](research/references.md) — referencias en formato APA.

## /academic — Solo para el informe, no para implementación
- ✅ [apf1-mapping.md](academic/apf1-mapping.md)
- ✅ [prototype-artifacts-index.md](academic/prototype-artifacts-index.md)

## Reglas de esta documentación
- No se inventan resultados de pruebas, decisiones visuales ni enlaces de diseño.
- La lógica de dominio del backend se documenta en `coldguard-platform`, no aquí.
- Un tema, un documento: no se crean archivos que dupliquen a otro (la purga del 2026-10-06 fusionó `sitemap`/`user-flows` en la arquitectura de información, `wireframes`/`mockups`/`figma-links` en `design-assets`, `wpo-strategy` en `performance-budget`, `accessibility-notes` en `usability-checklist`/`design-system` y `apa-sources` en `references`; el historial queda en git).
