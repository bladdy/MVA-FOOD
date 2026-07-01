using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class MetodoPagoService : IMetodoPagoService
    {
        private readonly AppDbContext _context;

        public MetodoPagoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MetodoPagoDto>> GetAllAsync(Guid restauranteId)
        {
            return await _context.MetodosPagoRestaurante
                .Where(m => m.RestauranteId == restauranteId)
                .OrderBy(m => m.Nombre)
                .Select(m => MapToDto(m))
                .ToListAsync();
        }

        public async Task<MetodoPagoDto?> GetByIdAsync(Guid id)
        {
            var entity = await _context.MetodosPagoRestaurante.FindAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<MetodoPagoDto> CreateAsync(Guid restauranteId, CrearMetodoPagoDto dto)
        {
            var entity = new MetodoPagoRestaurante
            {
                RestauranteId = restauranteId,
                Nombre = dto.Nombre,
                Icono = dto.Icono,
                Activo = dto.Activo
            };

            _context.MetodosPagoRestaurante.Add(entity);
            await _context.SaveChangesAsync();
            return MapToDto(entity);
        }

        public async Task<MetodoPagoDto?> UpdateAsync(Guid id, CrearMetodoPagoDto dto)
        {
            var entity = await _context.MetodosPagoRestaurante.FindAsync(id);
            if (entity == null) return null;

            entity.Nombre = dto.Nombre;
            entity.Icono = dto.Icono;
            entity.Activo = dto.Activo;

            await _context.SaveChangesAsync();
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.MetodosPagoRestaurante.FindAsync(id);
            if (entity == null) return false;

            _context.MetodosPagoRestaurante.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static MetodoPagoDto MapToDto(MetodoPagoRestaurante m)
        {
            return new MetodoPagoDto
            {
                Id = m.Id,
                RestauranteId = m.RestauranteId,
                Nombre = m.Nombre,
                Icono = m.Icono,
                Activo = m.Activo
            };
        }
    }
}
