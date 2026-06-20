ARG GITLEAKS_VERSION=8.24.3
ARG CODEQL_VERSION=2.20.3
ARG TRIVY_VERSION=0.58.2

FROM aquasec/trivy:${TRIVY_VERSION} AS trivy

FROM node:20-bookworm-slim

ARG GITLEAKS_VERSION
ARG CODEQL_VERSION

ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:/opt/semgrep/bin:/opt/codeql:${PATH}"

COPY --from=trivy /usr/local/bin/trivy /usr/local/bin/trivy

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git openssl python3 python3-pip python3-venv unzip \
    && python3 -m venv /opt/semgrep \
    && /opt/semgrep/bin/pip install --no-cache-dir semgrep \
    && curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" -o /tmp/gitleaks.tar.gz \
    && tar -xzf /tmp/gitleaks.tar.gz -C /usr/local/bin gitleaks \
    && curl -fsSL "https://github.com/github/codeql-cli-binaries/releases/download/v${CODEQL_VERSION}/codeql-linux64.zip" -o /tmp/codeql.zip \
    && unzip -q /tmp/codeql.zip -d /opt \
    && rm -rf /var/lib/apt/lists/* /tmp/*.tar.gz /tmp/*.zip \
    && corepack enable \
    && corepack prepare pnpm@9.15.9 --activate \
    && semgrep --version \
    && codeql version \
    && gitleaks version \
    && trivy --version \
    && git --version

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
COPY apps/worker/package.json apps/worker/package.json
COPY apps/worker/tsconfig.json apps/worker/tsconfig.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json

RUN pnpm install --frozen-lockfile

COPY apps/worker/src apps/worker/src
COPY packages/shared/src packages/shared/src

RUN pnpm --filter @kodeye/api prisma:generate \
    && pnpm --filter @kodeye/shared build \
    && pnpm --filter @kodeye/worker build \
    && mkdir -p /tmp/kodeye/scans \
    && chown -R node:node /tmp/kodeye

USER node

ENV SCAN_WORKER_TEMP_DIR="/tmp/kodeye/scans"

CMD ["pnpm", "--filter", "@kodeye/worker", "start"]
