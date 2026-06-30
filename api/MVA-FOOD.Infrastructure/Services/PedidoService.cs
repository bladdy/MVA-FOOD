using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
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

            var pedido = new Pedido
            {
                ClienteNombre = dto.ClienteNombre,
                ClienteTelefono = dto.ClienteTelefono,
                TipoEntrega = dto.TipoEntrega,
                Direccion = dto.Direccion,
                RestauranteId = dto.RestauranteId,
                Items = items
            };

            pedido.CalcularTotal();

            _context.Pedidos.Add(pedido);
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
