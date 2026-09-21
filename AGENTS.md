# MVA-FOOD — Agent Guidance

## Project structure
- `api/` — .NET 8 Web API (3-project solution)
  - `MVA-FOOD.Core` — Entities, DTOs, Interfaces, Enums, Filters, Wrappers
  - `MVA-FOOD.Infrastructure` — EF Core DbContext, Migrations, Service implementations
  - `MVA-FOOD.API` — Controllers, Middleware, Seed, FtpStorageService, ContactService, Hubs
- `client/` — Astro 6 SSR + React 18 + TailwindCSS 3

## Developer commands
- Frontend: `cd client && pnpm install && pnpm dev` (port 4321)
- Backend: `cd api && dotnet restore && dotnet run` (port 5000)
- Full stack (Docker): `docker-compose up --build`
- Lint: `cd client && pnpm lint` — NOTE: `eslint --ext .astro .` also scans `dist/`, so it may report pre-existing errors there; run `pnpm exec eslint <file>` to check individual files.
- Build frontend: `cd client && pnpm run build` → `dist/server/entry.mjs`
- No test project exists yet

## Modules (panel `/admin/*`)
| Módulo | Ruta | Key files |
|--------|------|-----------|
| Dashboard | `/admin/dashboard` | `src/React/Admin/DashboardMain.tsx` |
| Platos | `/admin/menus/platos` | `MenuManager.tsx`, `MenuModal.tsx`, `MenuTable.tsx` |
| Variantes | `/admin/menus/variantes` | `VariantesManager.tsx`, `VariantesModal.tsx` |
| Combos | `/admin/combos` | `ComboManager.tsx`, `ComboModal.tsx` |
| Órdenes | `/admin/ordenes/ordenes` | `OrdenesManager.tsx` |
| Historial | `/admin/ordenes/historial` | `OrdenesHistorial.tsx` |
| Punto de venta | `/admin/facturacion/ventas` | `PuntoDeVenta.tsx`, `VentaRapida.tsx`, `FacturaModal.tsx` |
| Reporte | `/admin/facturacion/reporte` | `ReporteVentas.tsx` |
| Facturas | `/admin/facturacion/facturas` | `FacturasManager.tsx`, `FacturaReceipt.tsx`, `InvoiceViewer.tsx` |
| Suscripción | `/admin/facturacion*` | `BillingDashboard.tsx`, `PlanSelector.tsx`, `PaymentHistory.tsx` |
| Mesero | `/admin/mesero` | `MeseroApp.tsx` + `src/React/Admin/Mesero/*` |
| Cocina | `/admin/cocina` | `CocinaApp.tsx` |
| Mesas | `/admin/mesas` | `MesaManager.tsx` |
| Configuración | `/admin/configuracion/*` | `RestauranteForm.tsx`, `MetodoPagoManager.tsx`, `TipoEntregaManager.tsx`, `QRGeneratorForm.tsx` |

## Backend architecture
- **DB**: SQLite via EF Core. Auto-migrates on startup (`db.Database.Migrate()` in `Program.cs:160`).
  - Dev: `MVA-FOOD.API/MVA-FOOD.db`; Prod: `/data/MVA-FOOD.db` (Docker volume)
- **Auth**: JWT in HttpOnly cookie named `token`, auto-read via `OnMessageReceived` (`Program.cs:72`). CORS: `localhost:4321`, `127.0.0.1:4321`, `mr-menus.com`. Controllers read `restauranteId` claim for tenant scoping.
- **Realtime**: SignalR hub `OrderHub` at `/hubs/orders` (`OrderHub.cs`). Methods: `JoinRestaurantGroup(restauranteId)`, `LeaveRestaurantGroup`. Clients subscribe to `NuevoPedido` and `EstadoPedidoActualizado` (group `restaurant_{id}`). Client URL: `HUB_URL` (`src/lib/apiConfig.ts`).
- **Facturación**: `FacturaVentaService` consolidates one or more `Pedido`s into a `FacturaVenta` (items, impuesto configurable incluido/no, ticket 80mm via `FacturaReceipt.tsx`, anulación). `Pedido.FacturaVentaId` marks billed orders.
- **Cuenta de mesa**: `CuentaMesa` entity (abierta/cerrada) accumulates a mesa's unbilled `Pedido`s (`CuentaMesaId` on `Pedido`). `CuentaMesaService.CerrarAsync` builds one invoice from all pending pedidos; auto-opened when the waiter sends the first order (`MeseroApp.enviarACocina`). Endpoints in `CuentaMesaController`.
- **Images**: Upload via FTP to vsftpd container, auto-converted to WebP (quality 65, max 1280px).
- **Contact form**: Saved to Google Sheets via service account.
- **Seed**: Runs on startup — demo restaurant with users `AdminDemo`/`Admin123!` and `EmpleadoDemo`/`Empleado123!`.
- **Conventions**: Nullable disabled, ImplicitUsings enabled, Spanish identifiers. Route pattern `api/[controller]`.

## Frontend architecture
- **SSR**: `@astrojs/node` standalone adapter (Docker). Vercel adapter present but unused — only Docker deployment.
- **Path aliases** (in `astro.config.mjs`): `@/` → `src/`, `@components/`, `@assets/`, `@public/`, `@lib/`, `@layouts/`, `@consts/`, `@React/`, `@Api/`.
- **API URL**: `PUBLIC_API_URL` env var, fallback `https://api.mr-menus.com/api` (`src/lib/apiConfig.ts`).
- **Auth**: `credentials: "include"` for cookie JWT. Astro middleware (`src/middleware.ts`) guards `/admin/*` and redirects `/login` when already authenticated.
- **React components** in `src/React/` (not `src/components/` which is for Astro components). Services in `src/Services/`, types in `src/Types/Restaurante.ts`.
- **Mesero flow**: `MeseroApp.tsx` manages a cart per mesa, sends orders to kitchen, auto-opens the mesa account, and closes it via `ModalCerrarCuenta.tsx` → `CuentaMesaService` → invoice shown in `ModalCuentaCerrada.tsx` (with `FacturaReceipt`), then liberate or keep ordering.

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
