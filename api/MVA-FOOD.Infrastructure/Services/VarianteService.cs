using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Core.Wrappers;
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

        public async Task<PagedResult<Variante>> GetAllAsync(VarianteFilters filters)
        {
            var query = _context.Variantes.Include(v => v.Opciones).Include(c => c.Categoria).AsQueryable();

            // Apply filters
            query = filters.OrderBy.ToLower() switch
            {
                "nombre" => filters.OrderDirection == "asc" ? query.OrderBy(v => v.Name) : query.OrderByDescending(v => v.Name),
                "maxseleccion" => filters.OrderDirection == "asc" ? query.OrderBy(v => v.MaxSeleccion) : query.OrderByDescending(v => v.MaxSeleccion),
                "obligatorio" => filters.OrderDirection == "asc" ? query.OrderBy(v => v.Obligatorio) : query.OrderByDescending(v => v.Obligatorio),
                _ => query.OrderBy(v => v.Name) // fallback
            };


            // Pagination
            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((filters.PageNumber - 1) * filters.PageSize)
                .Take(filters.PageSize)
                .ToListAsync();
            return new PagedResult<Variante>(items, totalItems, filters.PageNumber, filters.PageSize);
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
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Obligatorio = dto.Obligatorio,
            MaxSeleccion = dto.MaxSeleccion ?? 1,
            CategoriaId = dto.CategoriaId,
            Opciones = dto.Opciones?.Select(op => new VarianteOpcion
            {
                Id = Guid.NewGuid(),
                Nombre = op.Nombre,
                Precio = op.Precio
            }).ToList() ?? new List<VarianteOpcion>()
        };

        _context.Variantes.Add(variante);
        await _context.SaveChangesAsync();

        return variante;
    }
    
    public async Task<Variante> UpdateAsync(Guid id, VarianteDto dto)
    {
        var variante = await _context.Variantes
            .Include(v => v.Opciones)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (variante == null) return null;

        variante.Name = dto.Name;
        variante.Obligatorio = dto.Obligatorio;
        variante.MaxSeleccion = dto.MaxSeleccion ?? 1;
        variante.CategoriaId = dto.CategoriaId;

        // Update options
        _context.VarianteOpciones.RemoveRange(variante.Opciones);
        variante.Opciones = dto.Opciones?.Select(op => new VarianteOpcion
        {
            Id = op.Id,
            Nombre = op.Nombre,
            Precio = op.Precio
        }).ToList() ?? new List<VarianteOpcion>();

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