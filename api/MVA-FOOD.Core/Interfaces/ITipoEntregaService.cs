using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface ITipoEntregaService
    {
        Task<List<TipoEntregaDto>> GetAllAsync(Guid restauranteId);
        Task<TipoEntregaDto?> GetByIdAsync(Guid id);
        Task<TipoEntregaDto> CreateAsync(Guid restauranteId, CrearTipoEntregaDto dto);
        Task<TipoEntregaDto?> UpdateAsync(Guid id, CrearTipoEntregaDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
