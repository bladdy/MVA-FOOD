FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY client/package.json ./
COPY client/pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm install --no-frozen-lockfile

COPY client/ .

RUN pnpm run build