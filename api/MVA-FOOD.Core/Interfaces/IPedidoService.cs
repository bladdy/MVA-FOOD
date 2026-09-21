using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Wrappers;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IPedidoService
    {
        Task<List<Pedido>> GetAllAsync(Guid? restauranteId = null);
        Task<PagedResult<Pedido>> GetHistorialAsync(PedidoFilters filters);
        Task<Pedido> GetByIdAsync(Guid id);
        Task<Pedido> GetByIdSignalRAsync(Guid id);
        Task<List<Pedido>> GetByMesaAsync(Guid mesaId);
        Task<Pedido> CreateAsync(PedidoDto dto);
        Task<bool> UpdateEstadoAsync(Guid id, Estado estado);
        Task<(bool success, bool promovido)> UpdateItemEstadoAsync(Guid pedidoId, Guid itemId, Estado estado);
        Task<bool> DeleteAsync(Guid id);
    }
}