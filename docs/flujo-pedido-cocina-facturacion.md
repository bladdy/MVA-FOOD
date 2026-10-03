# Flujo Pedido → Cocina → CuentaMesa → FacturaVenta

> Rediseño del flujo operativo del restaurante (PRD #1–#40).

## Diagrama general

```
Mesero (MeseroApp)  ──enviarACocina──▶  POST /api/Pedido  (mesaId presente)
                                              │
                              ┌───────────────┘
                              ▼
                     CuentaMesa autoabierta  (Abierta, mesa → ocupada)
                              │
                              ▼
Cocina (CocinaApp)  ◀── SignalR NuevoPedido ──▶  POST /api/PedidoItem/{id}/estado
   (EnPreparacion 1 → Listo 2)                       │
                              ▼
Mesero/Admin  ──Entregado──▶  POST /api/Pedido/{id}/estado (3)
                              ▼
                GET /api/CuentaMesa/{id}/validar-cierre
                              │
                      PuedeCerrar=true
                              ▼
                POST /api/CuentaMesa/{mesaId}/cerrar
                              │
                  FacturaVenta (snapshot + número atómico)
```

## Estados

### `Estado` (pedido / PedidoItem)
| Valor | Nombre | Quién cambia |
|-------|--------|--------------|
| 0 | Pendiente | Alta |
| 1 | En preparación | Cocina (`UpdateItemEstadoAsync`) |
| 2 | Listo | Cocina (`UpdateItemEstadoAsync`) |
| 3 | Entregado | Mesero/Admin (`UpdateEstadoAsync`) |
| 4 | Cancelado | `CancelarAsync` (pedido completo) |

- El estado de un pedido es **derivado de sus items** (`RecalcularEstadoPedido`): si todos los items están Cancelados → Cancelado; si todo Entregado → Entregado; etc.
- `UpdateItemEstadoAsync` solo permite avanzar en orden para items normales (0→1→2→3); no permite regresar. Para combos hay reglas específicas (`EsCombo`).
- `UpdateEstadoAsync` (pedido entero) solo acepta 3 (Entregado) o 4 (Cancelado). Requiere rol `MarcarEntregado` (Admin/Empleado/Mesero).
- Cancelar pedido anula todos sus items aún no facturados (`CancelarAsync`).

### `EstadoCuentaMesa`
| Valor | Estado |
|-------|--------|
| 0 | Abierta |
| 1 | Cerrada |
| 2 | Cerrando |
| 3 | Cancelada |

## Cuenta de mesa

- Se **autoabre** cuando el mesero envía el primer pedido de mesa (`POST /api/Pedido` con `mesaId` exige autenticación; sin `mesaId`, el flujo público no la abre).
- Índice único **filtrado** `(MesaId)` donde `Estado = 0` ⇒ una sola cuenta abierta por mesa.
- `POST /api/CuentaMesa/{mesaId}/cerrar` hace **CAS** (compare-and-swap): `UPDATE ... SET Estado=2 WHERE Id=@id AND Estado=0`; si `rows=0` devuelve `CUENTA_YA_CERRADA` con el `facturaVentaId` ya existente (idempotente). Al fallar una validación de negocio revierte a `Abierta` dentro de una transacción.

## Cierre y FacturaVenta

- `GET /api/CuentaMesa/{id}/validar-cierre` → `ValidarCierreResponseDto`:
  - `PuedeCerrar=false` + `code=PEDIDOS_PENDIENTES` y la lista de pedidos/items en curso para que el mesero decida.
  - `PuedeCerrar=true` + `PedidosFacturables` + `Total`.
- `CerrarAsync` factura **solo los items en estado Entregado** (los Cancelado se excluyen del total y del snapshot).
- **Snapshot histórico**: `FacturaVentaItem` guarda `Nombre` (del `Menu`/`Combo` al momento de facturar), `Precio`, `Cantidad`, `Opciones`, `ProductoId = MenuId`, `Notas`, `EsCombo`/`ComboNombre`/`ComboItemsJson`. Puntos de precio no son acumulables (unidades = items, no cantidades parciales).
- **Número atómico**: `SecuenciaFactura` en `Restaurante` = *próximo* número. `ReservarSiguienteNumeroAsync` incrementa en BD (escritor único SQLite) y emite `secuencia - 1`, p. ej. valor inicial 1 → `F-00001`, luego `F-00002`… Índice único `(RestauranteId, NumeroFactura)` como red de seguridad.
- Impuesto: `ImpuestoIncluido && PorcentajeImpuesto>0` → impuesto extraído del total; si no, se suma al subtotal.
- Al cerrar se asigna `Pedido.FacturaVentaId`, la cuenta queda `Cerrada` y la mesa vuelve a `EstaOcupada=false` (liberar opcional).

## Realtime (SignalR)

`OrderHub` (`/hubs/orders`): `JoinRestaurantGroup(restauranteId)` (validado contra el claim `restauranteId`). Eventos `NuevoPedido` y `EstadoPedidoActualizado` en grupo `restaurant_{id}`. Cocina y Mesero se suscriben; la cocina ignora pedidos/items con estado 3/4.

## Seguridad / roles

| Endpoint | Rol |
|----------|-----|
| `POST /api/Pedido` | `AllowAnonymous` (si trae `mesaId` exige autenticación) |
| `PUT /api/PedidoItem/{id}/estado` | `CocinaWorkflow` (Admin, Empleado, Cocina) |
| `PUT /api/Pedido/{id}/estado` | `MarcarEntregado` (Admin, Empleado, Mesero) |
| `POST /api/Pedido/{id}/cancelar` | `GestionarPedidos` (Admin, Empleado) |
| `CuentaMesa*` | `GestionarCuentas` (Admin, Empleado, Mesero) |

## Limitaciones conocidas

- `PedidoItem.Estado` es **por fila/unidad**, no por cantidad parcial dentro de un mismo ítem. Para fraccionar se requiere separar la fila.
- `VentaRapida` (facturación directa sin mesa) no se modificó; sigue usando el flujo clásico de creación de factura.
- La auditoría de quién realizó cada transición solo está documentada; no se persiste aún (pendiente de trazabilidad completa).
- El número de factura es simultáneo-concurrente correcto, pero no existe reapertura de cuentas cerradas.

## Cómo probar

- **Tests backend**: `cd api && dotnet test` — cobertura del flujo en `api/MVA-FOOD.Tests/FlujoCuentaMesaTests.cs` (Base SQLite in-memory, `TestDb.cs`).
- **Manual frontend**: levantar API (`dotnet run` puerto 5000) y `pnpm dev` (puerto 4321). Usuarios demo: `AdminDemo`/`Admin123!`, `EmpleadoDemo`/`Empleado123!`.