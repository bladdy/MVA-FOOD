
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class PlanService : IPlanService
    {
        private readonly AppDbContext _context;

        public PlanService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PlanDto>> ObtenerPlanesAsync()
        {
            return await _context.Planes
                .Select(plan => new PlanDto
                {
                    Id = plan.Id,
                    Nombre = plan.Nombre,
                    Precio = plan.Precio,
                    DuracionDias = plan.DuracionDias
                })
                .ToListAsync();
        }

        public async Task<PlanDto> CrearPlanAsync(CrearPlanDto dto)
        {
            var plan = new Plan
            {
                Nombre = dto.Nombre,
                Precio = dto.Precio,
                DuracionDias = dto.DuracionDias
            };

            _context.Planes.Add(plan);
            await _context.SaveChangesAsync();

            var planDto = new PlanDto
            {
                Id = plan.Id,
                Nombre = plan.Nombre,
                Precio = plan.Precio,
                DuracionDias = plan.DuracionDias
            };

            return planDto;
        }

        public async Task<PlanRestaurante> ContratarPlanAsync(ContratarPlanDto dto)
        {
            var plan = await _context.Planes.FindAsync(dto.PlanId);

            if (plan == null)
                throw new Exception("Plan no encontrado");

            var fechaFin = dto.FechaInicio.AddDays(plan.DuracionDias);

            var contratacion = new PlanRestaurante
            {
                RestauranteId = dto.RestauranteId,
                PlanId = dto.PlanId,
                FechaInicio = dto.FechaInicio,
                FechaFin = fechaFin,
                Pagado = false
            };

            _context.PlanesRestaurantes.Add(contratacion);
            await _context.SaveChangesAsync();

            return contratacion;
        }

        public async Task MarcarComoPagadoAsync(Guid idPlanRestaurante)
        {
            var item = await _context.PlanesRestaurantes.FindAsync(idPlanRestaurante);

            if (item == null)
                throw new Exception("Registro de plan no encontrado");

            item.Pagado = true;
            await _context.SaveChangesAsync();
        }
    }

}