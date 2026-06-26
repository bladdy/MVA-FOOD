# MVA-FOOD — Agent Guidance

## Project structure
- `api/` — .NET 8 Web API (3-project solution)
  - `MVA-FOOD.Core` — Entities, DTOs, Interfaces, Enums, Filters, Wrappers
  - `MVA-FOOD.Infrastructure` — EF Core DbContext, Migrations, Service implementations
  - `MVA-FOOD.API` — Controllers, Middleware, Seed, FtpStorageService, ContactService
- `client/` — Astro 6 SSR + React 18 + TailwindCSS 3

## Developer commands
- Frontend: `cd client && pnpm install && pnpm dev` (port 4321)
- Backend: `cd api && dotnet restore && dotnet run` (port 5000)
- Full stack (Docker): `docker-compose up --build`
- Lint: `cd client && pnpm lint`
- Build frontend: `cd client && pnpm run build` → `dist/server/entry.mjs`
- No test project exists yet

## Backend architecture
- **DB**: SQLite via EF Core. Auto-migrates on startup (`db.Database.Migrate()` in `Program.cs:160`).
  - Dev: `MVA-FOOD.API/MVA-FOOD.db`; Prod: `/data/MVA-FOOD.db` (Docker volume)
- **Auth**: JWT in HttpOnly cookie named `token`, auto-read via `OnMessageReceived` (`Program.cs:72`). CORS: `localhost:4321`, `127.0.0.1:4321`, `mr-menus.com`.
- **Images**: Upload via FTP to vsftpd container, auto-converted to WebP (quality 65, max 1280px).
- **Contact form**: Saved to Google Sheets via service account.
- **Seed**: Runs on startup — demo restaurant with users `AdminDemo`/`Admin123!` and `EmpleadoDemo`/`Empleado123!`.
- **Conventions**: Nullable disabled, ImplicitUsings enabled, Spanish identifiers. Route pattern `api/[controller]`.

## Frontend architecture
- **SSR**: `@astrojs/node` standalone adapter (Docker). Vercel adapter present but unused — only Docker deployment.
- **Path aliases** (in `astro.config.mjs`): `@/` → `src/`, `@components/`, `@assets/`, `@public/`, `@lib/`, `@layouts/`, `@consts/`, `@React/`, `@Api/`.
- **API URL**: `PUBLIC_API_URL` env var, fallback `https://api.mr-menus.com/api` (`src/lib/apiConfig.ts`).
- **Auth**: `credentials: "include"` for cookie JWT. Astro middleware (`src/middleware.ts`) guards `/admin/*`.
- **React components** in `src/React/` (not `src/components/` which is for Astro components). Admin components: `MenuManager`, `VariantesManager`, `RestauranteForm` in `src/React/Admin/`.

## Docker services
| Service | Port | Purpose |
|---------|------|---------|
| astro-ssr | 4321 | Frontend SSR |
| api | 5000 | .NET 8 API |
| ftp_server | 21, 21100-21110 | vsftpd for images |
| file_server | 9003 | nginx serving uploaded files |

Network: `mr_menus_network` (bridge). Volumes: `files_data`, `sqlite_data`.

## Style
- Spanish identifiers for entities, DTOs, comments
- Custom slug: lowercase, remove accents, spaces→hyphens (`SeedDb.GenerateSlug`)
- Formatter: Prettier with `prettier-plugin-astro` + `prettier-plugin-tailwindcss`
