# Decisiones de diseño

Registro de decisiones no obvias, con su porqué. Las **reglas** vigentes están en [design-system.md](design-system.md); aquí queda el historial y el razonamiento.

## Vigentes

1. **Tailwind + Radix primitives, sin librería de componentes completa.** Radix resuelve foco, teclado y ARIA; Tailwind da layouts responsive sin CSS propio.
2. **Todo estado de datos tiene los cuatro casos** (loading, empty, error, success), con `role` adecuado. Es regla del proyecto.
3. **El error muestra el código de seguimiento (`correlationId`)** para que soporte rastree la petición en los logs del backend.
4. **El significado nunca depende solo del color:** prioridad, criticidad y estado llevan texto.
5. **Sesión solo en memoria** (lo define el backend: sin cookies ni refresh). Costo: recargar pide ingresar de nuevo; al terminar sola se explica en el login.
6. **La UI oculta lo que el rol no puede hacer, pero no es la autoridad.** Un acceso sin permiso muestra un mensaje en lugar de redirigir en silencio.
7. **Nada simulado en el producto** (revisada el 2026-10-06; antes avisaba «datos simulados»). Lo que el backend aún no ofrece se oculta, no se imita.
8. **Navegación por teclado:** enlace «Saltar al contenido», foco visible global, tablas con `caption` y `th scope`, formularios con label visible y errores asociados.
9. **Tokens en dos capas (primitivos → semánticos) y tema con `light-dark()` (2026-10-06).** Los componentes consumen solo semánticos (`bg-surface`, `text-fg`…) y nunca `dark:`. Así rediseñar o añadir un tema es editar `tokens.css`, sin tocar componentes. Se descartaron los tokens por componente (`--button-bg`): multiplican el contrato sin aportar.
10. **Se eliminan las escalas por defecto de Tailwind** (`--color-*: initial`, etc.). Quien diseña no puede usar por accidente un color o tamaño fuera del sistema; el chequeo automático cubre lo que Tailwind no impide.
11. **Sin CSS de componentes ni `tailwind-merge`.** Menos peso y una sola forma de estilizar. Costo: un `className` externo solo puede añadir clases.
12. **Fuentes del sistema por defecto** (sustituida por la 16 al elegir la dirección A). El criterio se mantiene: una webfont solo si cabe en el presupuesto.
13. **Reglas de diseño verificadas en `pnpm lint`** (`scripts/check-design-rules.mjs`): una regla que no se verifica se erosiona.
14. **Dirección elegida: A «Sala de Control» (2026-10-06).** Oscuro por defecto, bordes finos en lugar de sombras, cifras en monoespaciada, riel lateral. Sustituye la decisión 8 (tema según el sistema): ahora el tema por defecto es oscuro y el usuario lo cambia con `ThemeToggle`; la elección se guarda en `localStorage` y se aplica antes del primer pintado.
15. **Texto más pequeño que el contrato inicial.** Cuerpo 14 px, `small` 13 px, `caption` 12 px (antes 16/14/12) y control estándar de 32 px (antes 40). Es una interfaz de datos densa; WCAG 2.2 no fija un tamaño mínimo y se compensa con zoom al 200 %, reflow a 320 px y un suelo de 12 px. Los formularios de entrada y las acciones principales usan 40 px.
16. **Fuentes autoalojadas dentro del presupuesto.** IBM Plex Sans 400/600 + IBM Plex Mono 500 subseteadas y sin hinting: 23 kB de 30 kB. Solo dos pesos de sans: `font-medium` ya no existe (se renderizaría igual que el normal), el énfasis es siempre `font-semibold`.
17. **Vocabulario ampliado:** `variant` gana `danger`, `size` gana `lg` y `tone` gana `accent`. La criticidad de un activo usa una escala propia de 4 colores (neutral → info → warning → danger) con su etiqueta en texto; es la misma gama que la severidad pero se distingue por el contexto (columna «Criticidad», sin prefijo P1–P4). Roles tipográficos nuevos: `display`, `heading-4`, `code`.
18. **Los componentes no inventan datos.** La vista previa mostraba nombres de unidad, rangos y lecturas que el contrato actual no entrega; las pantallas reales muestran solo lo que devuelve la API (p. ej. el incidente trae `assetId`, no el nombre de la unidad).
19. **Áreas ocultas hasta que su backend exista.** Un área con operaciones `planned` no aparece en el menú, no es destino de aterrizaje y su ruta explica que aún no está disponible. Se activa con un solo valor (`ready`) en `roles.ts`.
20. **Aterrizaje por rol, no por historial.** Tras ingresar se va a la página solicitada solo si el rol puede abrirla; si no, a la primera pantalla disponible. Antes, un operador heredaba la ruta `/assets` del admin anterior y veía «sin acceso».
21. **Tema con ícono y usuario con identidad.** El tema se cambia con un botón de ícono (sol/luna, con nombre accesible); el pie del riel muestra una inicial circular, el nombre de usuario y el rol.
22. **Cambios sensibles piden motivo y se confirman en un diálogo** (asignar o revocar rol, habilitar o deshabilitar usuario), igual que exige el backend; las escrituras no son optimistas.

## Pendiente

- Pantallas del resto del MVP con la dirección A: dashboard con medidores lineales por unidad (necesita lecturas, `GET /sensors/{id}/readings`, ya disponible), detalle de incidente y registro de unidad y sensor.
- Validar contraste con las pantallas reales y probar con lector de pantalla ([usability-checklist.md](../quality/usability-checklist.md)).
