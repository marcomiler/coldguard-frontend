# Routing

React Router en modo librería, definido en `src/app/router.tsx`.

| Ruta         | Acceso                                                        | Notas                                                       |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------------------- |
| `/login`     | pública                                                       | Redirige a la pantalla de inicio del rol si ya hay sesión   |
| `/`          | autenticado                                                   | `HomeRedirect`: primera pantalla útil del rol               |
| `/incidents` | `OPERATIONS_SUPERVISOR`, `OPERATOR`, `MAINTENANCE_TECHNICIAN` | **Oculta** (`ready: false`) hasta que el backend de incidentes exista |
| `/assets`    | `PLATFORM_ADMIN`, `OPERATIONS_SUPERVISOR`                     | Lista de activos                                            |
| `/users`     | `PLATFORM_ADMIN`                                              | Crear usuarios, asignar o revocar roles, habilitar o deshabilitar |

- `RequireAuth` redirige a `/login` guardando la ruta de origen. Tras ingresar, `resolveLanding` respeta esa ruta **solo si el rol puede abrirla**; si no, va a la primera pantalla disponible del rol.
- `RequireArea` muestra «Esta sección aún no está disponible» si el área está oculta (`ready: false`) o «No tienes acceso» si el rol no la incluye (no redirige, para no ocultar por qué).
- El menú muestra solo las áreas que el rol puede abrir (`canAccess`: rol y backend listo).
- Las páginas de cada área se cargan con `lazy()`.
- Los guards solo mejoran la UX; el backend responde `403` igualmente.
- Los roles sin ninguna área disponible hoy (`OPERATOR`, `MAINTENANCE_TECHNICIAN`, `AUDITOR`) ven un mensaje explicativo en lugar de una redirección a una pantalla sin acceso.
