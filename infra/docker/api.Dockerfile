FROM node:20-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:${PATH}"
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/tsconfig.json apps/api/tsconfig.json
COPY apps/api/tsconfig.build.json apps/api/tsconfig.build.json
COPY apps/api/prisma apps/api/prisma
COPY packages/shared/package.json packages/shared/package.json
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json
RUN pnpm install --frozen-lockfile

COPY apps/api/src apps/api/src
COPY packages/shared/src packages/shared/src
RUN pnpm --filter @kodeye/api prisma:generate \
    && pnpm --filter @kodeye/shared build \
    && pnpm --filter @kodeye/api exec tsc -p tsconfig.build.json

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:${PATH}"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates chromium curl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@9.15.9 --activate

COPY --chown=node:node --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/api ./apps/api
COPY --chown=node:node --from=build /app/packages/shared ./packages/shared

RUN mkdir -p /app/storage/reports /app/storage/invoices \
    && chown -R node:node /app/storage

USER node
EXPOSE 3001
CMD ["pnpm", "--filter", "@kodeye/api", "start"]
