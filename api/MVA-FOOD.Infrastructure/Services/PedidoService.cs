using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

    public async Task<List<Pedido>> GetAllAsync()
    {
        return await _context.Pedidos
            .Include(p => p.Items)
            .ThenInclude(i => i.Producto)
            .Include(p => p.Restaurante)
            .Include(p => p.Mesa)
            .Include(p => p.Empleado)
            .ToListAsync();
    }

    public async Task<Pedido> GetByIdAsync(Guid id)
    {
        return await _context.Pedidos
            .Include(p => p.Items)
            .ThenInclude(i => i.Producto)
            .Include(p => p.Restaurante)
            .Include(p => p.Mesa)
            .Include(p => p.Empleado)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Pedido> CreateAsync(PedidoDto dto)
    {
        var items = new List<PedidoItem>();

        foreach (var itemDto in dto.Items)
        {
            var menu = await _context.Menus.FindAsync(itemDto.MenuId);
            if (menu == null)
                throw new Exception($"Menu con ID {itemDto.MenuId} no encontrado");

            items.Add(new PedidoItem
            {
                MenuId = menu.Id,
                Cantidad = itemDto.Cantidad,
                Precio = menu.Precio,
                Notas = itemDto.Notas
            });
        }

        var pedido = new Pedido
        {
            ClienteNombre = dto.ClienteNombre,
            ClienteTelefono = dto.ClienteTelefono,
            RestauranteId = dto.RestauranteId,
            MesaId = dto.MesaId,
            EmpleadoId = dto.EmpleadoId,
            Items = items
        };

        pedido.CalcularTotal();

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();
        return pedido;
    }
    public async Task<bool> CambiarMesaAsync(Guid pedidoId, Guid nuevaMesaId)
    {
        var pedido = await _context.Pedidos.FindAsync(pedidoId);
        if (pedido == null) return false;

        var mesa = await _context.Mesas.FindAsync(nuevaMesaId);
        if (mesa == null) throw new Exception("Mesa no encontrada");

        pedido.MesaId = nuevaMesaId;
        await _context.SaveChangesAsync();
        return true;
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