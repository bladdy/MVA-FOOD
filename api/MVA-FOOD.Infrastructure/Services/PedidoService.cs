using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Core.Wrappers;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly AppDbContext _context;

        public PedidoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Pedido>> GetAllAsync(Guid? restauranteId = null)
        {
            var query = _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Include(p => p.Restaurante)
                .AsQueryable();

            if (restauranteId.HasValue)
                query = query.Where(p => p.RestauranteId == restauranteId.Value);

            return await query
                .OrderByDescending(p => p.Fecha)
                .ToListAsync();
        }

        public async Task<PagedResult<Pedido>> GetHistorialAsync(PedidoFilters filters)
        {
            var query = _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Include(p => p.Restaurante)
                .Where(p => p.RestauranteId == filters.RestauranteId)
                .AsQueryable();

            if (filters.FechaDesde.HasValue)
                query = query.Where(p => p.Fecha >= filters.FechaDesde.Value);

            if (filters.FechaHasta.HasValue)
                query = query.Where(p => p.Fecha <= filters.FechaHasta.Value);

            if (filters.Estado.HasValue)
                query = query.Where(p => p.Estado == filters.Estado.Value);

            if (!string.IsNullOrWhiteSpace(filters.Search))
            {
                var search = filters.Search.ToLower();
                query = query.Where(p =>
                    p.ClienteNombre.ToLower().Contains(search) ||
                    p.ClienteTelefono.ToLower().Contains(search));
            }

            var totalItems = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.Fecha)
                .Skip((filters.PageNumber - 1) * filters.PageSize)
                .Take(filters.PageSize)
                .ToListAsync();

            return new PagedResult<Pedido>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = filters.PageNumber,
                PageSize = filters.PageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)filters.PageSize)
            };
        }

        public async Task<Pedido> GetByIdAsync(Guid id)
        {
            return await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Include(p => p.Restaurante)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Pedido> GetByIdSignalRAsync(Guid id)
        {
            return await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Pedido> CreateAsync(PedidoDto dto, Guid? meseroUsuarioId = null, string? meseroNombre = null)
        {
            // Los precios se recalculan en el servidor: menús desde Menu.Precio con las
            // opciones de variante, y combos desde Combo.Precio. Nunca se confía en el
            // precio enviado por el cliente.
            var items = new List<PedidoItem>();

            foreach (var itemDto in dto.Items)
            {
                if (itemDto.EsCombo)
                {
                    decimal precioCombo = itemDto.Precio;
                    if (itemDto.ComboId.HasValue)
                    {
                        var combo = await _context.Combos.FindAsync(itemDto.ComboId.Value);
                        if (combo != null)
                            precioCombo = combo.Precio ?? precioCombo;
                    }

                    items.Add(new PedidoItem
                    {
                        MenuId = null,
                        Precio = precioCombo,
                        Cantidad = itemDto.Cantidad,
                        Notas = itemDto.Notas,
                        Opciones = itemDto.Opciones,
                        EsCombo = true,
                        ComboId = itemDto.ComboId,
                        ComboNombre = itemDto.ComboNombre,
                        ComboItemsJson = itemDto.ComboItemsJson
                    });
                    continue;
                }

                if (!itemDto.MenuId.HasValue)
                    throw new BusinessException("ITEM_SIN_MENU", "Un item del pedido no tiene producto asociado");

                var menu = await _context.Menus.FindAsync(itemDto.MenuId.Value);
                if (menu == null)
                    throw new BusinessException("MENU_NO_ENCONTRADO", $"Menú con ID {itemDto.MenuId} no encontrado");

                decimal precioBase = menu.Precio;

                if (!string.IsNullOrWhiteSpace(itemDto.Opciones))
                {
                    try
                    {
                        var opciones = JsonSerializer.Deserialize<List<string>>(itemDto.Opciones);
                        var variantesDelMenu = await _context.VarianteMenus
                            .Where(vm => vm.MenuId == menu.Id)
                            .Include(vm => vm.Variante)
                            .ThenInclude(v => v.Opciones)
                            .SelectMany(vm => vm.Variante.Opciones)
                            .ToListAsync();

                        if (opciones != null)
                        {
                            foreach (var opNombre in opciones)
                            {
                                var opcion = variantesDelMenu
                                    .FirstOrDefault(o => o.Nombre.Equals(opNombre, StringComparison.OrdinalIgnoreCase));
                                if (opcion != null)
                                    precioBase += opcion.Precio ?? 0;
                            }
                        }
                    }
                    catch (JsonException)
                    {
                    }
                }

                items.Add(new PedidoItem
                {
                    MenuId = menu.Id,
                    Cantidad = itemDto.Cantidad,
                    Precio = precioBase,
                    Notas = itemDto.Notas,
                    Opciones = itemDto.Opciones
                });
            }

            if (items.Count == 0)
                throw new BusinessException("PEDIDO_SIN_ITEMS", "El pedido debe contener al menos un item");

            Mesa mesa = null;
            if (dto.MesaId.HasValue)
            {
                mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.Id == dto.MesaId.Value);
                if (mesa == null)
                    throw new BusinessException("MESA_NO_DISPONIBLE", $"Mesa con ID {dto.MesaId} no encontrada");

                if (mesa.RestauranteId != dto.RestauranteId)
                    throw new BusinessException("MESA_NO_DISPONIBLE", "La mesa no pertenece al restaurante indicado");
            }

            var pedido = new Pedido
            {
                ClienteNombre = string.IsNullOrWhiteSpace(dto.ClienteNombre) && mesa != null
                    ? $"Mesa {mesa.Numero}"
                    : dto.ClienteNombre,
                ClienteTelefono = dto.ClienteTelefono,
                TipoEntrega = string.IsNullOrWhiteSpace(dto.TipoEntrega) && mesa != null
                    ? "en mesa"
                    : dto.TipoEntrega,
                Direccion = dto.Direccion,
                MetodoPago = dto.MetodoPago,
                RestauranteId = dto.RestauranteId,
                MesaId = dto.MesaId,
                NumeroMesa = mesa?.Numero,
                MeseroUsuarioId = meseroUsuarioId,
                MeseroNombre = meseroNombre,
                Items = items
            };

            pedido.CalcularTotal();

            if (mesa != null)
                await GuardarPedidoDeMesaAsync(pedido, mesa);
            else
            {
                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();
            }

            return pedido;
        }

        /// <summary>
        /// Guarda un pedido de mesa creando/obteniendo la cuenta abierta de la mesa de forma
        /// atómica (cuenta + pedido + mesa ocupada en la misma transacción). El índice único
        /// filtrado CuentaMesa(MesaId, Estado=0) previene dos cuentas abiertas simultáneas;
        /// ante colisión de inserción se reintenta tomando la cuenta ya existente.
        /// </summary>
        private async Task GuardarPedidoDeMesaAsync(Pedido pedido, Mesa mesa)
        {
            const int maxIntentos = 3;

            for (int intento = 1; intento <= maxIntentos; intento++)
            {
                await using var tx = await _context.Database.BeginTransactionAsync();
                try
                {
                    var cuenta = await _context.CuentasMesas
                        .FirstOrDefaultAsync(c => c.MesaId == mesa.Id && c.Estado == EstadoCuentaMesa.Abierta);

                    if (cuenta == null)
                    {
                        cuenta = new CuentaMesa
                        {
                            RestauranteId = mesa.RestauranteId,
                            MesaId = mesa.Id,
                            Estado = EstadoCuentaMesa.Abierta,
                            FechaApertura = DateTime.UtcNow
                        };
                        _context.CuentasMesas.Add(cuenta);
                    }

                    pedido.CuentaMesaId = cuenta.Id;
                    mesa.EstaOcupada = true;
                    _context.Mesas.Update(mesa);
                    _context.Pedidos.Add(pedido);

                    await _context.SaveChangesAsync();
                    await tx.CommitAsync();
                    return;
                }
                catch (DbUpdateException ex) when (EsViolacionUnica(ex))
                {
                    await tx.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    if (intento == maxIntentos)
                        throw new BusinessException("CUENTA_MESA_CONFLICTO", "No se pudo asociar el pedido a la cuenta de la mesa. Intente de nuevo.");
                }
            }
        }

        private static bool EsViolacionUnica(DbUpdateException ex)
        {
            return ex.InnerException?.Message?.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) == true;
        }

        /// <summary>
        /// Transición del estado del pedido (marcar entregado / cancelar). El estado del
        /// pedido queda explícito en Entregado/Cancelado; los estados intermedios derivan
        /// de sus items.
        /// </summary>
        public async Task<bool> UpdateEstadoAsync(Guid id, Estado estado)
        {
            if (estado != Estado.Entregado && estado != Estado.Cancelado)
                return false;

            var pedido = await _context.Pedidos
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (pedido == null) return false;

            if (pedido.Activo == false || pedido.EstaFacturado)
                return false;

            if (pedido.Estado == Estado.Cancelado || pedido.Estado == Estado.Entregado)
                return false;

            // Un pedido cuyos items ya se cancelaron todos no puede marcarse entregado.
            if (estado == Estado.Entregado && !pedido.Items.Any(i => i.Estado != Estado.Cancelado))
                return false;

            pedido.Estado = estado;

            // Propaga el estado final del pedido a sus items activos para mantener
            // consistencia (el detalle de cuenta y la validación de cierre dependen
            // de los estados de los items).
            foreach (var item in pedido.Items.Where(i => i.Estado != Estado.Cancelado))
                item.Estado = estado;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Pedido>> GetByMesaAsync(Guid mesaId)
        {
            return await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Include(p => p.Restaurante)
                .Where(p => p.MesaId == mesaId && p.Activo && p.FacturaVentaId == null)
                .OrderBy(p => p.Fecha)
                .ToListAsync();
        }

        /// <summary>
        /// Devuelve cuántos platos están en estado "Listo" por mesa (pedidos activos
        /// sin facturar). Cada unidad de cantidad cuenta como un plato.
        /// </summary>
        public async Task<List<MesaPlatosListosDto>> GetPlatosListosPorMesaAsync(Guid restauranteId)
        {
            var resultado = await _context.Pedidos
                .Include(p => p.Items)
                .Include(p => p.Mesa)
                .Where(p => p.RestauranteId == restauranteId
                    && p.MesaId != null
                    && p.Activo
                    && p.FacturaVentaId == null
                    && p.Items.Any(i => i.Estado == Estado.Listo))
                .Select(p => new
                {
                    p.MesaId,
                    Numero = p.Mesa != null ? (int?)p.Mesa.Numero : null,
                    Listos = p.Items
                        .Where(i => i.Estado == Estado.Listo)
                        .Sum(i => i.Cantidad)
                })
                .ToListAsync();

            return resultado
                .Where(r => r.Numero.HasValue)
                .GroupBy(r => (Guid)r.MesaId!)
                .Select(g => new MesaPlatosListosDto
                {
                    MesaId = g.Key,
                    NumeroMesa = g.First().Numero!.Value,
                    Listos = g.Sum(r => r.Listos)
                })
                .OrderBy(r => r.NumeroMesa)
                .ToList();
        }

        public async Task<(bool success, bool promovido)> UpdateItemEstadoAsync(Guid pedidoId, Guid itemId, Estado estado)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == pedidoId);

            if (pedido == null) return (false, false);

            var item = pedido.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) return (false, false);

            if (!EsTransicionItemValida(item.Estado, estado))
                return (false, false);

            item.Estado = estado;

            var estadoAnterior = pedido.Estado;
            RecalcularEstadoPedido(pedido);
            var promovido = pedido.Estado == Estado.Entregado && estadoAnterior != Estado.Entregado;

            await _context.SaveChangesAsync();
            return (true, promovido);
        }

        /// <summary>
        /// Cancela el pedido: todos sus items pasan a Cancelado y el estado del pedido
        /// se recalcula (resultado: Cancelado). Los pedidos ya facturados no son
        /// cancelables (la factura es snapshot inmutable).
        /// </summary>
        public async Task<Pedido> CancelarAsync(Guid id)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (pedido == null)
                throw new BusinessException(ErrorCodes.PEDIDO_NO_ENCONTRADO, "El pedido no existe", System.Net.HttpStatusCode.NotFound);

            if (pedido.EstaFacturado)
                throw new BusinessException(ErrorCodes.PEDIDO_YA_FACTURADO, "Un pedido facturado no puede cancelarse");

            foreach (var item in pedido.Items)
                item.Estado = Estado.Cancelado;

            RecalcularEstadoPedido(pedido);

            await _context.SaveChangesAsync();
            return pedido;
        }

        private static bool EsTransicionItemValida(Estado actual, Estado nuevo)
        {
            if (actual == nuevo) return true;
            if (nuevo == Estado.Cancelado)
                return actual == Estado.Pendiente || actual == Estado.EnPreparacion
                    || actual == Estado.Listo || actual == Estado.Entregado;

            // Avance normal de cocina / entrega
            return (actual, nuevo) switch
            {
                (Estado.Pendiente, Estado.EnPreparacion) => true,
                (Estado.Pendiente, Estado.Listo) => true,
                (Estado.Pendiente, Estado.Entregado) => true,
                (Estado.EnPreparacion, Estado.Listo) => true,
                (Estado.EnPreparacion, Estado.Entregado) => true,
                (Estado.Listo, Estado.Entregado) => true,
                _ => false
            };
        }

        /// <summary>
        /// Deriva el estado del pedido a partir de sus items.
        /// - El pedido ya entregado (Entregado) o cancelado (Cancelado) es terminal y
        ///   no retrocede por cambios posteriores de items.
        /// - Todos los items cancelados => Cancelado.
        /// - Con items en curso => el estado mínimo vigente (Pendiente > EnPreparacion > Listo).
        /// - Todos en estado final y al menos uno Entregado => Entregado.
        /// </summary>
        private static void RecalcularEstadoPedido(Pedido pedido)
        {
            var items = pedido.Items;
            if (items.Count == 0)
            {
                pedido.Estado = Estado.Pendiente;
                return;
            }

            if (pedido.Estado == Estado.Cancelado)
            {
                pedido.Estado = items.All(i => i.Estado == Estado.Cancelado)
                    ? Estado.Cancelado
                    : Estado.Pendiente;
                return;
            }

            var enCurso = items.Where(i => i.Estado == Estado.Pendiente
                || i.Estado == Estado.EnPreparacion || i.Estado == Estado.Listo).ToList();

            if (enCurso.Count > 0)
            {
                var estadoMinimo = enCurso
                    .OrderBy(i => i.Estado)
                    .First().Estado;
                pedido.Estado = estadoMinimo;
                return;
            }

            if (items.Any(i => i.Estado == Estado.Entregado))
            {
                pedido.Estado = Estado.Entregado;
                return;
            }

            if (items.All(i => i.Estado == Estado.Cancelado))
            {
                pedido.Estado = Estado.Cancelado;
                return;
            }

            pedido.Estado = Estado.Pendiente;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return false;

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}