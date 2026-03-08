# ---------- base ----------
FROM node:20-slim AS base
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Instalar dependencias (--ignore-scripts evita que postinstall corra build:shared sin fuentes)
RUN npm ci --ignore-scripts

# ---------- build ----------
FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Buildear shared (con los fuentes presentes)
RUN npm run build -w packages/shared

WORKDIR /app/apps/backend
RUN npm run build

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar node_modules hoisted (contiene todas las dependencias del monorepo)
COPY --from=deps /app/node_modules ./node_modules

# Copiar el paquete shared compilado
COPY --from=build /app/packages/shared ./packages/shared

# Copiar el backend compilado
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json

# Copiar package.json raíz (necesario para que Node resuelva los workspaces)
COPY package.json ./package.json

WORKDIR /app/apps/backend
EXPOSE 5000
CMD ["node", "dist/index.js"]