# ---------- base ----------
FROM node:20-slim AS base
WORKDIR /app


# ---------- deps ----------
FROM base AS deps

# manifests
COPY package.json package-lock.json ./

# workspace manifests
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# instalar deps
RUN npm ci


# ---------- build ----------
FROM deps AS build

# source
COPY apps ./apps
COPY packages ./packages

# build shared
RUN npm run build -w packages/shared

# build backend
WORKDIR /app/apps/backend
RUN npm run build


# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# deps hoisted
COPY --from=deps /app/node_modules ./node_modules

# shared build
COPY --from=build /app/packages/shared ./packages/shared

# backend build
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/package.json ./apps/backend/package.json

WORKDIR /app/apps/backend

EXPOSE 5000

CMD ["node", "dist/index.js"]