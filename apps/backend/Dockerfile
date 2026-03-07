FROM node:20-slim AS base
WORKDIR /app

# ── 1. Instalar dependencias SIN correr postinstall ──────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci --ignore-scripts

# ── 2. Copiar fuentes y buildear shared ──────────────────────────────────────
FROM deps AS build-shared
COPY packages/shared ./packages/shared
RUN npm run build:shared

# ── 3. Build backend ─────────────────────────────────────────────────────────
FROM build-shared AS build
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build

# ── 4. Runner ────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
EXPOSE 5000
CMD ["node", "dist/index.js"]