FROM node:20-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:${PATH}"
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json
RUN pnpm install --frozen-lockfile

COPY apps/frontend apps/frontend
COPY packages/shared/src packages/shared/src

ARG NEXT_PUBLIC_API_URL=https://backend.kodeye.net/api
ARG NEXT_PUBLIC_APP_URL=https://app.kodeye.net
ARG NEXT_PUBLIC_LANDING_URL=https://kodeye.net
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_LANDING_URL=${NEXT_PUBLIC_LANDING_URL}

RUN pnpm --filter @kodeye/shared build && pnpm --filter @kodeye/frontend build

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:${PATH}"
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/frontend ./apps/frontend
COPY --from=build /app/packages/shared ./packages/shared

RUN chown -R node:node /app/apps/frontend

USER node
EXPOSE 3000
CMD ["pnpm", "--filter", "@kodeye/frontend", "start"]
