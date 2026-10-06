# Decisiones de diseño

> Destino de `docs/ux-decisions.md` (estaba vacío). Ver [migration-report.md](../migration-report.md).

Formato: decisión → por qué.

## Vigentes

1. **Tailwind + Radix primitives, sin librería de componentes completa.** Radix resuelve foco, teclado y ARIA (menús, y más adelante diálogos y selects); Tailwind da layouts responsive sin CSS propio. Los componentes base viven en `src/shared/ui`.
2. **Todo estado de datos tiene los cuatro casos.** `LoadingState` (`role="status"`), `EmptyState`, `ErrorState` (`role="alert"`, con reintento y código de seguimiento) y el contenido. Es regla del proyecto.
3. **El error muestra el código de seguimiento (`correlationId`).** Permite que soporte rastree la petición en los logs del backend.
4. **El significado nunca depende solo del color.** Prioridad, criticidad y estado llevan siempre texto (`Badge`).
5. **Sesión solo en memoria.** Lo define el backend (sin cookies ni refresh). Costo: recargar la página pide ingresar de nuevo. Al terminar la sesión sola se explica en el login.
6. **La UI oculta lo que el rol no puede hacer, pero no es la autoridad.** Un acceso sin permiso muestra un mensaje en lugar de redirigir en silencio.
7. **Pantallas con datos simulados lo avisan.** Mientras una operación sea `planned`, la pantalla muestra «Datos simulados» para no confundir una demo con datos reales.
8. **Tema claro/oscuro según el sistema** (`prefers-color-scheme`), sin selector propio en el MVP.
9. **Navegación por teclado.** Enlace «Saltar al contenido», foco visible en todos los controles, tablas con `caption` y `th scope`, formularios con label visible y errores asociados (`aria-describedby`).

## Pendiente

- Paleta y tipografía definitivas (hoy se usan los tokens por defecto de Tailwind).
- Validar contraste con las pantallas reales; ver [accessibility-notes.md](accessibility-notes.md).
