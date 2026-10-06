# Reglas del sistema de diseño (obligatorias para cualquier cambio de UI)

Lee primero `docs/ux/design-system.md` (reglas completas y justificación) y `docs/architecture/component-structure.md`. Este archivo es el resumen imperativo. `pnpm lint` hace cumplir lo marcado con ⚙.

## Dónde van las cosas
- Valores visuales (colores, fuentes, tamaños, radios, sombras): **solo** `src/styles/tokens.css`. Estilos globales: `src/styles/base.css`.
- ⚙ No crear más archivos CSS. Los componentes se estilizan **solo con utilidades de Tailwind** + `cva`.
- ⚙ `@apply` y `!important` solo en `base.css`.

## Cómo se estiliza
- ⚙ Solo tokens semánticos: `bg-surface`, `text-fg`, `text-fg-muted`, `border-border`, `bg-accent`, `bg-danger-subtle text-danger-fg`… Nunca colores de paleta (`bg-slate-500`, `text-white`) ni literales (`#fff`, `rgb()`).
- ⚙ Nada de `dark:`: el tema claro/oscuro lo resuelven los tokens (`light-dark()`).
- ⚙ Sin valores arbitrarios (`w-[13px]`); si falta un valor, se añade un token. Permitido solo en variantes `data-[…]`, `aria-[…]`, `group-[…]`, `has-[…]`.
- ⚙ Sin `style={}`. Roles de texto: `text-caption|small|body|heading-3|heading-2|heading-1|metric`. Radios `rounded-sm|md|lg|full`. Sombras `shadow-raised|overlay`.
- Mobile-first; solo `sm: md: lg:` por defecto; espaciado de la escala de 4 px; `gap` y `flex/grid` en vez de márgenes entre hermanos.
- El foco visible es global (`base.css`): no se redefine ni se quita. Un `className` externo solo **añade** clases.
- Si necesitas un token nuevo: añádelo **semántico** (por rol, no por componente) con valor para los dos temas en `tokens.css` y regístralo en `REQUIRED_TOKENS` de `scripts/check-design-rules.mjs`. Nunca renombres ni borres tokens existentes.

## Componentes
- Niveles: `shared/ui` (primitivos, sin dominio) → `shared/patterns` (composición, sin dominio) → `features/*/components` → páginas. Solo se importa hacia abajo.
- Un patrón nuevo nace al repetirse en ≥ 2 pantallas. El mapeo dominio → `tone` vive en la feature.
- Vocabulario de variantes cerrado: `variant` (primary|secondary|ghost), `size` (sm|md), `tone` (neutral|info|success|warning|danger).
- HTML semántico primero; comportamiento complejo con Radix primitives; nombre accesible siempre.

## UX / accesibilidad
- Un `h1` por vista y una acción primaria. Orden de página: encabezado → resumen → filtros → contenido → paginación.
- Toda vista con datos resuelve loading, empty, error y success. Severidad y estado nunca solo por color.
- Acciones críticas: confirmación con motivo si el backend lo exige; escrituras pesimistas. WCAG 2.2 AA; objetivos ≥ 24 px (recomendado 40 px); teclado completo.
- Copy en español, tuteo, sentence case; sin códigos crudos en pantalla.

## Peso
- Presupuesto en `docs/quality/performance-budget.md` (JS inicial ≤ 115 kB, CSS ≤ 8 kB gzip), verificado en `pnpm build`.
- Sin librerías de UI, íconos, animación ni CSS-in-JS. Íconos: SVG inline propios. Fuentes: pila del sistema; una webfont variable autoalojada solo si cabe en el presupuesto.

## Antes de terminar
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` en verde; probar con teclado, 320/768/1280 px, tema claro y oscuro; registrar decisiones no obvias en `docs/ux/design-decisions.md`.
