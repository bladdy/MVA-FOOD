using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MVA_FOOD.Infrastructure.Services
{
    public class AmenidadService : IAmenidadService
    {
        private readonly AppDbContext _context;

        public AmenidadService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AmenidadDto>> GetAllAsync()
        {
            var amenidades = await _context.Amenidades.ToListAsync();

            return amenidades.Select(a => new AmenidadDto
            {
                Id = a.Id,
                Nombre = a.Nombre
            });
        }

        public async Task<AmenidadDto> GetByIdAsync(Guid id)
        {
            var amenidad = await _context.Amenidades.FindAsync(id);
            if (amenidad == null) return null;

            return new AmenidadDto
            {
                Id = amenidad.Id,
                Nombre = amenidad.Nombre
            };
        }

        public async Task<AmenidadDto> CreateAsync(CreateAmenidadDto dto)
        {
            var nuevaAmenidad = new Amenidad
            {
                Nombre = dto.Nombre,
                Svg = dto.Svg
            };

            _context.Amenidades.Add(nuevaAmenidad);
            await _context.SaveChangesAsync();

            return new AmenidadDto
            {
                Id = nuevaAmenidad.Id,
                Nombre = nuevaAmenidad.Nombre,
                Svg = nuevaAmenidad.Svg
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existente = await _context.Amenidades.FindAsync(id);
            if (existente == null) return false;

            _context.Amenidades.Remove(existente);
            await _context.SaveChangesAsync();

            return true;
        }

    }

}
