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

        public async Task<List<FacturaVentaDto>> GetByRestauranteAsync(Guid restauranteId)
        {
            var facturas = await _context.FacturasVentas
                .Include(f => f.Pedido)
                .Where(f => f.RestauranteId == restauranteId)
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
                .Where(p => p.MesaId.HasValue
                    ? p.Estado == Estado.Entregado
                    : p.Estado == Estado.Completado || p.Estado == Estado.Entregado)
                .Where(p => p.FacturaVentaId == null)
                .Where(p => !_context.FacturasVentas.Any(f => f.PedidoId == p.Id && f.Estado == EstadoFacturaVenta.Emitida))
                .OrderByDescending(p => p.Fecha)
                .ToListAsync();

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
                Moneda = moneda,
                NumeroFiscal = rest.NumeroFiscal,
                MensajePieFactura = rest.MensajePieFactura,
                SiguienteNumero = siguiente
            };
        }

        public async Task<FacturaVentaDetalleDto?> CrearDesdePedidoAsync(Guid restauranteId, CrearFacturaVentaDto dto)
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
                VerificarEstadoFacturable(p);

            var facturadosIds = await _context.Pedidos
                .Where(p => pedidoIds.Contains(p.Id) && p.FacturaVentaId != null)
                .Select(p => p.Id)
                .ToListAsync();
            if (facturadosIds.Count > 0)
                throw new InvalidOperationException("Uno de los pedidos ya fue facturado");

            var existe = await _context.FacturasVentas.AnyAsync(f =>
                f.PedidoId != null && pedidoIds.Contains(f.PedidoId.Value) && f.Estado == EstadoFacturaVenta.Emitida);
            if (existe)
                throw new InvalidOperationException("Uno de los pedidos ya tiene una factura emitida");

            var rest = await _context.Restaurantes.FindAsync(restauranteId)
                ?? throw new KeyNotFoundException("Restaurante no encontrado");

            var items = pedidos
                .SelectMany(p => p.Items)
                .Select(i => new FacturaVentaItem
                {
                    Nombre = i.EsCombo
                        ? i.ComboNombre ?? "Combo"
                        : i.Producto?.Nombre ?? i.ComboNombre ?? "Producto",
                    Precio = i.Precio,
                    Cantidad = i.Cantidad,
                    Opciones = i.Opciones,
                    EsCombo = i.EsCombo,
                    ComboNombre = i.ComboNombre,
                    ComboItemsJson = i.ComboItemsJson
                })
                .ToList();

            var pedidoPrincipal = pedidos[0];
            var (subtotal, impuesto, total) = CalcularTotales(rest, items);

            var factura = new FacturaVenta
            {
                RestauranteId = restauranteId,
                PedidoId = pedidoPrincipal.Id,
                NumeroFactura = GenerarNumeroFactura(rest.PrefijoFactura, rest.SecuenciaFactura),
                ClienteNombre = string.IsNullOrWhiteSpace(dto.ClienteNombre) ? pedidoPrincipal.ClienteNombre : dto.ClienteNombre,
                ClienteTelefono = string.IsNullOrWhiteSpace(dto.ClienteTelefono) ? pedidoPrincipal.ClienteTelefono : dto.ClienteTelefono,
                ClienteNumeroFiscal = dto.ClienteNumeroFiscal,
                TipoEntrega = string.IsNullOrWhiteSpace(dto.TipoEntrega) ? pedidoPrincipal.TipoEntrega : dto.TipoEntrega,
                MetodoPago = dto.MetodoPago ?? pedidoPrincipal.MetodoPago,
                Nota = dto.Nota,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                PorcentajeImpuesto = rest.PorcentajeImpuesto,
                ImpuestoIncluido = rest.ImpuestoIncluido,
                Moneda = MonedaHelper.PaisToMoneda(rest.Pais),
                Items = items
            };

            rest.SecuenciaFactura++;
            _context.FacturasVentas.Add(factura);

            foreach (var p in pedidos)
                p.FacturaVentaId = factura.Id;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(factura.Id);
        }

        private static void VerificarEstadoFacturable(Pedido pedido)
        {
            if (pedido.MesaId.HasValue && pedido.Estado != Estado.Entregado)
                throw new InvalidOperationException("Solo se pueden facturar órdenes de mesa entregadas");

            if (!pedido.MesaId.HasValue && pedido.Estado != Estado.Completado && pedido.Estado != Estado.Entregado)
                throw new InvalidOperationException("Solo se pueden facturar pedidos completados o entregados");
        }

        public async Task<FacturaVentaDetalleDto?> CrearVentaRapidaAsync(Guid restauranteId, CrearFacturaVentaDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                throw new InvalidOperationException("Debe agregar al menos un producto");

            var rest = await _context.Restaurantes.FindAsync(restauranteId)
                ?? throw new KeyNotFoundException("Restaurante no encontrado");

            var items = dto.Items.Where(i => i.Cantidad > 0).Select(i => new FacturaVentaItem
            {
                Nombre = i.Nombre,
                Precio = i.Precio,
                Cantidad = i.Cantidad,
                Opciones = i.Opciones,
                EsCombo = i.EsCombo,
                ComboNombre = i.ComboNombre,
                ComboItemsJson = i.ComboItemsJson
            }).ToList();

            if (items.Count == 0)
                throw new InvalidOperationException("Debe agregar al menos un producto");

            var (subtotal, impuesto, total) = CalcularTotales(rest, items);

            var factura = new FacturaVenta
            {
                RestauranteId = restauranteId,
                PedidoId = null,
                NumeroFactura = GenerarNumeroFactura(rest.PrefijoFactura, rest.SecuenciaFactura),
                ClienteNombre = dto.ClienteNombre,
                ClienteTelefono = dto.ClienteTelefono,
                ClienteNumeroFiscal = dto.ClienteNumeroFiscal,
                TipoEntrega = dto.TipoEntrega,
                MetodoPago = dto.MetodoPago,
                Nota = dto.Nota,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                PorcentajeImpuesto = rest.PorcentajeImpuesto,
                ImpuestoIncluido = rest.ImpuestoIncluido,
                Moneda = MonedaHelper.PaisToMoneda(rest.Pais),
                Items = items
            };

            rest.SecuenciaFactura++;
            _context.FacturasVentas.Add(factura);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(factura.Id);
        }

        public async Task<bool> AnularAsync(Guid id, string motivo)
        {
            var factura = await _context.FacturasVentas.FindAsync(id);
            if (factura == null || factura.Estado == EstadoFacturaVenta.Anulada) return false;

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

        public async Task<ResumenFacturacionHoyDto> GetResumenHoyAsync(Guid restauranteId)
        {
            var hoy = DateTime.UtcNow.Date;
            var manana = hoy.AddDays(1);

            var facturas = await _context.FacturasVentas
                .Where(f => f.RestauranteId == restauranteId
                    && f.FechaEmision >= hoy
                    && f.FechaEmision < manana)
                .ToListAsync();

            var emitidas = facturas.Where(f => f.Estado == EstadoFacturaVenta.Emitida).ToList();

            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            return new ResumenFacturacionHoyDto
            {
                Desde = hoy,
                Hasta = manana,
                CantidadVentas = emitidas.Count,
                CantidadAnuladas = facturas.Count(f => f.Estado == EstadoFacturaVenta.Anulada),
                Ingresos = emitidas.Sum(f => f.Total),
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

            var emitidas = facturas.Where(f => f.Estado == EstadoFacturaVenta.Emitida).ToList();
            var anuladas = facturas.Where(f => f.Estado == EstadoFacturaVenta.Anulada).ToList();

            var ingresos = emitidas.Sum(f => f.Total);
            var impuestos = emitidas.Sum(f => f.Impuesto);
            var montoAnulado = anuladas.Sum(f => f.Total);

            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            var ventasPorDia = emitidas
                .GroupBy(f => f.FechaEmision.Date)
                .OrderBy(g => g.Key)
                .Select(g => new ReporteVentasPorDiaDto
                {
                    Fecha = g.Key.ToString("yyyy-MM-dd"),
                    Cantidad = g.Count(),
                    Total = g.Sum(f => f.Total)
                })
                .ToList();

            var ventasPorMetodo = emitidas
                .GroupBy(f => string.IsNullOrWhiteSpace(f.MetodoPago) ? "Sin método" : f.MetodoPago!)
                .OrderByDescending(g => g.Sum(f => f.Total))
                .Select(g => new ReporteVentasPorMetodoPagoDto
                {
                    MetodoPago = g.Key,
                    Cantidad = g.Count(),
                    Total = g.Sum(f => f.Total)
                })
                .ToList();

            var topProductos = emitidas
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
                CantidadVentas = emitidas.Count,
                CantidadAnuladas = anuladas.Count,
                Ingresos = Math.Round(ingresos, 2),
                Impuestos = Math.Round(impuestos, 2),
                MontoAnulado = Math.Round(montoAnulado, 2),
                TicketPromedio = emitidas.Count > 0 ? Math.Round(ingresos / emitidas.Count, 2) : 0,
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
                Subtotal = f.Subtotal,
                Impuesto = f.Impuesto,
                Total = f.Total,
                PorcentajeImpuesto = f.PorcentajeImpuesto,
                ImpuestoIncluido = f.ImpuestoIncluido,
                Estado = (int)f.Estado,
                Moneda = moneda
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
                Subtotal = f.Subtotal,
                Impuesto = f.Impuesto,
                Total = f.Total,
                PorcentajeImpuesto = f.PorcentajeImpuesto,
                ImpuestoIncluido = f.ImpuestoIncluido,
                Estado = (int)f.Estado,
                Moneda = moneda,
                Items = f.Items.Select(i => new FacturaVentaItemDto
                {
                    Nombre = i.Nombre,
                    Precio = i.Precio,
                    Cantidad = i.Cantidad,
                    Opciones = i.Opciones,
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
