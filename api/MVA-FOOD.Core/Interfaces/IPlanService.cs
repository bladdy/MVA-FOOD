using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IPlanService
    {
        Task<List<PlanDto>> ObtenerPlanesAsync();
        Task<PlanDto> CrearPlanAsync(CrearPlanDto dto);
        Task<PlanRestaurante> ContratarPlanAsync(ContratarPlanDto dto);
        Task MarcarComoPagadoAsync(Guid idPlanRestaurante);
    }
}