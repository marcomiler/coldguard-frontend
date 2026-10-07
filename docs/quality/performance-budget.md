# Presupuesto de rendimiento

Principio: el peso es el mínimo posible y **no puede crecer sin que el build lo detecte**.

## Presupuesto (gzip)

| Recurso                                | Límite | Medido (2026-10-06) |
| -------------------------------------- | ------ | ------------------- |
| JS inicial (lo que carga `index.html`) | 115 kB | 112.7 kB            |
| CSS inicial                            | 8 kB   | 6.1 kB              |
| Cualquier chunk cargado bajo demanda   | 30 kB  | 27.0 kB (shell)     |
| Fuentes (`woff2`, total)               | 30 kB  | 22.6 kB             |

Los límites viven en `scripts/check-bundle-size.mjs` y se verifican en cada `pnpm build` (y por tanto en el CI): si se excede, el build falla. Subir un límite exige justificarlo aquí.

## Cómo se mantiene

1. **Una página, un chunk.** Todas las áreas se cargan con `lazy()`; el shell (menú Radix) también, así que la pantalla de login no lo paga.
2. **Dependencias solo donde se usan.** Zod y React Hook Form no están en el bundle inicial. Si un formulario complejo las necesita, se instalan y se usan **solo dentro de su ruta lazy**; el login y la sesión no las importan.
3. **Sin `tailwind-merge`.** `cn` es `clsx`: los componentes base no pisan clases entre sí, y un `className` externo solo añade.
4. **Antes de agregar una dependencia**, medir su efecto con `pnpm build`. Preferir la API de la plataforma (`fetch`, `AbortSignal`, `Intl`, `FormData`) a una librería.
5. **Sin datos ni código de simulación** en el producto: no hay MSW ni mocks.
6. **Íconos e imágenes:** SVG inline puntual en componentes propios; ni librerías de íconos ni imágenes decorativas.
7. **Fuentes:** `woff2` autoalojadas, subconjunto (español + símbolos de datos) y **sin hinting** (reduce el peso a la mitad), `font-display: swap`. Hoy IBM Plex Sans 400/600 e IBM Plex Mono 500 (22.6 kB). El build suma todos los `woff2` y falla por encima de 30 kB; una fuente nueva debe justificarse en [design-decisions.md](../ux/design-decisions.md).
8. **CSS:** el diseño no puede superar 8 kB gzip iniciales; las reglas de [design-system.md](../ux/design-system.md) §9 (sin efectos costosos ni librerías de animación) existen para eso.

## Historial

- Bundle inicial inicial: 185 kB gzip. Se quitó Zod + React Hook Form del login y de la sesión, `tailwind-merge` y se difirió el shell: 111 kB (−40 %).

## Pendiente

- Medir métricas web reales (LCP, INP, CLS) con las pantallas definitivas, cuando el diseño esté definido.
- Evaluar `modulepreload` de la ruta de inicio del rol tras el login.
