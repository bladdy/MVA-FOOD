# Flujo de cobro: mesero envía a caja → caja imprime y cobra → caja marca pagada

## Objetivo

Hoy "cerrar cuenta" **es** el pago: el mesero cobra en mano, marca el método, la factura nace `Emitida` y se imprime en su pantalla. Este plan parte ese flujo en dos actos separados por el rol de caja.

**Flujo nuevo**

1. El mesero cierra la cuenta → se crea la factura en `PendienteCobro`, **no se imprime nada**, la mesa se libera y el mesero vuelve al grid.
2. Caja ve la factura en su cola (`/admin/facturacion/facturas`, filtro "Por cobrar"), la **imprime**, se la lleva al cliente y recibe el pago.
3. Caja marca la factura como pagada, registrando **monto recibido**, **cambio** y el **método de pago real**.
4. La factura pasa a `Pagada` y recién entonces cuenta como ingreso.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Estados | `Emitida=0` (venta directa de mostrador, ya cobrada), `Anulada=1`, **`PendienteCobro=2`**, **`Pagada=3`** |
| Quién cobra | `Roles.Caja = Admin,Empleado`. Sin rol nuevo, sin schema, sin reseed |
| UI de caja | Pestaña/filtro dentro de `FacturasManager` (ruta existente) |
| Datos del cobro | Caja registra monto recibido + cambio + confirma método de pago |
| Mesa | Se libera automáticamente al enviar a caja (dentro de la misma transacción) |

**Ingresos = `Emitida` + `Pagada`.** `PendienteCobro` se reporta aparte como "por cobrar".

---

## Fase 1 — Core: dominio y DTOs

**`api/MVA-FOOD.Core/Entities/FacturaVenta.cs`**
- Agregar al enum (líneas 3-7) sin renumerar los existentes (SQLite los guarda como INTEGER):
  ```csharp
  public enum EstadoFacturaVenta
  {
      Emitida = 0,        // venta directa en mostrador: cobrada al momento
      Anulada = 1,
      PendienteCobro = 2, // enviada por el mesero, caja aún no ha cobrado
      Pagada = 3          // caja cobró y confirmó el pago
  }
  ```
- Agregar propiedades (líneas 33-38):
  ```csharp
  public DateTime? FechaPago { get; set; }
  public decimal? MontoRecibido { get; set; }
  public decimal? Cambio { get; set; }
  public Guid? UsuarioCajaId { get; set; }
  public string? UsuarioCajaNombre { get; set; }
  ```
- Helper de dominio (mismo archivo, o `Core/Extensions/EstadoFacturaVentaExtensions.cs`):
  ```csharp
  public static bool EstaCobrada(this EstadoFacturaVenta e)
      => e == EstadoFacturaVenta.Emitida || e == EstadoFacturaVenta.Pagada;
  ```
  Solo se usará **en memoria** (después del `ToListAsync()`); los filtros en SQL usarán la forma explícita.

**`api/MVA-FOOD.Core/Enums/Roles.cs`** — nueva constante (junto a `CuentasYFacturas`, línea 24):
```csharp
/// <summary>Caja: imprime cuentas pendientes de cobro y confirma el pago.</summary>
public const string Caja = Admin + "," + Empleado;
```

**`api/MVA-FOOD.Core/ErrorCodes.cs`** — agregar `MONTO_INSUFICIENTE`. Reutilizar `TRANSICION_NO_PERMITIDA` y `FACTURA_NO_ENCONTRADA`, que ya existen y no se usan.

**`api/MVA-FOOD.Core/DTOs/FacturaVentaDtos.cs`**
- `FacturaVentaDto`: `DateTime? FechaPago`, `string? UsuarioCajaNombre`
- `FacturaVentaDetalleDto`: `decimal? MontoRecibido`, `decimal? Cambio`
- `CrearFacturaVentaDto`: `decimal? MontoRecibido` (opcional; usado solo si la factura nace `Pagada`)
- Nueva `PagarFacturaVentaDto { string? MetodoPago; decimal? MontoRecibido; }`
- `ResumenFacturacionHoyDto`: `int CantidadPorCobrar`, `decimal MontoPorCobrar`
- `ReporteVentasDto`: `int CantidadPorCobrar`, `decimal MontoPorCobrar`

---

## Fase 2 — Infrastructure: `FacturaVentaService`

**`api/MVA-FOOD.Infrastructure/Services/FacturaVentaService.cs`**

1. **`CrearDesdePedidoAsync` (línea 116)** — nueva firma:
   ```csharp
   Task<FacturaVentaDetalleDto?> CrearDesdePedidoAsync(
       Guid restauranteId, CrearFacturaVentaDto dto,
       EstadoFacturaVenta estadoInicial = EstadoFacturaVenta.Emitida,
       Guid? usuarioCajaId = null, string? usuarioCajaNombre = null);
   ```
   Después de calcular totales (líneas 183-186), si `estadoInicial == Pagada` estampar `FechaPago = UtcNow`, `MontoRecibido = dto.MontoRecibido ?? Total`, `Cambio`, `UsuarioCajaId/Nombre`. Actualizar el `FacturaVenta` literals (líneas 188-211) para setear `Estado = estadoInicial`.

2. **Guardas antifactura doble** — reemplazar el `f.Estado == Emitida` por `f.Estado != Anulada` en:
   - línea 58 (`GetPedidosFacturablesAsync`)
   - líneas 155-158 (`CrearDesdePedidoAsync`)
   Sin esto, una factura `PendienteCobro` o `Pagada` no bloquearía un nuevo cierre de los mismos pedidos.

3. **Nuevo `MarcarPagadaAsync(Guid id, PagarFacturaVentaDto dto, Guid usuarioId, string usuarioNombre)`**
   ```
   factura = await FacturasVentas.FindAsync(id);              // null -> null
   if (Estado == Anulada) -> BusinessException(TRANSICION_NO_PERMITIDA, "La factura está anulada")
   if (Estado == Pagada)  -> return GetByIdAsync(id)           // idempotente
   if (Estado != PendienteCobro) -> BusinessException(TRANSICION_NO_PERMITIDA, "...")
   total = factura.TotalConPropina
   recibido = dto.MontoRecibido ?? total
   if (recibido < total) -> BusinessException(MONTO_INSUFICIENTE, "El monto recibido es menor al total")
   factura.Estado = Pagada
   factura.MetodoPago = dto.MetodoPago ?? factura.MetodoPago
   factura.MontoRecibido = recibido
   factura.Cambio = Math.Round(Math.Max(0, recibido - total), 2)
   factura.FechaPago = DateTime.UtcNow
   factura.UsuarioCajaId = usuarioId; factura.UsuarioCajaNombre = usuarioNombre
   SaveChanges
   return await GetByIdAsync(factura.Id);
   ```

4. **`AnularAsync` (línea 300)** — bloquear anulación de facturas cobradas:
   ```csharp
   if (factura.Estado == EstadoFacturaVenta.Anulada) return false;
   if (factura.Estado == EstadoFacturaVenta.Pagada)
       throw new BusinessException(ErrorCodes.TRANSICION_NO_PERMITIDA,
           "No se puede anular una factura pagada");
   ```
   `PendienteCobro` **sí** se puede anular (el dinero no entró) y sigue liberando los pedidos (líneas 305-307).

5. **`GetResumenHoyAsync` (línea 317)** — reemplazar `emitidas` (línea 328) por:
   ```csharp
   var cobradas  = facturas.Where(f => f.Estado.EstaCobrada()).ToList();       // Emitida + Pagada
   var porCobrar = facturas.Where(f => f.Estado == EstadoFacturaVenta.PendienteCobro).ToList();
   ```
   `CantidadVentas`/`Ingresos` desde `cobradas`; nuevos `CantidadPorCobrar = porCobrar.Count`, `MontoPorCobrar = porCobrar.Sum(f => f.TotalConPropina)`.

6. **`GetReporteVentasAsync` (línea 344)** — misma partición en línea 362. `Ingresos`, `Impuestos`, `TicketPromedio`, `VentasPorDia`, `VentasPorMetodoPago`, `TopProductos` se calculan **solo** desde `cobradas` (el ingreso real). Agregar `CantidadPorCobrar`/`MontoPorCobrar` desde `porCobrar`.

**`api/MVA-FOOD.Infrastructure/Services/PropinaService.cs`** — líneas 98 y 135 filtran `f.Estado == Emitida` **en SQL**. Ampliar a `f.Estado != EstadoFacturaVenta.Anulada`, para que la propina de facturas `PendienteCobro`/`Pagada` no se pierda en la liquidación.

---

## Fase 3 — Infrastructure: `CuentaMesaService`

**`api/MVA-FOOD.Infrastructure/Services/CuentaMesaService.cs` → `CerrarAsync` (línea 160)**
- Línea 212: pasar `EstadoFacturaVenta.PendienteCobro` a `CrearDesdePedidoAsync`. La factura nace esperando cobro; `CuentaMesa` queda `Cerrada` igual que hoy.
- **Dentro de la misma transacción**, antes del `CommitAsync` (línea 231), liberar la mesa (decisión tomada):
  ```csharp
  var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.Id == mesaId);
  if (mesa != null) mesa.EstaOcupada = false;
  ```
  Es seguro porque todos los pedidos ya quedaron con `FacturaVentaId`, así que `MesaService.LiberarAsync` (que solo desactiva pedidos sin facturar) no tiene nada que Invalidar.
- `CuentaMesa.MetodoPago` queda vacío: el método lo confirma caja, no el mesero.

---

## Fase 4 — API: controllers

**`api/MVA-FOOD.API/Controllers/FacturaVentaController.cs`**
- Inyectar `IHubContext<OrderHub>` (mismo patrón que `PedidoController.cs:20`).
- `CrearDesdePedido` (línea 85) y `CrearVentaRapida` (línea 112): agregar `[Authorize(Roles = Roles.Caja)]` y llamar con `EstadoFacturaVenta.Pagada` + `usuarioCajaId` del claim y `User.Identity.Name` (el cliente de mostrador paga en el acto). Quitar el `setTimeout(() => window.print(), 400)` del frontend.
- **Nuevo** `POST api/FacturaVenta/{id}/pagar` con `[Authorize(Roles = Roles.Caja)]`, body `PagarFacturaVentaDto`:
  - tenant check con `factura.RestauranteId`, luego `MarcarPagadaAsync(...)`
  - `200` con `FacturaVentaDetalleDto`, `404` si no existe, `Forbid` si es de otro restaurante
  - `400 { codigo, mensaje }` ante `BusinessException`
  - Emitir `await _hubContext.Clients.Group($"restaurant_{rid}").SendAsync("FacturaPagada", factura);`
- `GetByRestaurante` (línea 29): agregar `[FromQuery] EstadoFacturaVenta? estado` para que la cola de caja no filtre en el cliente sobre la lista completa.
- `Anular` (línea 134): envolver en `try/catch (BusinessException)` → `400 { codigo, mensaje }`.

**`api/MVA-FOOD.API/Controllers/CuentaMesaController.cs`**
- Inyectar `IHubContext<OrderHub>`.
- `Cerrar` (línea 67): tras `Success == true`, emitir el evento para que caja vea la cuenta al instante:
  ```csharp
  await _hubContext.Clients
      .Group($"restaurant_{cuenta.RestauranteId}")
      .SendAsync("FacturaPendienteCobro", new {
          facturaVentaId = cerrada.FacturaVentaId,
          numeroFactura, total, totalConPropina, moneda, mesa, clienteNombre });
  ```

**`api/MVA-FOOD.Infrastructure/Services/MesaService.cs`** — sin cambios.

---

## Fase 5 — Migración EF

Solo columnas nuevas (los enums ya son INTEGER), así que **no hay backfill de `Estado`**: las facturas `Emitida` históricas siguen significando "cobrada".

`dotnet ef migrations add AddPagoFacturaVenta --project MVA-FOOD.Infrastructure --startup-project MVA-FOOD.API`

Agrega a `FacturasVentas`: `FechaPago`, `MontoRecibido`, `Cambio`, `UsuarioCajaId`, `UsuarioCajaNombre`.
Revisar la migración generada y actualizar `AppDbContextModelSnapshot.cs` (carpeta `MVA-FOOD.Infrastructure/Migrations/`). No hace falta índice nuevo: el índice único `(RestauranteId, NumeroFactura)` cubre el prefijo `RestauranteId`.

---

## Fase 6 — Frontend: capa de datos

**`client/src/consts/estadosFactura.ts`** (nuevo) — evita el `if (estado === 0)` disperso:
```ts
export const ESTADO_FACTURA = {
  Emitida: 0, Anulada: 1, PendienteCobro: 2, Pagada: 3,
} as const;

export const ESTADO_FACTURA_META: Record<number, { label: string; badge: string; dot: string }> = {
  0: { label: "Cobrada",    badge: "bg-teal-100 text-teal-700",   dot: "bg-teal-500" },
  1: { label: "Anulada",    badge: "bg-red-100 text-red-700",     dot: "bg-red-500" },
  2: { label: "Por cobrar", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  3: { label: "Pagada",     badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
};

export const cuentaParaCobrar = (estado: number) => estado === 2;
export const estaCobrada = (estado: number) => estado === 0 || estado === 3;
```

**`client/src/Types/Restaurante.ts`**
- `FacturaVentaDto`: `fechaPago?: string | null; usuarioCajaNombre?: string | null;`
- `FacturaVentaDetalleDto`: `montoRecibido?: number | null; cambio?: number | null;`
- `ResumenFacturacionHoyDto` y `ReporteVentasDto`: `cantidadPorCobrar: number; montoPorCobrar: number;`
- Nueva `PagarFacturaVentaDto { metodoPago?: string; montoRecibido?: number }`

**`client/src/Services/facturaVentaService.ts`**
- `getByRestaurante(restauranteId, estado?)` → `GET /FacturaVenta/restaurante/{id}?estado={n}`
- Nueva `marcarPagada(id, dto)` → `POST /FacturaVenta/{id}/pagar` (mismo manejo de `json.error` que los demás POST)

---

## Fase 7 — Frontend: hook de SignalR compartido

Hoy la conexión está escrita a mano en `MeseroApp.tsx:139-173` y caja no tiene ninguna. Extraer **`client/src/hooks/useSignalR.ts`** (nuevo):
```ts
export function useSignalR(
  restauranteId: string | undefined,
  handlers: Record<string, (...args: any[]) => void>,
) { /* HubConnectionBuilder + withAutomaticReconnect + onreconnected → JoinRestaurantGroup
       + handlers en un ref para no reconectar + cleanup stop() */ }
```
Refactorizar `MeseroApp.tsx` para usarlo (el comportamiento no cambia) y usarlo en `FacturasManager.tsx`. Eventos nuevos: `FacturaPendienteCobro`, `FacturaPagada`.

---

## Fase 8 — Frontend: mesero (no imprime, envía a caja)

**`client/src/React/Admin/Mesero/ModalCerrarCuenta.tsx`**
- **Quitar el selector de método de pago** (líneas 31, 175-189) y su carga de `metodoPagoService` (líneas 40-49): el método lo confirma caja, no el mesero.
- Cambiar el label del botón (línea 223) a **"Enviar a caja"** y el texto de ayuda a "Caja imprimirá la cuenta y cobrará al cliente".

**`client/src/React/Admin/Mesero/ModalCuentaCerrada.tsx`** — pasa a ser confirmación de envío:
- **Quitar** `<FacturaReceipt factura={factura} showPrintButton={false} />` (línea 33): el mesero nunca ve el ticket.
- Mostrar check verde + `Cuenta enviada a caja`, `Factura {numeroFactura}`, `Mesa {n}`, total a cobrar, y el texto "Caja imprimirá la cuenta y te la llevará al cliente".
- **Un solo botón**: "Volver a mesas" (`onSeguir`). Quitar `Liberar mesa` / `onLiberar` y la prop `liberando` — la mesa ya se liberó en el backend.

**`client/src/React/Admin/MeseroApp.tsx`**
- `cerrarCuenta` (línea 462): tras el éxito, `setMensaje("Cuenta enviada a caja")` y **volver al grid de mesas** (`volverAMesas()` + `cargarMesas()`); quitar el paso de `liberarMesa` porque el backend ya liberó la mesa.
- `liberarMesa` (línea 394) queda solo para el caso "liberar sin cobrar"; deja de ser invocado desde `ModalCuentaCerrada`.
- Suscribir `FacturaPagada` al `refrescar` (línea 139-173 → hook).

**Borrar** `client/src/React/Admin/Mesero/ModalLiberarMesa.tsx` (código muerto, no importado en ningún lado).

---

## Fase 9 — Frontend: caja

**`client/src/React/Admin/Admin/ModalCobrarFactura.tsx`** → `client/src/React/Admin/ModalCobrarFactura.tsx` (nuevo)
Modal de cobro:
- Preview del `FacturaReceipt` (80mm) a la izquierda, sin botón imprimir propio.
- Derecha: total a cobrar, `select` **método de pago** desde `metodoPagoService.getAll(restauranteId)` filtrado por `activo`, input **monto recibido** (prellenado con el total), **cambio** calculado en vivo, y resumen de la factura (número, mesa, cliente, mesero, hora).
- Botones "Cancelar" / "Confirmar cobro".
- Accesible con teclado, foco atrapado en el modal, `role="dialog"` + `aria-modal`.

**`client/src/React/Admin/FacturasManager.tsx`**
- Suscribir `FacturaPendienteCobro` y `FacturaPagada` con el hook → `fetchFacturas()`.
- **Filtro de estado por defecto = `PendienteCobro` ("Por cobrar")**, para que la cola sea la vista de entrada. Opciones del `<select>` (líneas 118-129): `Por cobrar / Pagadas / Cobradas / Anuladas / Todas`.
- Card superior con el resumen de caja: `getResumenHoy` → **"Por cobrar hoy"** (`cantidadPorCobrar` + `montoPorCobrar`) junto a "Cobrado hoy" (`ingresos`).
- **Badge de estado con `ESTADO_FACTURA_META`** (reemplaza el ternario rojo/verde de líneas 181-189). Añadir una columna **"Cobro"** que muestre, para `Pagada`, `fechaPago` + `usuarioCajaNombre`, y para `PendienteCobro` el botón de acción.
- Acciones por fila (dentro del panel expandido, líneas 195-216):
  - `PendienteCobro`: **"Cobrar"** (abre `ModalCobrarFactura`, primario), **"Imprimir"** (abre el overlay de `FacturaReceipt` con `showPrintButton`), **"Anular"**.
  - `Pagada` / `Emitida`: **"Reimprimir"** + bloque de solo lectura con `montoRecibido`, `cambio`, `fechaPago`, `usuarioCajaNombre`.
  - `Anulada`: solo "Reimprimir".
- Mostrar las acciones de cobro solo si `user.permisos.includes("facturacion")` (defensa en profundidad; el backend ya exige `Roles.Caja`).
- `handleAnular` (línea 61): reemplazar `prompt()`/`confirm()` nativos por un modal propio, y mostrar el mensaje de error del backend (p. ej. "No se puede anular una factura pagada").

**`client/src/React/Admin/FacturaReceipt.tsx`**
- Mostrar el bloque de cobro cuando `estado === Pagada`: `RECIBIDO {montoRecibido}` / `CAMBIO {cambio}` / `Pago: {metodoPago}` / `Cobrado por {usuarioCajaNombre}`.
- Cuando `estado === PendienteCobro`, el encabezado pasa de "TICKET DE VENTA" a **"CUENTA POR COBRAR"**, para que el ticket que caja lleva al cliente diga claramente que falta pagar.

**`client/src/React/Admin/VentaRapida.tsx` / `FacturaModal.tsx`**
- Quitar el auto-`window.print()` (líneas 303 y 144). La impresión la dispara caja explícitamente con el botón "Imprimir".

---

## Fase 10 — Frontend: reportes y dashboard

**`client/src/React/Admin/ReporteVentas.tsx`**
- Banner ámbar junto al de anuladas (líneas 102-106): "N factura(s) por cobrar por {monto} en el período (no se incluyen en los ingresos)".

**`client/src/React/Admin/DashboardMain.tsx`**
- La card "Facturado Hoy" (líneas 171-177) ya usa `resumenHoy.ingresos`, que ahora significa dinero cobrado. Añadir línea secundaria: `N por cobrar · {montoPorCobrar}`, con enlace a `/admin/facturacion/facturas`.

---

## Fase 11 — Tests

**`api/MVA-FOOD.Tests/TestDb.cs`** — `CrearFacturaAsync` (líneas 191-206): cambiar el parámetro `bool anulada` por `EstadoFacturaVenta estado = EstadoFacturaVenta.Emitida`.

**Nuevo `api/MVA-FOOD.Tests/PagoFacturaVentaTests.cs`**
- `MarcarPagada_DesdePendienteCobro_RegistraCobro` — estado→`Pagada`, método, monto, cambio, `FechaPago`, `UsuarioCajaNombre`.
- `MarcarPagada_MontoInsuficiente_Rechaza` — `MONTO_INSUFICIENTE`.
- `MarcarPagada_MontoExacto_CambioCero`.
- `MarcarPagada_YaPagada_Idempotente`.
- `MarcarPagada_Anulada_Rechaza` — `TRANSICION_NO_PERMITIDA`.
- `MarcarPagada_Emitida_Rechaza` (ya cobrada en mostrador).
- `Anular_Pagada_Rechaza`.
- `Anular_PendienteCobro_LiberaPedidos`.
- `ResumenHoy_ExcluyePendienteCobroDeIngresos_YLoCuentaEnMontoPorCobrar`.
- `Reporte_IngresosSoloCobradas_PendienteCobroEnMontoPorCobrar`.

**`api/MVA-FOOD.Tests/FlujoCuentaMesaTests.cs`**
- `Cerrar_CreaFacturaPendienteCobro_Y_LiberaMesa`.
- `Cerrar_NoVuelveAFacturarLosMismosPedidos`.
- `Cerrar_EmitidoVisibleParaCaja_Y_PagadaSoloPorCaja`.

**`api/MVA-FOOD.Tests/PropinaTests.cs`**
- `ObtenerResumen_IncluyePropinaDeFacturasPendienteCobroYPagadas`.

---

## Orden de ejecución y verificación

```
1. Core      enum + propiedades + Roles.Caja + ErrorCodes + DTOs
2. Migration AddPagoFacturaVenta
3. Services  FacturaVentaService → PropinaService → CuentaMesaService
4. API       FacturaVentaController + CuentaMesaController (+ SignalR)
5. dotnet build && dotnet test        ← los 33 tests existentes deben seguir verdes
6. Frontend  consts + Types + services + useSignalR
7. Frontend  MeseroApp + ModalCerrarCuenta + ModalCuentaCerrada (+ borrar ModalLiberarMesa)
8. Frontend  FacturasManager + ModalCobrarFactura + FacturaReceipt + VentaRapida/FacturaModal
9. Frontend  ReporteVentas + DashboardMain
10. cd client && pnpm run build && pnpm lint
```

Comandos de verificación:
- `cd api && dotnet build && dotnet test` (baseline actual: **33/33 pasando**)
- `cd client && pnpm run build`
- `cd client && pnpm exec eslint src/React/Admin/FacturasManager.tsx src/React/Admin/MeseroApp.tsx src/React/Admin/ModalCobrarFactura.tsx src/hooks/useSignalR.ts src/consts/estadosFactura.ts`

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Olvidar un filtro por `Estado` y perder ingresos | Fase 2 lista los 6 sitios a tocar; los tests de resumen/reporte/propina los cubren |
| Doble facturación por no ampliar las guardas | Fase 2 punto 2 + test `Cerrar_NoVuelveAFacturarLosMismosPedidos` |
| Regresión en propinas | Fase 2 `PropinaService` + test dedicado |
| Fuga: un mesero puede leer todas las facturas del restaurante | Preexistente (`Roles.CuentasYFacturas` incluye Mesero). Los endpoints de escritura nuevos ya exigen `Roles.Caja`. Endurecer los de lectura queda fuera de alcance |
| Mesas que se liberan antes de tiempo | La liberación va dentro de la transacción de `CerrarAsync`; si la factura falla, la mesa sigue ocupada |
