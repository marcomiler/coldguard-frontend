# Sistema de diseño — arquitectura y reglas

Fuente de verdad de **cómo** se construye la interfaz de ColdGuard. No fija la identidad visual (colores y fuentes concretos): fija la **estructura** que esa identidad debe respetar, para que cambiar el diseño sea editar valores y no reescribir componentes.

- Valores: `src/styles/tokens.css` (único lugar). Estilos globales: `src/styles/base.css`.
- Reglas para agentes (resumen imperativo): `.claude/rules/design-system.md`.
- Estructura de componentes: [component-structure.md](../architecture/component-structure.md).
- Se hace cumplir con `scripts/check-design-rules.mjs` (corre en `pnpm lint` y en el CI).

## 1. Qué puede y qué no puede cambiar quien diseña

| Puede (Claude Design o una persona) | No puede sin actualizar antes este documento y el chequeo |
|---|---|
| Cambiar **valores** de tokens (colores, escala tipográfica, radios, sombras, familias) | Renombrar o borrar tokens, o saltarse las capas |
| Añadir tokens nuevos **semánticos** en `tokens.css` y registrarlos en el chequeo | Poner colores, tamaños o sombras fuera de `tokens.css` |
| Rediseñar la composición de una página respetando §6 y §7 | Bajar los umbrales de accesibilidad (§8) |
| Proponer una webfont **si cabe** en el presupuesto (§9) | Añadir librerías de UI, de íconos, de animación o CSS-in-JS |

## 2. Principios de producto

ColdGuard monitorea cadena de frío: la mayoría del tiempo todo está bien y, de pronto, algo requiere acción inmediata.

1. **Calma por defecto, estridencia solo para lo que importa.** Rojo y ámbar se reservan para estado de incidente; nunca decoran. Si todo grita, nada se atiende.
2. **Lo urgente primero.** El orden de la información es el orden de prioridad (severidad, luego vencimiento, luego antigüedad).
3. **Escaneable antes que bonito.** Usuarios operativos leen mucho y rápido: densidad media, alineación estricta, números tabulares.
4. **El backend manda.** La UI explica, no decide: nunca replica reglas de dominio ni oculta un error del servidor.
5. **Ligera.** El peso es un requisito de diseño (§9).

## 3. Arquitectura de CSS

Tailwind v4 en modo CSS-first. Cuatro capas, de abajo hacia arriba; cada una solo depende de las anteriores:

| Capa | Dónde | Contenido | Quién la toca |
|---|---|---|---|
| 1. Primitivos | `tokens.css` → `:root { --palette-* }` | Escalas crudas de color. **No generan utilidades**: ningún componente puede usarlas | Diseño |
| 2. Semánticos | `tokens.css` → `@theme { --color-*, --text-*, --radius-*, --shadow-*, --font-* }` | Roles con significado. **Son la API de estilos** (`bg-surface`, `text-fg`, `text-heading-2`) | Diseño |
| 3. Base | `base.css` (`@layer base`) | Estilos de elementos HTML, foco visible global, `prefers-reduced-motion` | Arquitectura |
| 4. Componentes | `shared/ui` y `features/*` (TSX) | Utilidades de Tailwind compuestas con `cva`. Sin CSS propio | Desarrollo |

Decisiones estructurales:

- **No hay archivos CSS de componentes.** Solo `tokens.css`, `base.css` e `index.css` (que los importa). Un componente se estiliza únicamente con utilidades.
- **Las escalas por defecto de Tailwind están eliminadas** (`--color-*: initial`, etc.). `bg-slate-500`, `rounded`, `text-xl` o `shadow-lg` no existen: el sistema solo ofrece lo definido en `tokens.css`.
- **El tema claro/oscuro vive en los tokens**, con `light-dark()` y `color-scheme: light dark` (sigue al sistema). Los componentes **nunca** usan `dark:`. Cambiar o añadir un tema es tocar `tokens.css`.
- **Sin componentes de tokens** (p. ej. `--button-bg`): los componentes consumen los semánticos. Si un caso no encaja, se añade un semántico nuevo, no uno por componente.
- **Un solo nivel de abstracción para variantes:** `cva` en el componente (`variant`, `size`, `tone`), nunca clases condicionales dispersas por las páginas.

## 4. Reglas de Tailwind

Obligatorias (las marcadas ⚙ las verifica el chequeo automático):

1. ⚙ Solo clases basadas en tokens: `bg-surface`, `text-fg-muted`, `border-border`. Sin colores de paleta ni literales (`#fff`, `rgb()`, `oklch()`).
2. ⚙ Sin valores arbitrarios (`w-[13px]`, `text-[#333]`). Excepciones: variantes de estado (`data-[…]`, `aria-[…]`, `group-[…]`, `has-[…]`). Si falta un valor, se agrega un token.
3. ⚙ Sin `dark:` en componentes (§3).
4. ⚙ Sin `style={}` en JSX. Para un valor dinámico, una variable CSS (`style` solo con `--var`) justificada con `design-allow: <motivo>`.
5. ⚙ Tipografía solo con roles: `text-caption | small | body | heading-3 | heading-2 | heading-1 | metric`. Pesos: `font-medium` y `font-semibold`.
6. ⚙ Radios `rounded-sm|md|lg|full`; sombras `shadow-raised|overlay`.
7. ⚙ `@apply` y `!important` solo en `base.css`.
8. **Mobile-first**: la clase base es el móvil; `sm: md: lg:` solo agregan. Breakpoints por defecto de Tailwind, sin personalizar.
9. **Espaciado** únicamente de la escala (base 4 px). Preferir `gap-*` y `flex/grid` a márgenes entre hermanos; los márgenes los pone el contenedor, no el hijo.
10. **Un `className` externo solo añade clases**, no redefine utilidades del mismo grupo (no hay `tailwind-merge`: ver [performance-budget.md](../quality/performance-budget.md)).
11. **Orden de clases** lo impone Prettier (`prettier-plugin-tailwindcss`); no se ordena a mano.
12. **Estados con variantes de Tailwind**, no con JS: `hover:`, `focus-visible:`, `disabled:`, `aria-[invalid]:`, `motion-reduce:`. Preferir `aria-*`/`data-*` (que Radix ya emite) a clases por estado.
13. **Foco:** lo pone `base.css` para todo `:focus-visible`. Los componentes no lo redefinen ni lo quitan.
14. **Contenedores responsivos:** componentes autónomos usan container queries (`@container`, `@md:`) cuando su ancho depende del contenedor y no de la ventana.

Excepción puntual: comentar la línea con `design-allow: <motivo>`; el motivo se revisa en el PR.

## 5. Contrato de tokens

Estos nombres son la API; los valores son libres dentro de las restricciones. `tokens.css` los declara todos y el chequeo falla si falta alguno.

| Familia | Tokens | Restricciones de valor |
|---|---|---|
| Superficies | `bg`, `surface`, `surface-raised`, `surface-hover`, `overlay` | `surface` y `bg` distinguibles; `overlay` deja ver el fondo |
| Texto | `fg`, `fg-muted` | `fg` ≥ 7:1 sobre `surface`; `fg-muted` ≥ 4.5:1 |
| Bordes | `border`, `border-strong` | `border-strong` (el de inputs) ≥ 3:1 contra el fondo |
| Acento | `accent`, `accent-hover`, `accent-fg`, `accent-subtle`, `accent-subtle-fg`, `focus` | `accent-fg` sobre `accent` ≥ 4.5:1; `focus` ≥ 3:1 contra cualquier superficie |
| Tonos de estado | `neutral`, `info`, `success`, `warning`, `danger` × (`` , `-subtle`, `-fg`) | sólido = borde/ícono; `-fg` sobre `-subtle` ≥ 4.5:1 |
| Fuentes | `font-sans`, `font-mono` | Máx. 2 familias (§9) |
| Roles de texto | `caption`, `small`, `body`, `heading-3`, `heading-2`, `heading-1`, `metric` (+ `--line-height`) | Cuerpo ≥ 16 px; `small` ≥ 14 px; `caption` ≥ 12 px |
| Forma | `radius-sm/md/lg/full`, `shadow-raised/overlay` | Máx. 3 niveles de elevación (plano, raised, overlay) |
| Otros | `focus-ring-width/offset`, `target-min`, `z-sticky/overlay/toast`, `duration-fast/base` | `target-min` ≥ 24 px (WCAG 2.2), recomendado 40 px; foco ≥ 2 px |

Cada token de color debe definirse **para los dos temas** (con `light-dark()`). Los tonos de severidad de incidente se resuelven reutilizando los de estado; si el diseño necesita un matiz propio (p. ej. P2 naranja distinto del ámbar de advertencia), se añaden tokens `sev-p1…p4` siguiendo el mismo patrón sólido/subtle/fg.

**Mapeo semántico de dominio** (vive en la feature, no en `shared`): P1 → `danger`, P2 → `warning`, P3 → `info`, P4 → `neutral`; sensor activo → `success`, en mantenimiento → `warning`, inactivo → `neutral`, retirado → `neutral`; conectividad perdida → `danger`.

## 6. Anatomía de una página y jerarquía

Orden fijo, de arriba abajo; cada bloque es opcional salvo el encabezado:

1. **Encabezado de página**: un único `h1`, contexto (breadcrumb o estado) y **una** acción primaria a la derecha (en móvil, debajo).
2. **Resumen** (KPIs/estado): lo que se necesita saber sin desplazarse. Máx. 4 métricas.
3. **Barra de filtros**: filtros activos visibles, con opción de limpiar todos.
4. **Contenido principal**: tabla, lista o detalle.
5. **Paginación** (al pie del contenido, nunca solo arriba).

Reglas de jerarquía:

- **Un `h1` por vista**; `h2` por sección, sin saltar niveles. El título de página también se refleja en `document.title`.
- **Una acción primaria por vista** (botón `primary`). El resto es `secondary` o `ghost`. Las destructivas nunca son primarias por defecto.
- **El orden visual = el orden del DOM = el orden de tabulación.** No se reordena con CSS lo que cambia el orden de lectura.
- **Divulgación progresiva:** la lista muestra lo necesario para decidir a cuál entrar; el detalle muestra el resto. Detalle de entidad: encabezado con estado + acciones → resumen → historial/línea de tiempo.
- **Tablas:** columna de identidad primero, estado/severidad segundo, tiempos al final; alineación a la izquierda para texto y a la derecha para números; `caption` y `th scope` siempre.
- **Espaciado jerárquico:** más espacio entre secciones que dentro de una sección (proximidad = relación).

## 7. UX: patrones obligatorios

**Estados de datos** (regla del proyecto): toda vista que carga datos resuelve `loading`, `empty`, `error` y `success`.

| Estado | Patrón |
|---|---|
| Loading | `LoadingState` (`role="status"`); en listas largas, esqueleto con la forma del contenido tras ~300 ms; nunca un spinner a pantalla completa si hay contenido previo |
| Empty | `EmptyState`: dice **por qué** está vacío y qué hacer (con acción si existe) |
| Error | `ErrorState` (`role="alert"`): mensaje por `code`, `correlationId` visible, **Reintentar** |
| Success | Escrituras: confirmación inline o toast no bloqueante (`aria-live="polite"`); nunca solo por color |

**Formularios**
- Label siempre visible (no placeholder como label); texto de ayuda antes del campo, error después, asociado con `aria-describedby`.
- Validar al enviar y al salir del campo; con ≥ 3 errores, resumen arriba con enlaces a cada campo. Foco al primer error.
- Marcar lo opcional, no lo obligatorio, si casi todo es obligatorio.
- Botón de envío con verbo + objeto («Registrar unidad»); estado `loading` que bloquea reenvío; no deshabilitarlo sin explicar por qué.
- La validación del cliente es solo UX; los errores del backend (`errors[]` por `field`) se muestran junto al campo.

**Acciones críticas** (reconocer, escalar, cerrar, retirar, cambiar estado): diálogo de confirmación que nombra el objeto y pide el **motivo** cuando el backend lo exige; el botón confirma con el mismo verbo. Las escrituras son **pesimistas** (se refleja el resultado del servidor, no se anticipa).

**Concurrencia:** `409 CONCURRENT_MODIFICATION` → aviso no destructivo («Alguien más modificó este registro») con **Recargar**, conservando lo que el usuario escribió.

**Timeouts de escritura:** `WRITE_TIMEOUT` → no se sabe si se aplicó; se pide revisar el estado antes de repetir.

**Tiempo y severidad (dominio operativo):**
- La severidad nunca depende solo del color: siempre texto o ícono con nombre accesible.
- Plazos (`ackDueAt`, `resolveDueAt`): relativo («vence en 4 min») **y** absoluto accesible (`<time datetime>` + `title`/tooltip). Vencido se marca como estado, no solo como color.
- Instantes del backend (UTC) se muestran en la zona horaria del usuario; formato `Intl` en español.
- Datos que cambian solos (polling): actualizar sin saltos de layout ni perder foco o selección; indicar «actualizado hace…».

**Permisos:** se oculta lo que el rol no puede hacer; si el usuario llega por URL, mensaje claro de falta de acceso (no redirección silenciosa). La autoridad es el `403` del backend.

**Voz y copy** (detalle en [ui-copy-guidelines.md](../product/ui-copy-guidelines.md)): español neutro, tuteo («Ingresa»), sentence case, frases cortas, términos de dominio constantes («incidente», «activo», «sensor»), sin jerga técnica ni códigos crudos en pantalla (el `code` se mapea a un mensaje).

## 8. Accesibilidad (línea base: WCAG 2.2 AA)

- Contraste: texto 4.5:1, texto grande y componentes de UI 3:1 (los umbrales de §5 lo garantizan).
- Todo es operable con teclado; orden lógico; **foco siempre visible** y no oculto por elementos fijos; sin trampas de foco (los diálogos de Radix gestionan foco y `Esc`).
- Objetivos táctiles/clic ≥ 24 px (recomendado 40 px, `--target-min`).
- Landmarks (`header`, `nav` con `aria-label`, `main#main`), enlace «Saltar al contenido», `lang="es"`.
- Nombres accesibles para todo control; íconos decorativos `aria-hidden`, informativos con texto.
- Cambios dinámicos anunciados: `role="status"`/`aria-live="polite"`; errores `role="alert"`.
- Reflow a 320 px sin scroll horizontal de página (solo tablas en su contenedor `overflow-x-auto`); zoom 200 % sin pérdida.
- `prefers-reduced-motion` respetado (global en `base.css`); sin animación que dependa de movimiento para transmitir estado.
- El color nunca es el único canal de información.

Comprobación por pantalla: [usability-checklist.md](../quality/usability-checklist.md).

## 9. Rendimiento como regla de diseño

Presupuesto y control en [performance-budget.md](../quality/performance-budget.md). Implicaciones para diseño:

- **Fuentes:** por defecto, pila del sistema (0 kB). Si se propone una webfont: **una** familia variable, `woff2`, subconjunto latino, `font-display: swap`, **autoalojada** (sin CDN de fuentes), con precarga solo de la del texto base, y debe caber en el presupuesto (≤ 30 kB). Mono solo para ids y valores técnicos, con la pila del sistema.
- **Íconos:** SVG inline en componentes propios, solo los usados; sin librerías de íconos. Todo ícono con `aria-hidden` o nombre.
- **Imágenes:** ninguna salvo SVG. Sin imágenes de fondo decorativas.
- **Efectos costosos fuera:** `backdrop-filter`, sombras múltiples grandes, degradados animados.
- **Animación:** solo CSS (`transition` de `duration-fast/base`) y solo en propiedades baratas (`opacity`, `transform`). Sin librerías de animación.
- **CSS inicial ≤ 8 kB gzip.** Cada token nuevo y cada utilidad usada cuentan.

## 10. Proceso de cambio y definición de terminado

Un cambio de diseño se hace en este orden: **1)** tokens → **2)** componente base (`shared/ui`) → **3)** patrón compuesto → **4)** pantalla. Si la pantalla necesita algo que un nivel inferior no ofrece, se amplía ese nivel; no se parcha en la pantalla.

Una pantalla o componente está terminado cuando:
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan (incluye reglas de diseño y presupuesto).
- [ ] Resuelve loading, empty, error y success.
- [ ] Se usa solo con teclado y se ve bien en 320 px, 768 px y 1280 px, en tema claro y oscuro.
- [ ] Cumple [usability-checklist.md](../quality/usability-checklist.md).
- [ ] La decisión no obvia queda registrada en [design-decisions.md](design-decisions.md).
