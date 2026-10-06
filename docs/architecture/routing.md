# Routing

React Router en modo librería, definido en `src/app/router.tsx`.

| Ruta         | Acceso                                                        | Notas                                                       |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------------------- |
| `/login`     | pública                                                       | Redirige a la pantalla de inicio del rol si ya hay sesión   |
| `/`          | autenticado                                                   | `HomeRedirect`: primera pantalla útil del rol               |
| `/incidents` | `OPERATIONS_SUPERVISOR`, `OPERATOR`, `MAINTENANCE_TECHNICIAN` | Tablero; las métricas por prioridad solo para el supervisor |
| `/assets`    | `PLATFORM_ADMIN`, `OPERATIONS_SUPERVISOR`                     | Lista de activos                                            |

- `RequireAuth` redirige a `/login` guardando la ruta de origen. `RequireArea` muestra «No tienes acceso» (no redirige, para no ocultar por qué).
- Las páginas de cada área se cargan con `lazy()`.
- Los guards solo mejoran la UX; el backend responde `403` igualmente.
- El rol `AUDITOR` aún no tiene pantalla (la bitácora es `planned`, SPEC-007): al ingresar ve un mensaje explicativo.
