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
                throw new BusinessException(ErrorCodes.MESA_NO_DISPONIBLE, "La mesa no existe");

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

        /// <summary>
        /// Valida que la cuenta pueda cerrarse sin crear la factura. Devuelve el detalle de
        /// los pedidos con items en curso que impiden el cierre (PEDIDOS_PENDIENTES) o el
        /// total a facturar cuando todo está facturable.
        /// </summary>
        public async Task<ValidarCierreResponseDto> ValidarCierreAsync(Guid cuentaMesaId)
        {
            var cuenta = await _context.CuentasMesas.FindAsync(cuentaMesaId);
            if (cuenta == null)
                throw new BusinessException(ErrorCodes.CUENTA_NO_ENCONTRADA, "La cuenta de mesa no existe", System.Net.HttpStatusCode.NotFound);

            if (cuenta.Estado != EstadoCuentaMesa.Abierta)
            {
                var (code, message) = cuenta.Estado switch
                {
                    EstadoCuentaMesa.Cerrando => (ErrorCodes.CUENTA_EN_PROCESO_DE_CIERRE, "La cuenta se está cerrando en este momento"),
                    EstadoCuentaMesa.Cancelada => (ErrorCodes.CUENTA_INVALIDADA, "La cuenta fue liberada sin factura"),
                    _ => (ErrorCodes.CUENTA_YA_CERRADA, "La cuenta ya fue cerrada")
                };
                return new ValidarCierreResponseDto { PuedeCerrar = false, Code = code, Message = message };
            }

            var pedidos = await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Where(p => p.MesaId == cuenta.MesaId && p.Activo && p.FacturaVentaId == null)
                .OrderBy(p => p.Fecha)
                .ToListAsync();

            if (pedidos.Count == 0)
                return new ValidarCierreResponseDto
                {
                    PuedeCerrar = false,
                    Code = ErrorCodes.PEDIDO_NO_FACTURABLE,
                    Message = "La cuenta no tiene pedidos por facturar",
                    PedidosPendientes = new List<PedidoPendienteDto>()
                };

            var pendientes = pedidos
                .Where(p => p.Items.Any(i => i.Estado != Estado.Entregado && i.Estado != Estado.Cancelado))
                .Select(MapPedidoPendiente)
                .ToList();

            if (pendientes.Count > 0)
                return new ValidarCierreResponseDto
                {
                    PuedeCerrar = false,
                    Code = ErrorCodes.PEDIDOS_PENDIENTES,
                    Message = "Hay pedidos con items aún en preparación o listos por entregar",
                    PedidosPendientes = pendientes
                };

            var facturables = pedidos.Where(p => p.PuedeFacturarse).ToList();
            if (facturables.Count == 0)
                return new ValidarCierreResponseDto
                {
                    PuedeCerrar = false,
                    Code = ErrorCodes.PEDIDO_NO_FACTURABLE,
                    Message = "La cuenta no tiene items entregados para facturar",
                    PedidosPendientes = pendientes
                };

            var rest = await _context.Restaurantes.FindAsync(cuenta.RestauranteId);
            var (subtotal, impuesto, total) = CalcularTotales(rest, facturables);
            var (porcentajePropina, propina, totalConPropina) = rest == null
                ? (0m, 0m, total)
                : FacturacionHelper.CalcularPropina(rest, "en mesa", subtotal, total);

            return new ValidarCierreResponseDto
            {
                PuedeCerrar = true,
                Message = "La cuenta está lista para cerrarse",
                Total = total,
                PorcentajePropina = porcentajePropina,
                Propina = propina,
                TotalConPropina = totalConPropina,
                PedidosFacturables = facturables.Select(p => p.Id).ToList(),
                PedidosPendientes = pendientes
            };
        }

        /// <summary>
        /// Cierra la cuenta de la mesa: todas sus operaciones (reserva de estado Cerrando,
        /// validación por item, generación de factura, cierre de cuenta, liberación de la
        /// mesa y asociación de pedidos) ocurren dentro de una única transacción. Ante una
        /// violación de unicidad se reintenta el flujo completo. No se fuerza el estado
        /// Entregado de los pedidos; solo se factura lo entregado.
        ///
        /// La factura nace <see cref="EstadoFacturaVenta.PendienteCobro"/>: el mesero no cobra
        /// ni imprime, solo envía la cuenta a caja, que la imprime, la lleva al cliente y
        /// luego confirma el pago.
        /// </summary>
        public async Task<CerrarCuentaResponseDto> CerrarAsync(Guid mesaId, CerrarCuentaMesaDto dto)
        {
            const int maxIntentos = 3;

            for (int intento = 1; intento <= maxIntentos; intento++)
            {
                await using var tx = await _context.Database.BeginTransactionAsync();
                try
                {
                    var cuenta = await _context.CuentasMesas
                        .FirstOrDefaultAsync(c => c.MesaId == mesaId && c.Estado == EstadoCuentaMesa.Abierta);

                    if (cuenta == null)
                    {
                        await tx.RollbackAsync();
                        return await RespuestaCuentaNoAbiertaAsync(mesaId);
                    }

                    var pedidos = await _context.Pedidos
                        .Include(p => p.Items)
                        .ThenInclude(i => i.Producto)
                        .Where(p => p.MesaId == mesaId && p.Activo && p.FacturaVentaId == null)
                        .OrderBy(p => p.Fecha)
                        .ToListAsync();

                    if (pedidos.Count == 0)
                    {
                        await tx.RollbackAsync();
                        return new CerrarCuentaResponseDto
                        {
                            Success = false,
                            Code = ErrorCodes.PEDIDO_NO_FACTURABLE,
                            Message = "La cuenta no tiene pedidos por facturar"
                        };
                    }

                    // Reserva mutuamente excluyente del cierre dentro de la transacción.
                    cuenta.Estado = EstadoCuentaMesa.Cerrando;
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

                    var factura = await _facturaVentaService.CrearDesdePedidoAsync(
                        cuenta.RestauranteId,
                        facturaDto,
                        EstadoFacturaVenta.PendienteCobro);
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

                    // La cuenta ya está facturada y en manos de caja, así que la mesa queda
                    // libre para el siguiente cliente. Todos sus pedidos tienen FacturaVentaId,
                    // por lo que no hay órdenes huérfanas que invalidar.
                    var mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.Id == mesaId);
                    if (mesa != null)
                        mesa.EstaOcupada = false;

                    await _context.SaveChangesAsync();
                    await tx.CommitAsync();

                    var detalle = await MapToDetalleConPedidosAsync(cuenta, pedidos);

                    return new CerrarCuentaResponseDto
                    {
                        Success = true,
                        Code = "OK",
                        Message = "Cuenta cerrada correctamente",
                        FacturaVentaId = factura.Id,
                        Cuenta = detalle
                    };
                }
                catch (BusinessException ex)
                {
                    await tx.RollbackAsync();
                    return new CerrarCuentaResponseDto
                    {
                        Success = false,
                        Code = ex.Code,
                        Message = ex.Message
                    };
                }
                catch (DbUpdateException ex) when (EsViolacionUnica(ex))
                {
                    await tx.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    if (intento == maxIntentos)
                        return new CerrarCuentaResponseDto
                        {
                            Success = false,
                            Code = "CUENTA_MESA_CONFLICTO",
                            Message = "Conflicto al cerrar la cuenta. Intente de nuevo."
                        };
                }
            }

            return new CerrarCuentaResponseDto { Success = false, Code = "ERROR_INESPERADO", Message = "No se pudo cerrar la cuenta" };
        }

        private async Task<CerrarCuentaResponseDto> RespuestaCuentaNoAbiertaAsync(Guid mesaId)
        {
            var estados = await _context.CuentasMesas
                .Where(c => c.MesaId == mesaId)
                .Select(c => new { c.Estado, c.FacturaVentaId })
                .ToListAsync();

            if (estados.Any(e => e.Estado == EstadoCuentaMesa.Cerrando))
                return new CerrarCuentaResponseDto
                {
                    Success = false,
                    Code = ErrorCodes.CUENTA_EN_PROCESO_DE_CIERRE,
                    Message = "La cuenta se está cerrando en este momento"
                };

            var cerrada = estados.LastOrDefault(e => e.Estado == EstadoCuentaMesa.Cerrada);
            if (cerrada != null && cerrada.FacturaVentaId.HasValue)
                return new CerrarCuentaResponseDto
                {
                    Success = false,
                    Code = ErrorCodes.CUENTA_YA_CERRADA,
                    Message = "La cuenta ya había sido cerrada",
                    FacturaVentaId = cerrada.FacturaVentaId
                };

            if (estados.Any(e => e.Estado == EstadoCuentaMesa.Cancelada))
                return new CerrarCuentaResponseDto
                {
                    Success = false,
                    Code = ErrorCodes.CUENTA_INVALIDADA,
                    Message = "La cuenta fue liberada sin factura"
                };

            return new CerrarCuentaResponseDto
            {
                Success = false,
                Code = ErrorCodes.CUENTA_NO_ENCONTRADA,
                Message = "La mesa no tiene una cuenta abierta"
            };
        }

        /// <summary>
        /// Libera la mesa sin generar factura (mesa abandonada, error de captura, etc.).
        /// La cuenta pasa a Cancelada y desaparece del listado de cuentas abiertas; los
        /// pedidos sin facturar conservan sus estados originales. La liberación de la mesa
        /// en sí (Activo de pedidos y EstaOcupada) la gestiona MesaService.LiberarAsync.
        /// </summary>
        public async Task<bool> LiberarMesaAsync(Guid mesaId)
        {
            var cuenta = await _context.CuentasMesas
                .FirstOrDefaultAsync(c => c.MesaId == mesaId && c.Estado == EstadoCuentaMesa.Abierta);
            if (cuenta == null) return false;

            cuenta.Estado = EstadoCuentaMesa.Cancelada;
            cuenta.FechaCierre = DateTime.UtcNow;

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

            return await MapToDetalleConPedidosAsync(cuenta, pedidos);
        }

        private async Task<CuentaMesaDetalleDto> MapToDetalleConPedidosAsync(CuentaMesa cuenta, List<Pedido> pedidos)
        {
            var rest = await _context.Restaurantes.FindAsync(cuenta.RestauranteId);
            var mesa = await _context.Mesas.FindAsync(cuenta.MesaId);
            var (subtotal, impuesto, total) = CalcularTotales(rest, pedidos);
            var (porcentajePropina, propina, totalConPropina) = rest == null
                ? (0m, 0m, total)
                : FacturacionHelper.CalcularPropina(rest, "en mesa", subtotal, total);

            var items = pedidos
                .SelectMany(p => p.Items)
                .Where(i => i.Estado != Estado.Cancelado)
                .GroupBy(i => new { i.MenuId, i.ComboId, i.EsCombo, i.ComboNombre, i.Opciones, i.ComboItemsJson })
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
                PorcentajePropina = porcentajePropina,
                Propina = propina,
                TotalConPropina = totalConPropina,
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

        private static PedidoPendienteDto MapPedidoPendiente(Pedido p)
        {
            return new PedidoPendienteDto
            {
                Id = p.Id,
                ClienteNombre = p.ClienteNombre,
                NumeroMesa = p.NumeroMesa,
                Estado = (int)p.Estado,
                EstadoNombre = EstadoNombre(p.Estado),
                Items = p.Items
                    .Where(i => i.Estado != Estado.Entregado && i.Estado != Estado.Cancelado)
                    .Select(i => new PedidoItemPendienteDto
                    {
                        Id = i.Id,
                        Nombre = i.EsCombo ? i.ComboNombre ?? "Combo" : i.Producto?.Nombre ?? "Producto",
                        Cantidad = i.Cantidad,
                        Estado = (int)i.Estado,
                        EstadoNombre = EstadoNombre(i.Estado)
                    })
                    .ToList()
            };
        }

        private static string EstadoNombre(Estado e) => e switch
        {
            Estado.Pendiente => "Pendiente",
            Estado.EnPreparacion => "En preparación",
            Estado.Listo => "Listo",
            Estado.Entregado => "Entregado",
            Estado.Cancelado => "Cancelado",
            _ => e.ToString()
        };

        private static (decimal subtotal, decimal impuesto, decimal total) CalcularTotales(Restaurante? rest, List<Pedido> pedidos)
        {
            // Solo se cobran los items facturables (entregados); los cancelados se omiten.
            var subtotal = pedidos
                .SelectMany(p => p.Items)
                .Where(i => i.Estado != Estado.Cancelado)
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

        private static bool EsViolacionUnica(DbUpdateException ex)
        {
            return ex.InnerException?.Message?.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) == true;
        }
    }
}