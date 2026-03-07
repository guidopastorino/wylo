# Wylo

Monorepo for **Wylo**: web app (Next.js) and API (Express). Shared TypeScript types live in `@wylo/shared`.

## Structure

```
wylo/
├── apps/
│   ├── web/        # Next.js
│   └── backend/    # Express
└── packages/
    └── shared/     # Shared types (@wylo/shared)
```

## Setup

```bash
npm install
```

`postinstall` builds the shared package.

## Commands

| Command   | Description        |
| --------- | ------------------ |
| `npm run web`     | Start Next.js dev server   |
| `npm run backend` | Start Express API          |
| `npm run lint`    | Lint (web)                 |
| `npm run docker:up` | Start Postgres only (local DB) |

## Docker

- **Solo Postgres (desarrollo local):** `npm run docker:up` — levanta solo la base. Backend y web se corren con `npm run backend` y `npm run web` (usa `DATABASE_URL=postgres://wylo:wylo@localhost:5432/wylo`).
- **Stack completo (Postgres + backend en contenedores):** `docker compose up --build`
- **Bajar contenedores:** `docker compose down`
- **Bajar y borrar volumen de DB:** `docker compose down -v`
- **Build de la imagen del backend (para desplegar en Lightsail, etc.):** `docker build -f apps/backend/Dockerfile -t wylo-backend .`

## Shared types

Define types in `packages/shared/src/` and import in any app:

```ts
import type { User, ApiResponse } from '@wylo/shared';
```

Run `npm run build:shared` after changing shared (or rely on `postinstall`).
