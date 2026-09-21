using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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

        public async Task<Pedido> CreateAsync(PedidoDto dto)
        {
            var items = new List<PedidoItem>();

            foreach (var itemDto in dto.Items)
            {
                if (itemDto.EsCombo)
                {
                    items.Add(new PedidoItem
                    {
                        MenuId = null,
                        Precio = itemDto.Precio,
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

                var menu = await _context.Menus.FindAsync(itemDto.MenuId);
                if (menu == null)
                    throw new Exception($"Menu con ID {itemDto.MenuId} no encontrado");

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

            Mesa mesa = null;
            if (dto.MesaId.HasValue)
            {
                mesa = await _context.Mesas.FirstOrDefaultAsync(m => m.Id == dto.MesaId.Value);
                if (mesa == null)
                    throw new Exception($"Mesa con ID {dto.MesaId} no encontrada");

                if (mesa.RestauranteId != dto.RestauranteId)
                    throw new Exception("La mesa no pertenece al restaurante indicado");
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
                Items = items
            };

            pedido.CalcularTotal();

            _context.Pedidos.Add(pedido);

            if (mesa != null)
            {
                mesa.EstaOcupada = true;
                _context.Mesas.Update(mesa);
            }

            await _context.SaveChangesAsync();
            return pedido;
        }

        public async Task<bool> UpdateEstadoAsync(Guid id, Estado estado)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return false;

            pedido.Estado = estado;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Pedido>> GetByMesaAsync(Guid mesaId)
        {
            return await _context.Pedidos
                .Include(p => p.Items)
                .ThenInclude(i => i.Producto)
                .Include(p => p.Restaurante)
                .Where(p => p.MesaId == mesaId && p.Activo)
                .OrderBy(p => p.Fecha)
                .ToListAsync();
        }

        public async Task<(bool success, bool promovido)> UpdateItemEstadoAsync(Guid pedidoId, Guid itemId, Estado estado)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == pedidoId);

            if (pedido == null) return (false, false);

            var item = pedido.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) return (false, false);

            item.Estado = estado;

            var promovido = false;
            if (estado == Estado.Completado
                && pedido.Estado != Estado.Completado
                && pedido.Estado != Estado.Entregado
                && pedido.Items.All(i => i.Estado == Estado.Completado || i.Estado == Estado.Entregado))
            {
                pedido.Estado = Estado.Completado;
                promovido = true;
            }

            await _context.SaveChangesAsync();
            return (true, promovido);
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
