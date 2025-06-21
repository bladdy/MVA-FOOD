FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 4321

# ⬅️ Ejecuta tu archivo `entry.mjs`
CMD ["node", "dist/server/entry.mjs"]
