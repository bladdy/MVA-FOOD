using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IMetodoPagoService
    {
        Task<List<MetodoPagoDto>> GetAllAsync(Guid restauranteId);
        Task<MetodoPagoDto?> GetByIdAsync(Guid id);
        Task<MetodoPagoDto> CreateAsync(Guid restauranteId, CrearMetodoPagoDto dto);
        Task<MetodoPagoDto?> UpdateAsync(Guid id, CrearMetodoPagoDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
