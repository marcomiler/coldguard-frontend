# Arquitectura frontend

Estado: definida (v0.1). Verificada contra `package.json`.

## Principios

- Solo capa de presentación. Las reglas de dominio las decide el backend (`coldguard-platform`); la UI las explica con el `code` del error, no las repite.
- El contrato `coldguard-platform/contracts/rest/openapi.yaml` es la fuente de verdad (solo lectura desde este repo).
- SPA estática: es una app interna autenticada, sin SEO, así que no hay SSR.
- Lo mínimo que resuelva el MVP, y el menor peso posible (presupuesto verificado en cada build). Sin Redux, sin librería de componentes completa, sin micro-frontends.

## Stack

| Capa               | Elección                                                       | Motivo                                                 |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| Build / framework  | React 19 + TypeScript (strict) + Vite                          | SPA con despliegue estático                            |
| Routing            | React Router (modo librería, `lazy()` por área)                | Guards por rol y división de código                    |
| Datos del servidor | TanStack Query                                                 | loading / error / caché / paginación sin código propio |
| Cliente API        | `openapi-typescript` + `openapi-fetch`                         | Tipos generados del contrato                           |
| Estado de UI       | Zustand (solo sesión)                                          | El estado del servidor no se duplica                   |
| Formularios        | React Hook Form + Zod                                          | La validación del cliente es solo UX                   |
| UI                 | Tailwind CSS 4 + Radix UI primitives + `cva`                   | Accesibilidad (teclado, ARIA) y layouts responsive     |
| Calidad            | ESLint (+ `jsx-a11y`), Prettier, Vitest + Testing Library, MSW |                                                        |

Nota: TypeScript está fijado en 5.9 porque `openapi-typescript` aún no es compatible con la API del compilador de TypeScript 7.

## Estructura

```
src/
  app/        bootstrap, router, guards por rol, AppShell
  features/   auth/  assets/  incidents/   (cada una: api/, pages/, componentes propios)
  shared/     api/ (cliente, errores, schema.d.ts generado), ui/ (primitivos), patterns/ (cuando haya repetición), lib/, config/
  styles/     tokens.css (único lugar de valores visuales), base.css (estilos globales)
  mocks/      handlers MSW, solo de operaciones `planned` (solo en desarrollo)
```

Reglas de dependencia: `app → features → shared`. Una feature no importa de otra feature (la excepción actual es `auth/session`, que es transversal). `shared` no importa de `features`: la sesión se inyecta con `configureAuthBridge`. Los componentes no llaman a `fetch`; usan hooks de `features/*/api`.

## Estilos

Tailwind v4 CSS-first en cuatro capas (primitivos → tokens semánticos → base → componentes con utilidades), sin CSS de componentes y con el tema claro/oscuro resuelto en los tokens. Reglas y contrato de tokens en [design-system.md](../ux/design-system.md); se verifican en `pnpm lint` (`scripts/check-design-rules.mjs`). Niveles de componentes en [component-structure.md](component-structure.md).

Relacionado: [routing.md](routing.md), [state-management.md](state-management.md), [api-contract-consumption.md](api-contract-consumption.md), [component-structure.md](component-structure.md).

## Pendiente

- Pantallas del resto del MVP (detalle de incidente, formulario de unidad, sensores, administración).
- Peso: presupuesto aplicado en cada build, ver [performance-budget.md](../quality/performance-budget.md).
