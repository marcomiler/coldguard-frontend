# ColdGuard Frontend

Capa de presentación de ColdGuard (SPA React + TypeScript + Vite). Consume el Gateway REST de `coldguard-platform`.

## Alcance inicial

- Login.
- Dashboard de incidentes.
- Registro y consulta de unidades.
- Vista de detalle de incidente.
- Métricas operativas básicas.

## Requisitos

Node 22+ y pnpm. El backend vive en `../coldguard-platform` (solo lectura desde este repo); la guía para levantarlo está en `../coldguard-platform/docs/frontend-integration.md`. En su `.env` local, `COLDGUARD_CORS_ALLOWED_ORIGINS=http://localhost:5173`.

## Comandos

```bash
pnpm install
cp .env.example .env     # configuración pública, sin secretos
pnpm dev                 # http://localhost:5173
pnpm api:types           # regenera src/shared/api/schema.d.ts desde el contrato OpenAPI
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Backend real y mocks

Lo `implemented` en el contrato va al backend real; lo `planned` se mockea con MSW solo en desarrollo (hoy: listado de incidentes y métricas; el resto de lo planificado se agrega al construir su pantalla). `VITE_MOCKS=off` los desactiva. Detalle en [docs/architecture/api-contract-consumption.md](docs/architecture/api-contract-consumption.md).

Usuarios demo (los crea `seed-demo.sh` del backend): `admin`, `supervisor`, `operator`, `technician`, `auditor`.

## Documentación

Ver [docs/README.md](docs/README.md). Arquitectura: [docs/architecture/frontend-architecture.md](docs/architecture/frontend-architecture.md).
