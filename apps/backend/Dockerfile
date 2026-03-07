# ---------- base ----------
FROM node:20-slim AS base
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# ⚠️ --ignore-scripts evita que postinstall corra build:shared sin tener los fuentes
RUN npm ci --ignore-scripts

# ---------- build ----------
FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Ahora sí buildear shared (con los fuentes presentes)
RUN npm run build -w packages/shared

WORKDIR /app/apps/backend
RUN npm run build

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json

# ⚠️ Copiar node_modules local del workspace (donde vive better-auth)
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

WORKDIR /app/apps/backend
EXPOSE 5000
CMD ["node", "dist/index.js"]