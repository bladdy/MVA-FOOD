FROM node:22-alpine3.22

WORKDIR /app
# Copiar los archivos de configuración de tu proyecto
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm (opcional, si usas npm usa RUN npm install)
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Exponer el puerto que configuraste en astro.config (4321)
EXPOSE 4321

# Ejecutar el servidor Node generado por Astro
CMD ["node", "dist/server/entry.mjs"]