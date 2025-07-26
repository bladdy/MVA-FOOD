
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IPedidoService
    {
        Task<List<Pedido>> GetAllAsync();
        Task<Pedido> GetByIdAsync(Guid id);
        Task<Pedido> CreateAsync(PedidoDto dto);
        Task<bool> UpdateEstadoAsync(Guid id, Estado estado);
        Task<bool> CambiarMesaAsync(Guid pedidoId, Guid nuevaMesaId);
        Task<bool> DeleteAsync(Guid id);
    }
}