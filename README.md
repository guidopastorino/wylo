# Wylo

Monorepo for **Wylo**: web app (Next.js), API (Express), and mobile (Expo). Shared TypeScript types live in `@wylo/shared`.

## Structure

```
wylo/
├── apps/
│   ├── web/        # Next.js
│   ├── backend/    # Express
│   └── mobile/     # Expo
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
| `npm run mobile`  | Start Expo                 |
| `npm run lint`    | Lint (web)                 |
| `npm run ci`      | Lint + build backend + web |

## Shared types

Define types in `packages/shared/src/` and import in any app:

```ts
import type { User, ApiResponse } from '@wylo/shared';
```

Run `npm run build:shared` after changing shared (or rely on `postinstall`).
