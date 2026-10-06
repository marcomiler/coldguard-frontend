# Documentación — ColdGuard Frontend

Índice maestro de la carpeta `/docs`. ColdGuard es una plataforma de monitoreo y gestión de incidentes de temperatura; este repositorio contiene únicamente su capa de presentación (ver `CLAUDE.md`).

Ver el detalle de la reorganización y limpieza en [migration-report.md](migration-report.md) (incluye auditoría inicial, migración y estado final de la limpieza).

**Leyenda de estado:** ✅ contenido real (migrado u organizado a partir de contenido existente) · 🚧 stub pendiente (solo estructura y TODO, sin contenido de negocio inventado).

## /product — Qué construimos y para quién
- ✅ [frontend-scope.md](product/frontend-scope.md) — alcance de módulos del frontend (migrado de `docs/frontend-scope.md`).
- 🚧 [personas.md](product/personas.md) — TODO.
- 🚧 [user-journeys.md](product/user-journeys.md) — TODO.
- ✅ [screen-inventory.md](product/screen-inventory.md) — inventario de pantallas y trazabilidad con historias de usuario (organizado a partir de `wireframes.md`).
- 🚧 [ui-copy-guidelines.md](product/ui-copy-guidelines.md) — TODO.

## /ux — Diseño, navegación y decisiones visuales
- 🚧 [information-architecture.md](ux/information-architecture.md) — TODO.
- 🚧 [sitemap.md](ux/sitemap.md) — TODO.
- 🚧 [user-flows.md](ux/user-flows.md) — TODO.
- ✅ [wireframes.md](ux/wireframes.md) — pantallas iniciales identificadas (migrado de `docs/wireframes.md`).
- 🚧 [mockups.md](ux/mockups.md) — TODO.
- ✅ [design-decisions.md](ux/design-decisions.md) — decisiones vigentes (destino de `docs/ux-decisions.md`).
- 🚧 [accessibility-notes.md](ux/accessibility-notes.md) — TODO.
- 🚧 [wpo-strategy.md](ux/wpo-strategy.md) — TODO (destino de `docs/wpo.md`, que estaba vacío).
- 🚧 [figma-links.md](ux/figma-links.md) — TODO (sin enlaces reales aún, no inventar).

## /architecture — Cómo está construido el frontend
- ✅ [frontend-architecture.md](architecture/frontend-architecture.md) — definido (v0.1).
- ✅ [routing.md](architecture/routing.md) — definido (v0.1).
- ✅ [state-management.md](architecture/state-management.md) — definido (v0.1).
- ✅ [api-contract-consumption.md](architecture/api-contract-consumption.md) — definido (v0.1).
- 🚧 [component-structure.md](architecture/component-structure.md) — TODO.

## /quality — Cómo verificamos que funciona
- 🚧 [acceptance-criteria.md](quality/acceptance-criteria.md) — TODO.
- 🚧 [ui-test-strategy.md](quality/ui-test-strategy.md) — TODO.
- 🚧 [usability-checklist.md](quality/usability-checklist.md) — TODO.
- ✅ [performance-budget.md](quality/performance-budget.md) — presupuesto y control en el build.

## /research — Fuentes y referencias
- 🚧 [references.md](research/references.md) — TODO.
- 🚧 [apa-sources.md](research/apa-sources.md) — TODO.

## /academic — Solo para el informe, no para implementación
- ✅ [apf1-mapping.md](academic/apf1-mapping.md) — mapeo con criterios APF1 (cita `frontend-scope.md`).
- ✅ [prototype-artifacts-index.md](academic/prototype-artifacts-index.md) — índice de artefactos de prototipo (enlaza contenido existente en `/ux`).
- `_legacy/` — archivo de versiones obsoletas por duplicación. Actualmente vacío: la auditoría no encontró contenido duplicado que archivar (ver [_legacy/README.md](academic/_legacy/README.md) y [migration-report.md](migration-report.md)). No se modifica salvo para referenciarlo.

## Estado de la limpieza (última pasada: 2026-08-28)
- Enlaces internos: 29 archivos auditados, 0 enlaces rotos.
- Encabezados: homogeneizados a un único `#` por archivo + secciones `##`; se corrigió un título en inglés y una tabla sin encabezado propio.
- Archivos vacíos: no quedan archivos con 0 bytes; 21 archivos permanecen como stubs 🚧 intencionales (sin contenido previo que migrar, sin contenido inventado).
- Duplicados: no se encontraron duplicados de contenido de negocio dentro de `/docs` que requirieran consolidación o archivado.
- Detalle completo en [migration-report.md](migration-report.md).

## Reglas de esta documentación
- No se inventan resultados de pruebas, decisiones visuales ni enlaces de Figma/Stitch.
- La lógica de dominio del backend se documenta en `coldguard-platform`, no aquí.
- Cada carpeta mantiene consistencia con las reglas del proyecto en `CLAUDE.md` (accesibilidad, estados de UI, servicios de API tipados, rendimiento).
- Todo archivo tiene trazabilidad a su origen (si existía) documentada en [migration-report.md](migration-report.md).
