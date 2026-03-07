FROM node:20-slim AS base
WORKDIR /app

# Install deps once using monorepo lockfile
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci
RUN npm run build:shared

FROM deps AS build
WORKDIR /app/apps/backend
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need for runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=build /app/apps/backend/dist ./dist
COPY apps/backend/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/index.js"]

