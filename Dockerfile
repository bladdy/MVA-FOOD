# ============================================================
# FRONTEND BUILD
# ============================================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/client

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY client/package.json .
COPY client/pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY client .

RUN pnpm build

RUN pnpm prune --prod


# ============================================================
# BACKEND BUILD
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /app/api

COPY api/MVA-FOOD.sln .

COPY api/MVA-FOOD.API/*.csproj MVA-FOOD.API/
COPY api/MVA-FOOD.Core/*.csproj MVA-FOOD.Core/
COPY api/MVA-FOOD.Infrastructure/*.csproj MVA-FOOD.Infrastructure/

RUN dotnet restore

COPY api .

RUN dotnet publish \
    MVA-FOOD.API/MVA-FOOD.API.csproj \
    -c Release \
    -o /publish \
    --no-restore


# ============================================================
# FINAL IMAGE
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    gettext \
    nodejs \
    vsftpd

WORKDIR /app

RUN mkdir -p /data \
    && chmod 777 /data

RUN mkdir -p /home/vsftpd/mrmenusftp \
    && adduser -D -h /home/vsftpd/mrmenusftp mrmenusftp \
    && echo "mrmenusftp:MrMenusFtp123!" | chpasswd \
    && chown mrmenusftp:mrmenusftp /home/vsftpd/mrmenusftp

RUN mkdir -p /data/uploads \
    && chown -R mrmenusftp:mrmenusftp /data/uploads

RUN mkdir -p /var/run/vsftpd/empty

COPY --from=backend-build /publish ./api

COPY --from=frontend-build /app/client/dist ./client
COPY --from=frontend-build /app/client/node_modules ./client/node_modules
COPY --from=frontend-build /app/client/package.json ./client/package.json

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
COPY vsftpd.conf /etc/vsftpd/vsftpd.conf
COPY entrypoint.sh /entrypoint.sh

RUN sed -i 's/\r$//' /entrypoint.sh \
 && chmod +x /entrypoint.sh

EXPOSE 80 21 21100-21110

ENTRYPOINT ["/entrypoint.sh"]