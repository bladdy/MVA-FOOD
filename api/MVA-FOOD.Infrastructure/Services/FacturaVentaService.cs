using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class FacturaVentaService : IFacturaVentaService
    {
        private readonly AppDbContext _context;

        public FacturaVentaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<FacturaVentaDto>> GetByRestauranteAsync(Guid restauranteId, EstadoFacturaVenta? estado = null)
        {
            var query = _context.FacturasVentas
                .Include(f => f.Pedido)
                .Where(f => f.RestauranteId == restauranteId);

            if (estado.HasValue)
                query = query.Where(f => f.Estado == estado.Value);

            var facturas = await query
                .OrderByDescending(f => f.FechaEmision)
                .ToListAsync();

            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            return facturas.Select(f => MapToListDto(f, moneda)).ToList();
        }

        public async Task<FacturaVentaDetalleDto?> GetByIdAsync(Guid id)
        {
            var factura = await _context.FacturasVentas
                .Include(f => f.Items)
                .Include(f => f.Restaurante)
                .Include(f => f.Pedido)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (factura == null) return null;

            var moneda = MonedaHelper.PaisToMoneda(factura.Restaurante?.Pais ?? "DO");
            var pedidoIds = await _context.Pedidos
                .Where(p => p.FacturaVentaId == factura.Id)
                .Select(p => p.Id)
                .ToListAsync();
            return MapToDetalleDto(factura, moneda, pedidoIds);
        }

        public async Task<List<PedidoFacturableDto>> GetPedidosFacturablesAsync(Guid restauranteId)
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Where(p => p.RestauranteId == restauranteId)
                .Where(p => p.FacturaVentaId == null)
                // Una factura anulada libera los pedidos; cualquier otro estado los bloquea.
                .Where(p => !_context.FacturasVentas.Any(f => f.PedidoId == p.Id && f.Estado != EstadoFacturaVenta.Anulada))
                .OrderByDescending(p => p.Fecha)
                .ToListAsync();

            // Solo pedidos con todos sus items en estado final (Entregado/Cancelado)
            // y al menos un item entregado.
            pedidos = pedidos.Where(p => p.PuedeFacturarse).ToList();

            return pedidos.Select(p => new PedidoFacturableDto
            {
                Id = p.Id,
                ClienteNombre = p.ClienteNombre,
                ClienteTelefono = p.ClienteTelefono,
                TipoEntrega = p.TipoEntrega,
                MetodoPago = p.MetodoPago,
                Fecha = p.Fecha,
                Total = p.Total,
                Estado = (int)p.Estado,
                MesaId = p.MesaId,
                NumeroMesa = p.NumeroMesa,
                Items = p.Items.Select(i => new PedidoFacturableItemDto
                {
                    Nombre = i.EsCombo
                        ? i.ComboNombre ?? "Combo"
                        : i.Producto?.Nombre ?? i.ComboNombre ?? "Producto",
                    Cantidad = i.Cantidad,
                    Precio = i.Precio,
                    Notas = i.Notas,
                    Opciones = i.Opciones,
                    EsCombo = i.EsCombo,
                    ComboNombre = i.ComboNombre,
                    ComboItemsJson = i.ComboItemsJson
                }).ToList()
            }).ToList();
        }

        public async Task<ConfigFacturacionDto> ObtenerConfiguracionAsync(Guid restauranteId)
        {
            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            if (rest == null) throw new KeyNotFoundException("Restaurante no encontrado");

            var moneda = MonedaHelper.PaisToMoneda(rest.Pais);
            var siguiente = GenerarNumeroFactura(rest.PrefijoFactura, rest.SecuenciaFactura);

            return new ConfigFacturacionDto
            {
                PrefijoFactura = rest.PrefijoFactura,
                SecuenciaFactura = rest.SecuenciaFactura,
                PorcentajeImpuesto = rest.PorcentajeImpuesto,
                ImpuestoIncluido = rest.ImpuestoIncluido,
                PorcentajePropina = rest.PorcentajePropina,
                Moneda = moneda,
                NumeroFiscal = rest.NumeroFiscal,
                MensajePieFactura = rest.MensajePieFactura,
                SiguienteNumero = siguiente
            };
        }

        public async Task<FacturaVentaDetalleDto?> CrearDesdePedidoAsync(
            Guid restauranteId,
            CrearFacturaVentaDto dto,
            EstadoFacturaVenta estadoInicial = EstadoFacturaVenta.Emitida,
            Guid? usuarioCajaId = null,
            string? usuarioCajaNombre = null)
        {
            var pedidoIds = dto.PedidosIds != null && dto.PedidosIds.Count > 0
                ? dto.PedidosIds
                : (dto.PedidoId.HasValue ? new List<Guid> { dto.PedidoId.Value } : null);

            if (pedidoIds == null || pedidoIds.Count == 0)
                throw new ArgumentException("PedidoId es requerido");

            var pedidos = await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Where(p => pedidoIds.Contains(p.Id))
                .OrderBy(p => p.Fecha)
                .ToListAsync();

            if (pedidos.Count != pedidoIds.Count)
                throw new InvalidOperationException("Uno o más pedidos no encontrados");

            if (pedidos.Any(p => p.RestauranteId != restauranteId))
                throw new UnauthorizedAccessException("Alguno de los pedidos no pertenece al restaurante");

            if (pedidos.Count > 1)
            {
                var mesaIds = pedidos.Select(p => p.MesaId).Distinct().ToList();
                if (mesaIds.Count != 1 || !mesaIds[0].HasValue)
                    throw new InvalidOperationException("Solo se pueden agrupar pedidos de la misma mesa");
            }

            foreach (var p in pedidos)
                ValidarItemsFacturables(p);

            var facturadosIds = await _context.Pedidos
                .Where(p => pedidoIds.Contains(p.Id) && p.FacturaVentaId != null)
                .Select(p => p.Id)
                .ToListAsync();
            if (facturadosIds.Count > 0)
                throw new BusinessException(ErrorCodes.PEDIDO_YA_FACTURADO, "Uno de los pedidos ya fue facturado");

            var existe = await _context.FacturasVentas.AnyAsync(f =>
                f.PedidoId != null && pedidoIds.Contains(f.PedidoId.Value) && f.Estado != EstadoFacturaVenta.Anulada);
            if (existe)
                throw new BusinessException(ErrorCodes.PEDIDO_YA_FACTURADO, "Uno de los pedidos ya tiene una factura emitida");

            var rest = await _context.Restaurantes.FindAsync(restauranteId)
                ?? throw new KeyNotFoundException("Restaurante no encontrado");

            // Snapshot solo de los items facturables (se omiten los cancelados).
            var items = pedidos
                .SelectMany(p => p.Items)
                .Where(i => i.Estado != Estado.Cancelado)
                .Select(i => new FacturaVentaItem
                {
                    ProductoId = i.MenuId,
                    Nombre = i.EsCombo
                        ? i.ComboNombre ?? "Combo"
                        : i.Producto?.Nombre ?? i.ComboNombre ?? "Producto",
                    Precio = i.Precio,
                    Cantidad = i.Cantidad,
                    Opciones = i.Opciones,
                    Notas = i.Notas,
                    EsCombo = i.EsCombo,
                    ComboNombre = i.ComboNombre,
                    ComboItemsJson = i.ComboItemsJson
                })
                .ToList();

            var pedidoPrincipal = pedidos[0];
            var tipoEntrega = string.IsNullOrWhiteSpace(dto.TipoEntrega) ? pedidoPrincipal.TipoEntrega : dto.TipoEntrega;
            var (subtotal, impuesto, total) = CalcularTotales(rest, items);
            var (porcentajePropina, propina, totalConPropina) = FacturacionHelper.CalcularPropina(rest, tipoEntrega, subtotal, total);

            var factura = new FacturaVenta
            {
                RestauranteId = restauranteId,
                PedidoId = pedidoPrincipal.Id,
                NumeroFactura = "",
                ClienteNombre = string.IsNullOrWhiteSpace(dto.ClienteNombre) ? pedidoPrincipal.ClienteNombre : dto.ClienteNombre,
                ClienteTelefono = string.IsNullOrWhiteSpace(dto.ClienteTelefono) ? pedidoPrincipal.ClienteTelefono : dto.ClienteTelefono,
                ClienteNumeroFiscal = dto.ClienteNumeroFiscal,
                TipoEntrega = tipoEntrega,
                MetodoPago = dto.MetodoPago ?? pedidoPrincipal.MetodoPago,
                Nota = dto.Nota,
                MeseroUsuarioId = pedidoPrincipal.MeseroUsuarioId,
                MeseroNombre = pedidoPrincipal.MeseroNombre,
                PorcentajePropina = porcentajePropina,
                Propina = propina,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                TotalConPropina = totalConPropina,
                PorcentajeImpuesto = rest.PorcentajeImpuesto,
                ImpuestoIncluido = rest.ImpuestoIncluido,
                Moneda = MonedaHelper.PaisToMoneda(rest.Pais),
                Estado = estadoInicial,
                Items = items
            };

            // Venta de mostrador: el cliente paga en el acto, así que la factura nace cobrada.
            if (estadoInicial.EstaCobrada())
                AplicarCobro(factura, dto.MetodoPago, dto.MontoRecibido, usuarioCajaId, usuarioCajaNombre);

            _context.FacturasVentas.Add(factura);
            foreach (var p in pedidos)
                p.FacturaVentaId = factura.Id;

            await GuardarFacturaConNumeroAsync(factura, rest);

            return await GetByIdAsync(factura.Id);
        }

        /// <summary>
        /// Valida que un pedido sea facturable a nivel de item: todos sus items deben
        /// estar en estado final (Entregado o Cancelado) y al menos uno Entregado.
        /// </summary>
        private static void ValidarItemsFacturables(Pedido pedido)
        {
            var pendientes = pedido.Items
                .Where(i => i.Estado == Estado.Pendiente || i.Estado == Estado.EnPreparacion || i.Estado == Estado.Listo)
                .ToList();

            if (pendientes.Any())
            {
                var pendientesDetalle = string.Join(", ", pendientes.Select(p => $"{p.Producto?.Nombre ?? p.ComboNombre ?? "Producto"} ({p.Cantidad}x)"));
                throw new BusinessException(
                    ErrorCodes.PEDIDOS_PENDIENTES,
                    $"El pedido de la mesa {pedido.NumeroMesa.ToString() ?? pedido.MesaId.ToString()} aún tiene items en curso: {pendientesDetalle}");
            }

            if (!pedido.Items.Any(i => i.Estado == Estado.Entregado))
                throw new BusinessException(ErrorCodes.PEDIDO_NO_FACTURABLE, "El pedido no tiene items entregados para facturar");
        }

        public async Task<FacturaVentaDetalleDto?> CrearVentaRapidaAsync(
            Guid restauranteId,
            CrearFacturaVentaDto dto,
            Guid? usuarioCajaId = null,
            string? usuarioCajaNombre = null)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                throw new InvalidOperationException("Debe agregar al menos un producto");

            var rest = await _context.Restaurantes.FindAsync(restauranteId)
                ?? throw new KeyNotFoundException("Restaurante no encontrado");

            var items = dto.Items.Where(i => i.Cantidad > 0).Select(i => new FacturaVentaItem
            {
                ProductoId = i.ProductoId,
                Nombre = i.Nombre,
                Precio = i.Precio,
                Cantidad = i.Cantidad,
                Opciones = i.Opciones,
                Notas = i.Notas,
                EsCombo = i.EsCombo,
                ComboNombre = i.ComboNombre,
                ComboItemsJson = i.ComboItemsJson
            }).ToList();

            if (items.Count == 0)
                throw new InvalidOperationException("Debe agregar al menos un producto");

            var (subtotal, impuesto, total) = CalcularTotales(rest, items);
            var (porcentajePropina, propina, totalConPropina) = FacturacionHelper.CalcularPropina(rest, dto.TipoEntrega, subtotal, total);

            var factura = new FacturaVenta
            {
                RestauranteId = restauranteId,
                PedidoId = null,
                NumeroFactura = "",
                ClienteNombre = dto.ClienteNombre,
                ClienteTelefono = dto.ClienteTelefono,
                ClienteNumeroFiscal = dto.ClienteNumeroFiscal,
                TipoEntrega = dto.TipoEntrega,
                MetodoPago = dto.MetodoPago,
                Nota = dto.Nota,
                PorcentajePropina = porcentajePropina,
                Propina = propina,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                TotalConPropina = totalConPropina,
                PorcentajeImpuesto = rest.PorcentajeImpuesto,
                ImpuestoIncluido = rest.ImpuestoIncluido,
                Moneda = MonedaHelper.PaisToMoneda(rest.Pais),
                Estado = EstadoFacturaVenta.Pagada,
                Items = items
            };

            // La venta rápida se genera en mostrador con el cliente pagando en el acto.
            AplicarCobro(factura, dto.MetodoPago, dto.MontoRecibido, usuarioCajaId, usuarioCajaNombre);

            _context.FacturasVentas.Add(factura);
            await GuardarFacturaConNumeroAsync(factura, rest);

            return await GetByIdAsync(factura.Id);
        }

        /// <summary>
        /// Sella el cobro de una factura: método de pago, monto recibido, cambio y quién cobró.
        /// Si no se indica monto recibido se asume el pago exacto del total (sin cambio).
        /// </summary>
        private static void AplicarCobro(
            FacturaVenta factura,
            string? metodoPago,
            decimal? montoRecibido,
            Guid? usuarioCajaId,
            string? usuarioCajaNombre)
        {
            factura.FechaPago = DateTime.UtcNow;
            factura.MontoRecibido = Math.Round(montoRecibido ?? factura.TotalConPropina, 2);
            factura.Cambio = Math.Round(Math.Max(0, factura.MontoRecibido.Value - factura.TotalConPropina), 2);
            factura.UsuarioCajaId = usuarioCajaId;
            factura.UsuarioCajaNombre = usuarioCajaNombre;
            if (!string.IsNullOrWhiteSpace(metodoPago))
                factura.MetodoPago = metodoPago.Trim();
        }

        public async Task<bool> AnularAsync(Guid id, string motivo)
        {
            var factura = await _context.FacturasVentas.FindAsync(id);
            if (factura == null || factura.Estado == EstadoFacturaVenta.Anulada) return false;

            // Una factura pagada tiene el dinero en caja: anularla exige otro flujo.
            // En cambio una PendienteCobro sí se puede anular, porque el dinero nunca entró.
            if (factura.Estado == EstadoFacturaVenta.Pagada)
                throw new BusinessException(
                    ErrorCodes.TRANSICION_NO_PERMITIDA,
                    "No se puede anular una factura pagada");

            var pedidos = await _context.Pedidos.Where(p => p.FacturaVentaId == id).ToListAsync();
            foreach (var p in pedidos)
                p.FacturaVentaId = null;

            factura.Estado = EstadoFacturaVenta.Anulada;
            factura.Nota = string.IsNullOrWhiteSpace(factura.Nota)
                ? $"Anulada: {motivo}"
                : $"{factura.Nota} | Anulada: {motivo}";
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Caja confirma el cobro de una factura que el mesero envió a cobrar. El monto
        /// recibido se persiste junto con el cambio y el usuario de caja, y la factura pasa
        /// a <see cref="EstadoFacturaVenta.Pagada"/>, momento en el que empieza a contar
        /// como ingreso.
        /// </summary>
        public async Task<FacturaVentaDetalleDto?> MarcarPagadaAsync(
            Guid id,
            PagarFacturaVentaDto dto,
            Guid usuarioCajaId,
            string? usuarioCajaNombre)
        {
            var factura = await _context.FacturasVentas.FindAsync(id);
            if (factura == null) return null;

            // Idempotente: reintentar el cobro de una factura ya pagada no la duplica.
            if (factura.Estado == EstadoFacturaVenta.Pagada)
                return await GetByIdAsync(factura.Id);

            if (!factura.Estado.EstaPendienteCobro())
                throw new BusinessException(
                    ErrorCodes.FACTURA_YA_COBRADA,
                    factura.Estado == EstadoFacturaVenta.Anulada
                        ? "La factura está anulada"
                        : "Esta factura ya fue cobrada");

            var recibido = Math.Round(dto.MontoRecibido ?? factura.TotalConPropina, 2);
            if (recibido < factura.TotalConPropina)
                throw new BusinessException(
                    ErrorCodes.MONTO_INSUFICIENTE,
                    $"El monto recibido ({recibido}) es menor al total ({factura.TotalConPropina})");

            factura.Estado = EstadoFacturaVenta.Pagada;
            AplicarCobro(factura, dto.MetodoPago, recibido, usuarioCajaId, usuarioCajaNombre);

            await _context.SaveChangesAsync();
            return await GetByIdAsync(factura.Id);
        }

        public async Task<ResumenFacturacionHoyDto> GetResumenHoyAsync(Guid restauranteId)
        {
            var hoy = DateTime.UtcNow.Date;
            var manana = hoy.AddDays(1);

            var facturas = await _context.FacturasVentas
                .Where(f => f.RestauranteId == restauranteId
                    && f.FechaEmision >= hoy
                    && f.FechaEmision < manana)
                .ToListAsync();

            var cobradas = facturas.Where(f => f.Estado.EstaCobrada()).ToList();
            var porCobrar = facturas.Where(f => f.Estado.EstaPendienteCobro()).ToList();

            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            return new ResumenFacturacionHoyDto
            {
                Desde = hoy,
                Hasta = manana,
                CantidadVentas = cobradas.Count,
                CantidadAnuladas = facturas.Count(f => f.Estado == EstadoFacturaVenta.Anulada),
                CantidadPorCobrar = porCobrar.Count,
                MontoPorCobrar = Math.Round(porCobrar.Sum(f => f.TotalConPropina), 2),
                Ingresos = cobradas.Sum(f => f.Total),
                Moneda = moneda
            };
        }

        public async Task<ReporteVentasDto> GetReporteVentasAsync(Guid restauranteId, RangoReporteVentas rango)
        {
            var ahora = DateTime.UtcNow;
            var hoy = ahora.Date;
            DateTime desde = rango switch
            {
                RangoReporteVentas.Semana => InicioSemana(hoy),
                RangoReporteVentas.Mes => new DateTime(hoy.Year, hoy.Month, 1),
                _ => hoy
            };

            var facturas = await _context.FacturasVentas
                .Include(f => f.Items)
                .Where(f => f.RestauranteId == restauranteId
                    && f.FechaEmision >= desde
                    && f.FechaEmision < ahora)
                .ToListAsync();

            // Los ingresos solo reconocen las facturas con dinero cobrado; las que el mesero envió
            // a caja se reportan aparte para que caja sepa cuánto falta por recoger.
            var cobradas = facturas.Where(f => f.Estado.EstaCobrada()).ToList();
            var anuladas = facturas.Where(f => f.Estado == EstadoFacturaVenta.Anulada).ToList();
            var porCobrar = facturas.Where(f => f.Estado.EstaPendienteCobro()).ToList();

            var ingresos = cobradas.Sum(f => f.Total);
            var impuestos = cobradas.Sum(f => f.Impuesto);
            var montoAnulado = anuladas.Sum(f => f.Total);
            var montoPorCobrar = porCobrar.Sum(f => f.TotalConPropina);

            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            var ventasPorDia = cobradas
                .GroupBy(f => f.FechaEmision.Date)
                .OrderBy(g => g.Key)
                .Select(g => new ReporteVentasPorDiaDto
                {
                    Fecha = g.Key.ToString("yyyy-MM-dd"),
                    Cantidad = g.Count(),
                    Total = g.Sum(f => f.Total)
                })
                .ToList();

            var ventasPorMetodo = cobradas
                .GroupBy(f => string.IsNullOrWhiteSpace(f.MetodoPago) ? "Sin método" : f.MetodoPago!)
                .OrderByDescending(g => g.Sum(f => f.Total))
                .Select(g => new ReporteVentasPorMetodoPagoDto
                {
                    MetodoPago = g.Key,
                    Cantidad = g.Count(),
                    Total = g.Sum(f => f.Total)
                })
                .ToList();

            var topProductos = cobradas
                .SelectMany(f => f.Items)
                .GroupBy(i => i.Nombre)
                .OrderByDescending(g => g.Sum(i => i.Precio * i.Cantidad))
                .Take(10)
                .Select(g => new ReporteVentasPorProductoDto
                {
                    Nombre = g.Key,
                    Cantidad = g.Sum(i => i.Cantidad),
                    Total = g.Sum(i => i.Precio * i.Cantidad)
                })
                .ToList();

            return new ReporteVentasDto
            {
                Desde = desde,
                Hasta = ahora,
                Rango = rango,
                Moneda = moneda,
                CantidadVentas = cobradas.Count,
                CantidadAnuladas = anuladas.Count,
                CantidadPorCobrar = porCobrar.Count,
                MontoPorCobrar = Math.Round(montoPorCobrar, 2),
                Ingresos = Math.Round(ingresos, 2),
                Impuestos = Math.Round(impuestos, 2),
                MontoAnulado = Math.Round(montoAnulado, 2),
                TicketPromedio = cobradas.Count > 0 ? Math.Round(ingresos / cobradas.Count, 2) : 0,
                VentasPorDia = ventasPorDia,
                VentasPorMetodoPago = ventasPorMetodo,
                TopProductos = topProductos
            };
        }

        private static DateTime InicioSemana(DateTime fecha)
        {
            var diff = ((int)fecha.DayOfWeek + 6) % 7;
            return fecha.AddDays(-diff).Date;
        }

        private static string GenerarNumeroFactura(string prefijo, int secuencia)
        {
            var p = string.IsNullOrWhiteSpace(prefijo) ? "F" : prefijo.Trim();
            return $"{p}-{secuencia:D5}";
        }

        private static (decimal subtotal, decimal impuesto, decimal total) CalcularTotales(Restaurante rest, List<FacturaVentaItem> items)
        {
            var subtotal = items.Sum(i => i.Precio * i.Cantidad);
            decimal impuesto;
            decimal total;

            if (rest.ImpuestoIncluido && rest.PorcentajeImpuesto > 0)
            {
                impuesto = Math.Round(subtotal - (subtotal / (1 + rest.PorcentajeImpuesto / 100m)), 2);
                total = subtotal;
            }
            else
            {
                impuesto = Math.Round(subtotal * rest.PorcentajeImpuesto / 100m, 2);
                total = subtotal + impuesto;
            }

            return (Math.Round(subtotal, 2), impuesto, total);
        }

        /// <summary>
        /// Reserva el siguiente número de factura de forma atómica (SQLite).
        /// <c>SecuenciaFactura</c> guarda siempre el PRÓXIMO número a emitir: se
        /// incrementa en la BD y se emite <c>secuencia - 1</c>, de modo que con el
        /// valor inicial 1 la primera factura es F-00001. SQLite serializa los
        /// escritores, por lo que dos asignaciones concurrentes nunca obtienen el
        /// mismo número. Si la llamada ocurre dentro de una transacción abierta, el
        /// UPDATE se ejecuta dentro de ella.
        /// </summary>
        private async Task<string> ReservarSiguienteNumeroAsync(Guid restauranteId, string prefijo)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Restaurantes SET SecuenciaFactura = SecuenciaFactura + 1 WHERE Id = {restauranteId}");

            var rest = await _context.Restaurantes.AsNoTracking().FirstOrDefaultAsync(r => r.Id == restauranteId)
                ?? throw new KeyNotFoundException("Restaurante no encontrado");

            return GenerarNumeroFactura(prefijo, rest.SecuenciaFactura - 1);
        }

        /// <summary>
        /// Asigna el número de factura (reserva atómica) y guarda. Ante una violación de
        /// unicidad (índice único RestauranteId+NumeroFactura):
        ///  - Si hay una transacción externa (cierre de cuenta), la deja que la maneje
        ///    (rollback + reintento del flujo completo), porque la transacción ya quedó
        ///    abortada en SQLite.
        ///  - En caso contrario reintenta con el siguiente número.
        /// Requiere que la factura ya esté agregada al contexto y con Items en gráfico.
        /// </summary>
        private async Task GuardarFacturaConNumeroAsync(FacturaVenta factura, Restaurante restaurante)
        {
            const int maxIntentos = 5;

            bool hayTransaccionExterna = _context.Database.CurrentTransaction != null;

            for (int intento = 1; intento <= maxIntentos; intento++)
            {
                factura.NumeroFactura = await ReservarSiguienteNumeroAsync(factura.RestauranteId, restaurante.PrefijoFactura);

                try
                {
                    await _context.SaveChangesAsync();
                    return;
                }
                catch (DbUpdateException ex) when (EsViolacionUnica(ex))
                {
                    if (hayTransaccionExterna)
                        throw;

                    // Si no hay transacción externa, rechazar los cambios pendientes del
                    // intento fallido y reintentar con el número siguiente (la secuencia ya avanzó).
                    foreach (var entry in _context.ChangeTracker.Entries())
                        entry.State = EntityState.Detached;

                    if (intento == maxIntentos)
                        throw new BusinessException("FACTURA_NUMERO_CONFLICTO", "No se pudo asignar un número de factura único. Intente de nuevo.");
                }
            }
        }

        private static bool EsViolacionUnica(DbUpdateException ex)
        {
            return ex.InnerException?.Message?.Contains("UNIQUE constraint failed", StringComparison.OrdinalIgnoreCase) == true
                || ex.InnerException?.Message?.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) == true;
        }

        private static FacturaVentaDto MapToListDto(FacturaVenta f, string moneda)
        {
            return new FacturaVentaDto
            {
                Id = f.Id,
                RestauranteId = f.RestauranteId,
                PedidoId = f.PedidoId,
                NumeroMesa = f.Pedido?.NumeroMesa,
                NumeroFactura = f.NumeroFactura,
                FechaEmision = f.FechaEmision,
                ClienteNombre = f.ClienteNombre,
                ClienteTelefono = f.ClienteTelefono,
                MetodoPago = f.MetodoPago,
                MeseroUsuarioId = f.MeseroUsuarioId,
                MeseroNombre = f.MeseroNombre,
                PorcentajePropina = f.PorcentajePropina,
                Propina = f.Propina,
                Subtotal = f.Subtotal,
                Impuesto = f.Impuesto,
                Total = f.Total,
                TotalConPropina = f.TotalConPropina,
                PorcentajeImpuesto = f.PorcentajeImpuesto,
                ImpuestoIncluido = f.ImpuestoIncluido,
                Estado = (int)f.Estado,
                Moneda = moneda,
                FechaPago = f.FechaPago,
                UsuarioCajaNombre = f.UsuarioCajaNombre
            };
        }

        private static FacturaVentaDetalleDto MapToDetalleDto(FacturaVenta f, string moneda, List<Guid> pedidoIds)
        {
            return new FacturaVentaDetalleDto
            {
                Id = f.Id,
                RestauranteId = f.RestauranteId,
                PedidoId = f.PedidoId,
                PedidoIds = pedidoIds,
                NumeroMesa = f.Pedido?.NumeroMesa,
                NumeroFactura = f.NumeroFactura,
                FechaEmision = f.FechaEmision,
                ClienteNombre = f.ClienteNombre,
                ClienteTelefono = f.ClienteTelefono,
                ClienteNumeroFiscal = f.ClienteNumeroFiscal ?? "",
                TipoEntrega = f.TipoEntrega,
                MetodoPago = f.MetodoPago,
                Nota = f.Nota,
                MeseroUsuarioId = f.MeseroUsuarioId,
                MeseroNombre = f.MeseroNombre,
                PorcentajePropina = f.PorcentajePropina,
                Propina = f.Propina,
                Subtotal = f.Subtotal,
                Impuesto = f.Impuesto,
                Total = f.Total,
                TotalConPropina = f.TotalConPropina,
                PorcentajeImpuesto = f.PorcentajeImpuesto,
                ImpuestoIncluido = f.ImpuestoIncluido,
                Estado = (int)f.Estado,
                Moneda = moneda,
                FechaPago = f.FechaPago,
                UsuarioCajaNombre = f.UsuarioCajaNombre,
                MontoRecibido = f.MontoRecibido,
                Cambio = f.Cambio,
                Items = f.Items.Select(i => new FacturaVentaItemDto
                {
                    ProductoId = i.ProductoId,
                    Nombre = i.Nombre,
                    Precio = i.Precio,
                    Cantidad = i.Cantidad,
                    Opciones = i.Opciones,
                    Notas = i.Notas,
                    EsCombo = i.EsCombo,
                    ComboNombre = i.ComboNombre,
                    ComboItemsJson = i.ComboItemsJson
                }).ToList(),
                RestauranteNombre = f.Restaurante?.Name ?? "",
                RestauranteDireccion = f.Restaurante?.Direccion ?? "",
                RestauranteTelefono = f.Restaurante?.Phone ?? "",
                RestauranteNumeroFiscal = f.Restaurante?.NumeroFiscal ?? "",
                MensajePieFactura = f.Restaurante?.MensajePieFactura ?? ""
            };
        }
    }
}
