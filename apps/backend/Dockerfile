FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.32.1 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

FROM base AS development

COPY . .
RUN pnpm --filter @caninany/shared build \
  && pnpm --filter @caninany/backend prisma:generate

EXPOSE 3000
CMD ["pnpm", "--filter", "@caninany/backend", "dev"]

FROM base AS builder

COPY . .
RUN pnpm --filter @caninany/shared build \
  && pnpm --filter @caninany/backend build \
  && pnpm --filter @caninany/backend --prod deploy /prod/backend

FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
ENV UPLOADS_DIR=/app/uploads
WORKDIR /app

COPY --from=builder /prod/backend ./
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
