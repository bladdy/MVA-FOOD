# MVA-FOOD 🍔🍟🥗

**MVA-FOOD** es una plataforma integral para restaurantes y food trucks que cubre toda la operación del local: menús digitales, toma de pedidos por mesa, tablero de cocina en tiempo real y facturación POS. El proyecto es una evolución de **Mr. Menús** (plataforma pública de menús), al que se le añadieron los módulos operativos y de administración.

## 🚀 Módulos implementados

### Panel de administración (`/admin/*`)

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/admin/dashboard` | KPIs, resumen del día y ventas |
| Platos | `/admin/menus/platos` | CRUD de platos con imágenes (conversión automática a WebP) y variantes |
| Variantes | `/admin/menus/variantes` | Grupos de opciones con precio adicional, selección simple o múltiple |
| Combos | `/admin/combos` | Paquetes de varios productos en una sola venta |
| Órdenes | `/admin/ordenes/ordenes` | Gestión de órdenes en tiempo real |
| Historial | `/admin/ordenes/historial` | Historial de órdenes con filtros y búsqueda |
| Punto de venta | `/admin/facturacion/ventas` | POS con venta rápida o desde pedido, métodos de pago e impuesto |
| Reporte de ventas | `/admin/facturacion/reporte` | Ventas por día, semana o mes, desglosadas por método de pago |
| Facturas | `/admin/facturacion/facturas` | Listado, detalle, impresión en ticket 80mm y anulación |
| Suscripción | `/admin/facturacion` | Planes, pagos e historial de facturación del servicio |
| Mesero | `/admin/mesero` | Toma de pedidos por mesa, **cuenta de mesa acumulada** y cierre con factura |
| Cocina | `/admin/cocina` | Tablero de órdenes en tiempo real (pendiente → en proceso → listo → entregado) |
| Mesas | `/admin/mesas` | CRUD de mesas, estado ocupada/libre y liberación |
| Configuración | `/admin/configuracion` | Perfil, tipos de entrega, métodos de pago y generador de QR |

### Menús públicos
Menús digitales por restaurante con slug (ej. `/menus/terraza-47`) y QR que apunta al menú de cada local.

## 🛠️ Tecnologías utilizadas

- **Backend**: .NET 8 Web API (solución de 3 proyectos: Core, Infrastructure, API)
- **Base de datos**: SQLite con EF Core (auto-migración al iniciar)
- **Frontend**: Astro (SSR) + React 18 + TailwindCSS 3
- **Realtime**: SignalR (`/hubs/orders`) para notificaciones de pedidos entre mesero y cocina
- **Autenticación**: JWT en cookie HttpOnly
- **Imágenes**: Subida por FTP (vsftpd), conversión automática a WebP (calidad 65, máx. 1280px)
- **Despliegue**: Docker Compose (astro-ssr, api, ftp_server, file_server)

## 🧩 Backend (API REST `api/[controller]`)

- `Auth` — registro e inicio de sesión con JWT
- `Restaurantes`, `Menu`, `Categoria`, `Variante`, `Combo`, `Empleado`
- `Mesa`, `Pedido`, `CuentaMesa` — servicio y gestión de mesas
- `FacturaVenta` — facturación POS, reportes y anulación
- `MetodoPago`, `TipoEntrega`, `Pago`, `Plan` — configuración y suscripciones
- `Contact`, `Amenidades`, `Horario`, `Factura`

## 📦 Instalación local

### Requisitos
- Node.js + pnpm
- .NET 8 SDK
- Docker + Docker Compose (opcional)

### Frontend
```bash
cd client
pnpm install
pnpm dev
```

### Backend
```bash
cd api
dotnet restore
dotnet run
```

### Con Docker (full stack)
```bash
docker-compose up --build
```

Al iniciar, el backend crea la base de datos y ejecuta un **seed** con un restaurante demo:
- `AdminDemo` / `Admin123!`
- `EmpleadoDemo` / `Empleado123!`

## 📡 Servicios (Docker)

| Servicio | Ruta | Puerto |
|----------|------|--------|
| astro-ssr | http://localhost:4321 | `4321` |
| api | http://localhost:5000 | `5000` |
| file_server | http://localhost:9003 | `9003` |
| ftp_server | ftp://localhost:21 | `21`, `21100-21110` |

## 📁 Estructura del Proyecto

```
MVA-FOOD/
├── api/                 # Backend .NET 8 Web API
│   ├── MVA-FOOD.Core/          # Entidades, DTOs, Interfaces, Enums
│   ├── MVA-FOOD.Infrastructure/ # DbContext, Migraciones, Servicios
│   └── MVA-FOOD.API/           # Controllers, Middleware, Seed, Hub
├── client/              # Frontend Astro + React + Tailwind
│   └── src/
│       ├── React/Admin/        # Componentes de los módulos admin
│       └── pages/admin/        # Rutas del panel
├── docker-compose.yml
├── README.md
└── AGENTS.md            # Guía técnica para agentes/desarrollo
```

## 🤝 Contribuciones

¡Se aceptan ideas, reportes de bugs y sugerencias para mejorar! Próximamente se habilitarán issues y pull requests con una guía de contribución.

## 📄 Licencia

Proyecto de código cerrado para uso específico.

---

Desarrollado con ❤️ por el equipo MVA.

## Referencias
- https://www.maspedidos.menu/ejemplo/ejemplo
- https://meniuapp.com/en-US/
