using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IPlanService
    {
        Task<List<PlanDto>> ObtenerPlanesAsync(Guid? restauranteId = null);
        Task<PlanDto> CrearPlanAsync(CrearPlanDto dto);
        Task<PlanRestaurante> ContratarPlanAsync(ContratarPlanDto dto);
        Task<CrearCheckoutResponseDto> CrearCheckoutSessionAsync(CrearCheckoutDto dto);
        Task<bool> ProcesarCheckoutExitosoAsync(string sessionId);
        Task<PlanRestaurante?> ObtenerPlanActivoAsync(Guid restauranteId);
        Task<Core.Entities.Restaurante?> GetRestauranteAsync(Guid id);
        Task<DashboardInfoDto> GetDashboardInfoAsync(Guid restauranteId);
    }
}
