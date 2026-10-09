# Gestión de estado

| Tipo de estado                                     | Dónde vive                     | Herramienta                          |
| -------------------------------------------------- | ------------------------------ | ------------------------------------ |
| Datos del servidor (activos, incidentes, métricas) | Caché por query key            | TanStack Query                       |
| Sesión (token, usuario, roles)                     | `sessionStorage`               | Zustand (`features/auth/session.ts`) |
| Formularios                                        | Local al formulario            | React Hook Form + Zod                |
| Filtros y paginación                               | Local a la página (`useState`) | —                                    |

## Sesión

- El token **no se persiste** (ni `localStorage` ni cookies): así lo define el backend. Recargar la página cierra la sesión.
- Los roles se leen de los claims del JWT (`roles`, `preferred_username`, `sub`) solo para adaptar la UI. No se verifica la firma en el cliente.
- Un temporizador cierra la sesión cuando vence `expiresIn`; un `401` hace lo mismo y vacía la caché de queries. El flag `ended` permite mostrar «Tu sesión terminó» en el login.

## Reglas

- No copiar datos del servidor a Zustand.
- Query keys por feature, en el mismo archivo que sus hooks (`assetKeys`, `incidentKeys`).
- Reintentos: una sola vez y solo ante fallos transitorios; nunca timeouts ni 4xx; las mutaciones nunca (ver [api-contract-consumption.md](api-contract-consumption.md)).
- Si más adelante se necesita compartir filtros por URL, moverlos a `searchParams` (sin librería nueva).
