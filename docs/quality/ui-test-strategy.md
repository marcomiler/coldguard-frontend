# Estrategia de pruebas de UI

## Capas

| Capa                                                   | Herramienta                                                       | Qué cubre                                                                                                                                                                               | Cuándo corre                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Unitarias y de componente                              | Vitest + Testing Library                                          | Lógica de roles y aterrizaje, permisos de acciones, formularios (validación sin llamar a la API), hooks (`useAutoDismiss`, tema), componentes con estado (diálogo de roles, paginación) | `pnpm test`, en el CI                                                 |
| Reglas de diseño y peso                                | `scripts/check-design-rules.mjs`, `scripts/check-bundle-size.mjs` | Tokens, estilos prohibidos, presupuesto de bytes                                                                                                                                        | `pnpm lint`, `pnpm build`, en el CI                                   |
| Validación visual y de permisos contra el sistema real | Playwright (`pnpm check:visual`)                                  | Una sesión por rol: sidebar fijo, paginación, botones según rol, gráfico, interruptor de tema, sin scroll horizontal en móvil (390 px), sin errores de consola, en tema claro y oscuro  | A mano antes de entregar; necesita `pnpm dev`, el backend y `CG_PASS` |

`pnpm check:visual` deja capturas en `.visual-check/` (ignorado por git). Primera vez en una máquina: `pnpm exec playwright install chromium`.

## Reglas

- Un componente con lógica propia lleva prueba; el estilo no se prueba con unitarias (lo cubren las reglas de diseño y las capturas).
- Las pruebas de Playwright usan el backend real: no hay mocks (ver [api-contract-consumption.md](../architecture/api-contract-consumption.md)).
- No se registran resultados que no se hayan ejecutado.

## Pendiente

- Flujos de escritura de punta a punta (reconocer, cerrar, crear usuario) en un entorno de pruebas aislado: hoy mutarían los datos de la demo, por eso no se automatizan.
- Integrar `check:visual` en el CI cuando exista un backend efímero para el pipeline.
