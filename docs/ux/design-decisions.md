# Decisiones de diseño

Registro de decisiones no obvias, con su porqué. Las **reglas** vigentes están en [design-system.md](design-system.md); aquí queda el historial y el razonamiento.

## Vigentes

1. **Tailwind + Radix primitives, sin librería de componentes completa.** Radix resuelve foco, teclado y ARIA; Tailwind da layouts responsive sin CSS propio.
2. **Todo estado de datos tiene los cuatro casos** (loading, empty, error, success), con `role` adecuado. Es regla del proyecto.
3. **El error muestra el código de seguimiento (`correlationId`)** para que soporte rastree la petición en los logs del backend.
4. **El significado nunca depende solo del color:** prioridad, criticidad y estado llevan texto.
5. **Sesión solo en memoria** (lo define el backend: sin cookies ni refresh). Costo: recargar pide ingresar de nuevo; al terminar sola se explica en el login.
6. **La UI oculta lo que el rol no puede hacer, pero no es la autoridad.** Un acceso sin permiso muestra un mensaje en lugar de redirigir en silencio.
7. **Pantallas con datos simulados lo avisan** mientras la operación sea `planned`.
8. **Navegación por teclado:** enlace «Saltar al contenido», foco visible global, tablas con `caption` y `th scope`, formularios con label visible y errores asociados.
9. **Tokens en dos capas (primitivos → semánticos) y tema con `light-dark()` (2026-10-06).** Los componentes consumen solo semánticos (`bg-surface`, `text-fg`…) y nunca `dark:`. Así rediseñar o añadir un tema es editar `tokens.css`, sin tocar componentes. Se descartaron los tokens por componente (`--button-bg`): multiplican el contrato sin aportar.
10. **Se eliminan las escalas por defecto de Tailwind** (`--color-*: initial`, etc.). Quien diseña no puede usar por accidente un color o tamaño fuera del sistema; el chequeo automático cubre lo que Tailwind no impide.
11. **Sin CSS de componentes ni `tailwind-merge`.** Menos peso y una sola forma de estilizar. Costo: un `className` externo solo puede añadir clases.
12. **Fuentes del sistema por defecto.** Cero kB y cero parpadeo; una webfont solo si cabe en el presupuesto y aporta identidad.
13. **Reglas de diseño verificadas en `pnpm lint`** (`scripts/check-design-rules.mjs`): una regla que no se verifica se erosiona.

## Pendiente

- Identidad visual definitiva (paleta, tipografía, radios) a cargo de Claude Design, **dentro** de las reglas de [design-system.md](design-system.md). Hoy `tokens.css` tiene valores neutros provisionales.
- **Selector manual de tema:** `light-dark()` ya lo soporta, pero el build actual lo degrada para navegadores antiguos (solo sigue al sistema). Para forzar el tema desde la UI hay que subir `build.cssTarget` a navegadores con soporte nativo (Chrome 123+, Safari 17.5+, Firefox 120+).
- Validar contraste con las pantallas reales y probar con lector de pantalla ([usability-checklist.md](../quality/usability-checklist.md)).
