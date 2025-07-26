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
    public class VarianteService : IVarianteService
{
    private readonly AppDbContext _context;

    public VarianteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Variante>> GetAllAsync()
    {
        return await _context.Variantes
            .Include(v => v.Opciones)
            .ToListAsync();
    }

    public async Task<Variante> GetByIdAsync(Guid id)
    {
        return await _context.Variantes
            .Include(v => v.Opciones)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Variante> CreateAsync(VarianteDto dto)
    {
        var variante = new Variante
        {
            Name = dto.Name,
            Obligatorio = dto.Obligatorio,
            MaxSeleccion = dto.MaxSeleccion,
            Opciones = dto.Opciones.Select(op => new VarianteOpcion
            {
                Nombre = op.Nombre,
                Precio = op.Precio
            }).ToList()
        };

        _context.Variantes.Add(variante);
        await _context.SaveChangesAsync();

        return variante;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var variante = await _context.Variantes.FindAsync(id);
        if (variante is null) return false;

        _context.Variantes.Remove(variante);
        await _context.SaveChangesAsync();
        return true;
    }
}

}