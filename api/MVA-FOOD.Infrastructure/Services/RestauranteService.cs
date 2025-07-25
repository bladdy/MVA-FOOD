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
    public class RestauranteService : IRestauranteService
    {
        private readonly AppDbContext _context;

        public RestauranteService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RestauranteDto>> GetAllAsync()
        {
            return await _context.Restaurantes
                .Select(r => new RestauranteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Image = r.Image,
                    PerfilImage = r.PerfilImage,
                    Direccion = r.Direccion,
                    Phone = r.Phone,
                    PlanId = r.PlanRestauranteId
                }).ToListAsync();
        }

        public async Task<RestauranteDto> GetByIdAsync(Guid id)
        {
            var r = await _context.Restaurantes.FindAsync(id);
            if (r == null) return null;

            return new RestauranteDto
            {
                Id = r.Id,
                Name = r.Name,
                Image = r.Image,
                PerfilImage = r.PerfilImage,
                Direccion = r.Direccion,
                Phone = r.Phone,
                PlanId = r.PlanRestauranteId
            };
        }

        public async Task<RestauranteDto> CreateAsync(CrearRestauranteDto dto)
        {
            var restaurante = new Restaurante
            {
                Name = dto.Nombre,
                Direccion = dto.Direccion,
                Phone = dto.Telefono,
                Image = dto.Image,
                PerfilImage = dto.PerfilImage,
                PlanRestauranteId = dto.PlanId
            };

            _context.Restaurantes.Add(restaurante);
            await _context.SaveChangesAsync();

            // buscar el plan
            var plan = await _context.Planes.FindAsync(dto.PlanId);
            if (plan == null)
                throw new Exception("Plan no encontrado");

            var fechaInicio = DateTime.UtcNow;
            var fechaFin = fechaInicio.AddMonths(1); // ejemplo, 1 mes de duración

            var planRestaurante = new PlanRestaurante
            {
                RestauranteId = restaurante.Id,
                PlanId = plan.Id,
                FechaInicio = fechaInicio,
                FechaFin = fechaFin,
                Pagado = false
            };

            _context.PlanesRestaurantes.Add(planRestaurante);
            await _context.SaveChangesAsync();

            return new RestauranteDto
            {
                Id = restaurante.Id,
                Name = restaurante.Name,
                Image = restaurante.Image,
                PerfilImage = restaurante.PerfilImage,
                Direccion = restaurante.Direccion,
                Phone = restaurante.Phone,
                PlanId = dto.PlanId
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var r = await _context.Restaurantes.FindAsync(id);
            if (r == null) return false;

            _context.Restaurantes.Remove(r);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}