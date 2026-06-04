FROM node:22-alpine3.22

WORKDIR /app

COPY package.json ./

RUN corepack enable

RUN pnpm config set dangerouslyAllowAllBuilds true

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]