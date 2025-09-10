using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class HorarioService : IHorarioService
    {
        private readonly AppDbContext _context;

        public HorarioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HorarioDto>> GetAllAsync()
        {
            return await _context.Horarios
                .Include(h => h.Restaurante)
                .Select(h => new HorarioDto
                {
                    
                    Dia = h.Dia,
                    HoraApertura = h.HoraApertura,
                    HoraCierre = h.HoraCierre
                }).ToListAsync();
        }

        public async Task<HorarioDto> GetByIdAsync(Guid id)
        {
            var horario = await _context.Horarios.Include(h => h.Restaurante).FirstOrDefaultAsync(h => h.Id == id);
            if (horario == null) return null;

            return new HorarioDto
            {
                
                Dia = horario.Dia,
                HoraApertura = horario.HoraApertura,
                HoraCierre = horario.HoraCierre
            };
        }

        public async Task<HorarioDto> CreateAsync(HorarioCreateDto dto)
        {
            var horario = new Horario
            {
                RestauranteId = dto.RestauranteId,
                Dia = dto.Dia,
                HoraApertura = dto.HoraApertura,
                HoraCierre = dto.HoraCierre
            };

            _context.Horarios.Add(horario);
            await _context.SaveChangesAsync();

            var restaurante = await _context.Restaurantes.FindAsync(dto.RestauranteId);

            return new HorarioDto
            {
                
                Dia = horario.Dia,
                HoraApertura = horario.HoraApertura,
                HoraCierre = horario.HoraCierre
            };
        }

        public async Task<bool> UpdateAsync(Guid id, HorarioUpdateDto dto)
        {
            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null) return false;

            horario.Dia = dto.Dia;
            horario.HoraApertura = dto.HoraApertura;
            horario.HoraCierre = dto.HoraCierre;

            _context.Horarios.Update(horario);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var horario = await _context.Horarios.FindAsync(id);
            if (horario == null) return false;

            _context.Horarios.Remove(horario);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
