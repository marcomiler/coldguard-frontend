# Estructura de componentes

Complementa [design-system.md](../ux/design-system.md) (tokens, CSS, UX) y [frontend-architecture.md](frontend-architecture.md) (capas de la app).

## Niveles

Cada nivel solo importa de los de abajo. Nunca hacia arriba ni lateralmente entre features.

| Nivel | Ubicación | Qué es | Conoce el dominio | Ejemplos |
|---|---|---|---|---|
| 1. Primitivos | `src/shared/ui/` | Piezas mínimas con una responsabilidad; estilos solo con tokens | **No** | `Button`, `Field`, `Badge`, `Notice`, `LoadingState`, `EmptyState`, `ErrorState` |
| 2. Patrones | `src/shared/patterns/` | Composición de primitivos para un problema recurrente | **No** | `PageHeader`, `DataTable`, `Pagination`, `ConfirmDialog`, `FormSection` |
| 3. Componentes de feature | `src/features/<área>/components/` | Piezas con vocabulario del dominio | Sí | `IncidentStatusBadge`, `PriorityCard`, `AssetCriticalityBadge` |
| 4. Páginas | `src/features/<área>/pages/` | Una ruta: orquesta datos (hooks) y compone | Sí | `IncidentsPage`, `AssetsPage` |
| 5. Layout/app | `src/app/` | Shell, router, guards | — | `AppShell` |

Reglas:

- **Se sube de nivel por repetición, no por anticipación.** Un patrón nace cuando ≥ 2 pantallas lo necesitan; `shared/patterns` no existe hasta entonces.
- **Los primitivos no saben de incidentes, activos ni roles.** El mapeo dominio → tono (`P1 → danger`, ver [design-system.md](../ux/design-system.md) §5) vive en la feature y se pasa como `tone`.
- **Las páginas no llevan estilo propio** más allá de layout (`flex`, `grid`, `gap`); los colores, tipografía y formas vienen de los componentes.
- **Datos y presentación separados:** la página obtiene datos con hooks de `features/*/api` y pasa props simples a componentes presentacionales. Los componentes no llaman a la API.

## Contrato de un componente

1. **Props mínimas y tipadas.** Variantes con `cva` y un vocabulario cerrado: `variant` (jerarquía: `primary | secondary | ghost`), `size` (`sm | md`), `tone` (`neutral | info | success | warning | danger`). No se inventa vocabulario por componente.
2. **Extiende los atributos nativos** del elemento (`ButtonHTMLAttributes`, etc.) y reenvía `ref` y `className` (React 19: `ref` es una prop).
3. **Todos los estados**: default, hover, `focus-visible` (global), active, disabled, loading e invalid, cuando apliquen. Estados con variantes de Tailwind y atributos `aria-*`/`data-*`.
4. **Accesible por construcción:** elemento semántico correcto (`button`, no `div`), nombre accesible obligatorio (por prop o contenido), `aria-*` coherentes. Comportamiento complejo (menús, diálogos, selects, tooltips) con **Radix primitives**; no se reimplementa.
5. **Solo tokens** (ver reglas de Tailwind). Sin `dark:`, sin valores arbitrarios, sin CSS propio.
6. **Sin efectos secundarios ni acceso a red.** Sin estado global; estado local solo de UI (abierto/cerrado).
7. **Un archivo por componente principal**, en kebab-case (`button.tsx`), export con nombre. Componentes hermanos mínimos (p. ej. los cuatro estados de datos) pueden compartir archivo mientras sean pequeños.
8. **Prueba mínima** cuando tiene lógica (variantes que cambian semántica, estados, teclado). No se prueba el estilo.

## Composición

- Preferir **composición** (`children`, slots) a props de configuración. Un `Button` recibe `children`; no `iconLeft`, `iconRight`, `label`…
- `asChild` (Radix `Slot`) para renderizar un enlace con apariencia de botón sin duplicar estilos.
- Un patrón nunca expone más de un nivel de render-props. Si lo necesita, está haciendo demasiado.

## Inventario

| Componente | Nivel | Estado | Radix |
|---|---|---|---|
| `Button`, `Field`, `Badge` | 1 | Hecho | `Slot`, `Label` |
| `Notice`, `LoadingState`, `EmptyState`, `ErrorState` | 1 | Hecho | — |
| `AppShell` (incluye menú de usuario) | 5 | Hecho | `DropdownMenu` |
| `Select`, `Checkbox`, `Textarea` | 1 | Cuando un formulario lo requiera | `Select`, `Checkbox` |
| `Dialog` / `ConfirmDialog` | 1 / 2 | Con la primera acción crítica (reconocer, cerrar) | `Dialog`/`AlertDialog` |
| `Table` + `Pagination` | 2 | Hoy las dos páginas repiten la tabla y la paginación → extraer al diseñar | — |
| `PageHeader` | 2 | Hoy repetido en cada página | — |
| `Toast` | 1 | Con la primera escritura exitosa | `Toast` |
| `Skeleton` | 1 | Con listas largas | — |
| `Icon` (SVG inline propios) | 1 | Cuando el diseño los defina, solo los usados | — |
| `StatusBadge` por dominio (severidad, sensor, conectividad) | 3 | Con el diseño de cada pantalla | — |

Antes de añadir un componente se verifica que no exista ya uno equivalente en el inventario.
