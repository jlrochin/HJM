# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies with pnpm
FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build TypeScript (and generate Prisma client)
FROM base AS builder
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client at build-time (no DB connection required)
RUN npx prisma generate || true
# Compile TypeScript to dist if tsconfig.json exists
RUN if [ -f tsconfig.json ]; then npx tsc -p tsconfig.json; else echo "No tsconfig.json found, skipping tsc"; fi

# Runtime image
FROM base AS runner
USER node
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma
COPY --from=builder --chown=node:node /app/dist ./dist
EXPOSE 3000
# Run Prisma migrations then start the app
CMD sh -c "npx prisma migrate deploy && node dist/index.js"


