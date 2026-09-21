using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class CuentaMesaService : ICuentaMesaService
    {
        private readonly AppDbContext _context;
        private readonly IFacturaVentaService _facturaVentaService;

        public CuentaMesaService(AppDbContext context, IFacturaVentaService facturaVentaService)
        {
            _context = context;
            _facturaVentaService = facturaVentaService;
        }

        public async Task<CuentaMesaDetalleDto?> GetByMesaAsync(Guid mesaId)
        {
            var cuenta = await _context.CuentasMesas
                .FirstOrDefaultAsync(c => c.MesaId == mesaId && c.Estado == EstadoCuentaMesa.Abierta);
            if (cuenta == null) return null;

            return await MapToDetalleAsync(cuenta);
        }

        public async Task<List<CuentaMesaDetalleDto>> GetByRestauranteAsync(Guid restauranteId, bool soloAbiertas = false)
        {
            var cuentas = await _context.CuentasMesas
                .Include(c => c.Mesa)
                .Where(c => c.RestauranteId == restauranteId)
                .Where(c => !soloAbiertas || c.Estado == EstadoCuentaMesa.Abierta)
                .OrderByDescending(c => c.FechaApertura)
                .ToListAsync();

            var resultado = new List<CuentaMesaDetalleDto>();
            foreach (var cuenta in cuentas)
                resultado.Add(await MapToDetalleAsync(cuenta));
            return resultado;
        }

        public async Task<CuentaMesaDetalleDto> AbrirAsync(Guid restauranteId, Guid mesaId)
        {
            var mesa = await _context.Mesas.FindAsync(mesaId);
            if (mesa == null)
                throw new KeyNotFoundException("La mesa no existe");

            var cuentaExistente = await _context.CuentasMesas
                .FirstOrDefaultAsync(c => c.MesaId == mesaId && c.Estado == EstadoCuentaMesa.Abierta);
            if (cuentaExistente != null)
                return await MapToDetalleAsync(cuentaExistente);

            var cuenta = new CuentaMesa
            {
                RestauranteId = restauranteId,
                MesaId = mesaId,
                Estado = EstadoCuentaMesa.Abierta,
                FechaApertura = DateTime.UtcNow
            };

            mesa.EstaOcupada = true;

            _context.CuentasMesas.Add(cuenta);
            await _context.SaveChangesAsync();

            return await MapToDetalleAsync(cuenta);
        }

        public async Task<CuentaMesaDetalleDto> CerrarAsync(Guid mesaId, CerrarCuentaMesaDto dto)
        {
            var cuenta = await _context.CuentasMesas
                .FirstOrDefaultAsync(c => c.MesaId == mesaId && c.Estado == EstadoCuentaMesa.Abierta);
            if (cuenta == null)
                throw new InvalidOperationException("La mesa no tiene una cuenta abierta");

            var pedidos = await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Where(p => p.MesaId == mesaId && p.Activo && p.FacturaVentaId == null)
                .OrderBy(p => p.Fecha)
                .ToListAsync();

            if (pedidos.Count == 0)
                throw new InvalidOperationException("La mesa no tiene pedidos pendientes de facturar");

            foreach (var p in pedidos)
                if (p.Estado != Estado.Entregado)
                    p.Estado = Estado.Entregado;

            await _context.SaveChangesAsync();

            var facturaDto = new CrearFacturaVentaDto
            {
                PedidoId = pedidos[0].Id,
                PedidosIds = pedidos.Select(p => p.Id).ToList(),
                ClienteNombre = dto.ClienteNombre,
                ClienteTelefono = dto.ClienteTelefono,
                ClienteNumeroFiscal = dto.ClienteNumeroFiscal,
                TipoEntrega = string.IsNullOrWhiteSpace(dto.TipoEntrega) ? "en mesa" : dto.TipoEntrega,
                MetodoPago = dto.MetodoPago,
                Nota = dto.Nota
            };

            var factura = await _facturaVentaService.CrearDesdePedidoAsync(cuenta.RestauranteId, facturaDto);
            if (factura == null)
                throw new InvalidOperationException("No se pudo generar la factura");

            cuenta.Estado = EstadoCuentaMesa.Cerrada;
            cuenta.FechaCierre = DateTime.UtcNow;
            cuenta.FacturaVentaId = factura.Id;
            cuenta.ClienteNombre = factura.ClienteNombre;
            cuenta.ClienteTelefono = factura.ClienteTelefono;
            cuenta.MetodoPago = factura.MetodoPago;
            cuenta.TipoEntrega = factura.TipoEntrega;
            cuenta.Subtotal = factura.Subtotal;
            cuenta.Impuesto = factura.Impuesto;
            cuenta.Total = factura.Total;

            foreach (var p in pedidos)
                p.CuentaMesaId = cuenta.Id;

            await _context.SaveChangesAsync();

            return await MapToDetalleAsync(cuenta);
        }

        public async Task<bool> LiberarMesaAsync(Guid mesaId)
        {
            var cuenta = await _context.CuentasMesas
                .FirstOrDefaultAsync(c => c.MesaId == mesaId && c.Estado == EstadoCuentaMesa.Abierta);
            if (cuenta == null) return false;

            cuenta.Estado = EstadoCuentaMesa.Cerrada;
            cuenta.FechaCierre = DateTime.UtcNow;

            var pedidos = await _context.Pedidos
                .Where(p => p.MesaId == mesaId && p.Activo)
                .ToListAsync();
            foreach (var p in pedidos)
                p.CuentaMesaId = cuenta.Id;

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<CuentaMesaDetalleDto> MapToDetalleAsync(CuentaMesa cuenta)
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Where(p => p.MesaId == cuenta.MesaId && p.Activo && p.FacturaVentaId == null)
                .OrderBy(p => p.Fecha)
                .ToListAsync();

            var rest = await _context.Restaurantes.FindAsync(cuenta.RestauranteId);
            var mesa = await _context.Mesas.FindAsync(cuenta.MesaId);
            var (subtotal, impuesto, total) = CalcularTotales(rest, pedidos);

            var items = pedidos
                .SelectMany(p => p.Items)
                .GroupBy(i => new { i.EsCombo, i.ComboNombre, i.Opciones, i.ComboItemsJson })
                .Select(g => new CuentaMesaItemDto
                {
                    Nombre = g.First().EsCombo
                        ? g.First().ComboNombre ?? "Combo"
                        : g.First().Producto?.Nombre ?? g.First().ComboNombre ?? "Producto",
                    Cantidad = g.Sum(i => i.Cantidad),
                    Precio = g.First().Precio,
                    Opciones = g.First().Opciones,
                    EsCombo = g.First().EsCombo,
                    ComboNombre = g.First().ComboNombre,
                    ComboItemsJson = g.First().ComboItemsJson
                })
                .OrderBy(i => i.Nombre)
                .ToList();

            return new CuentaMesaDetalleDto
            {
                Id = cuenta.Id,
                RestauranteId = cuenta.RestauranteId,
                MesaId = cuenta.MesaId,
                NumeroMesa = mesa?.Numero ?? 0,
                Estado = (int)cuenta.Estado,
                FechaApertura = cuenta.FechaApertura,
                FechaCierre = cuenta.FechaCierre,
                ClienteNombre = cuenta.ClienteNombre,
                ClienteTelefono = cuenta.ClienteTelefono,
                MetodoPago = cuenta.MetodoPago,
                TipoEntrega = cuenta.TipoEntrega,
                Subtotal = subtotal,
                Impuesto = impuesto,
                Total = total,
                FacturaVentaId = cuenta.FacturaVentaId,
                CantidadPedidos = pedidos.Count,
                Pedidos = pedidos.Select(p => new CuentaMesaPedidoDto
                {
                    Id = p.Id,
                    ClienteNombre = p.ClienteNombre,
                    Estado = (int)p.Estado,
                    Total = p.Total,
                    CantidadItems = p.Items.Sum(i => i.Cantidad)
                }).ToList(),
                Items = items
            };
        }

        private static (decimal subtotal, decimal impuesto, decimal total) CalcularTotales(Restaurante? rest, List<Pedido> pedidos)
        {
            var subtotal = pedidos
                .SelectMany(p => p.Items)
                .Sum(i => i.Precio * i.Cantidad);

            if (rest == null || rest.PorcentajeImpuesto <= 0)
                return (Math.Round(subtotal, 2), 0, Math.Round(subtotal, 2));

            decimal impuesto;
            decimal total;

            if (rest.ImpuestoIncluido)
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
    }
}
