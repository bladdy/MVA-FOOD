using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MVA_FOOD.Infrastructure.Services
{
    public class MesaService : IMesaService
    {
        private readonly AppDbContext _context;

        public MesaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MesaDto>> GetAllAsync()
        {
            return await _context.Mesas
                .Include(m => m.Restaurante)
                .Select(m => new MesaDto
                {
                    Id = m.Id,
                    Codigo = m.Codigo,
                    Capacidad = m.Capacidad,
                    RestauranteId = m.RestauranteId,
                    RestauranteNombre = m.Restaurante.Name
                }).ToListAsync();
        }

        public async Task<MesaDto> GetByIdAsync(Guid id)
        {
            var mesa = await _context.Mesas.Include(m => m.Restaurante).FirstOrDefaultAsync(m => m.Id == id);
            if (mesa == null) return null;

            return new MesaDto
            {
                Id = mesa.Id,
                Codigo = mesa.Codigo,
                Capacidad = mesa.Capacidad,
                RestauranteId = mesa.RestauranteId,
                RestauranteNombre = mesa.Restaurante.Name
            };
        }

        public async Task<MesaDto> CreateAsync(MesaCreateDto dto)
        {
            var mesa = new Mesa
            {
                Codigo = dto.Codigo,
                Capacidad = dto.Capacidad,
                RestauranteId = dto.RestauranteId
            };

            _context.Mesas.Add(mesa);
            await _context.SaveChangesAsync();

            var restaurante = await _context.Restaurantes.FindAsync(dto.RestauranteId);

            return new MesaDto
            {
                Id = mesa.Id,
                Codigo = mesa.Codigo,
                Capacidad = mesa.Capacidad,
                RestauranteId = mesa.RestauranteId,
                RestauranteNombre = restaurante?.Name ?? ""
            };
        }

        public async Task<bool> UpdateAsync(Guid id, MesaUpdateDto dto)
        {
            var mesa = await _context.Mesas.FindAsync(id);
            if (mesa == null) return false;

            mesa.Numero = dto.Numero;
            mesa.EstaOcupada = dto.EstaOcupada;
            mesa.Codigo = dto.Codigo;
            mesa.Capacidad = dto.Capacidad;
            mesa.RestauranteId = dto.RestauranteId;

            _context.Mesas.Update(mesa);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var mesa = await _context.Mesas.FindAsync(id);
            if (mesa == null) return false;

            _context.Mesas.Remove(mesa);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
