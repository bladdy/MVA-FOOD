using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class TipoEntregaService : ITipoEntregaService
    {
        private readonly AppDbContext _context;

        public TipoEntregaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TipoEntregaDto>> GetAllAsync(Guid restauranteId)
        {
            return await _context.TiposEntregaRestaurante
                .Where(t => t.RestauranteId == restauranteId)
                .OrderBy(t => t.Nombre)
                .Select(t => MapToDto(t))
                .ToListAsync();
        }

        public async Task<TipoEntregaDto?> GetByIdAsync(Guid id)
        {
            var entity = await _context.TiposEntregaRestaurante.FindAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<TipoEntregaDto> CreateAsync(Guid restauranteId, CrearTipoEntregaDto dto)
        {
            var entity = new TipoEntregaRestaurante
            {
                RestauranteId = restauranteId,
                Nombre = dto.Nombre,
                TiempoMinutos = dto.TiempoMinutos,
                CostoFijo = dto.CostoFijo,
                Porcentaje = dto.Porcentaje,
                Activo = dto.Activo
            };

            _context.TiposEntregaRestaurante.Add(entity);
            await _context.SaveChangesAsync();
            return MapToDto(entity);
        }

        public async Task<TipoEntregaDto?> UpdateAsync(Guid id, CrearTipoEntregaDto dto)
        {
            var entity = await _context.TiposEntregaRestaurante.FindAsync(id);
            if (entity == null) return null;

            entity.Nombre = dto.Nombre;
            entity.TiempoMinutos = dto.TiempoMinutos;
            entity.CostoFijo = dto.CostoFijo;
            entity.Porcentaje = dto.Porcentaje;
            entity.Activo = dto.Activo;

            await _context.SaveChangesAsync();
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.TiposEntregaRestaurante.FindAsync(id);
            if (entity == null) return false;

            _context.TiposEntregaRestaurante.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static TipoEntregaDto MapToDto(TipoEntregaRestaurante t)
        {
            return new TipoEntregaDto
            {
                Id = t.Id,
                RestauranteId = t.RestauranteId,
                Nombre = t.Nombre,
                TiempoMinutos = t.TiempoMinutos,
                CostoFijo = t.CostoFijo,
                Porcentaje = t.Porcentaje,
                Activo = t.Activo
            };
        }
    }
}
