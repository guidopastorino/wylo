# Wylo

Monorepo for **Wylo**: web app (Next.js), API (Express), and mobile app (Expo). Shared TypeScript types live in `@wylo/shared`.

## Structure

```
wylo/
├── apps/
│   ├── web/        # Next.js
│   ├── backend/    # Express
│   └── mobile/     # Expo (React Native)
└── packages/
    └── shared/     # Shared types (@wylo/shared)
```

## Setup

```bash
npm install
```

`postinstall` builds the shared package.

## Commands

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run web`      | Start Next.js dev server       |
| `npm run backend`  | Start Express API              |
| `npm run mobile`   | Start Expo app (tunnel mode)   |
| `npm run lint`     | Lint (web)                     |
| `npm run docker:up`| Start Postgres only (local DB)  |

## Docker

Postgres only for local development. Backend and web run on the host with `npm run backend` and `npm run web`.

- **Start the DB:** `npm run docker:up` or `docker compose up -d`
- **Stop containers:** `docker compose down`
- **Stop and remove DB volume:** `docker compose down -v`

With the DB running, use `DATABASE_URL=postgres://wylo:wylo@localhost:5432/wylo` in the backend.

To deploy the backend (e.g. Render), build the image: `docker build -f apps/backend/Dockerfile -t wylo-backend .`

## Shared types

Define types in `packages/shared/src/` and import in any app:

```ts
import type { User, ApiResponse } from '@wylo/shared';
```

Run `npm run build:shared` after changing shared (or rely on `postinstall`).
