# Checklist de usabilidad y accesibilidad

Se aplica a **cada pantalla** antes de darla por terminada (también resume lo que antes sería `accessibility-notes.md`). Reglas completas en [design-system.md](../ux/design-system.md) §7–§8. Registrar solo pruebas realmente ejecutadas; no se inventan resultados.

## Usabilidad (heurísticas de Nielsen aplicadas)

- [ ] **Estado del sistema visible:** loading, empty, error y success resueltos; datos que se actualizan indican «actualizado hace…».
- [ ] **Lenguaje del dominio:** términos del usuario («incidente», «activo», «sensor»), sin códigos crudos (el `code` se mapea a un mensaje).
- [ ] **Control y salida:** se puede cancelar y volver; acciones críticas piden confirmación (con motivo si el backend lo exige).
- [ ] **Consistencia:** mismos componentes y verbos para la misma acción; una acción primaria por vista.
- [ ] **Prevención y recuperación de errores:** el error dice qué pasó y qué hacer; **Reintentar** donde aplica; no se pierde lo escrito (p. ej. ante `409`).
- [ ] **Reconocer antes que recordar:** filtros activos visibles; contexto (qué activo, qué sensor) siempre a la vista.
- [ ] **Jerarquía:** lo urgente primero; severidad con texto o ícono además de color.

## Accesibilidad (WCAG 2.2 AA)

- [ ] Operable solo con teclado; orden de tabulación = orden visual; foco siempre visible.
- [ ] Un `h1` por vista, niveles sin saltos; landmarks y «Saltar al contenido»; `document.title` por ruta.
- [ ] Todo control con nombre accesible; formularios con label visible y errores asociados (`aria-describedby`).
- [ ] Contraste ≥ 4.5:1 (texto) y ≥ 3:1 (UI) en tema claro **y** oscuro.
- [ ] Objetivos ≥ 24 px (control estándar 32 px, formularios 40 px).
- [ ] Cambios dinámicos anunciados (`role="status"` / `alert`); sin información solo por color.
- [ ] Reflow a 320 px sin scroll horizontal de página; zoom 200 %.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Probado con lector de pantalla _(anotar herramienta y fecha cuando se haga)_.

## Rendimiento

- [ ] `pnpm build` dentro del presupuesto ([performance-budget.md](performance-budget.md)).
- [ ] La pantalla es un chunk lazy sin dependencias nuevas innecesarias.
