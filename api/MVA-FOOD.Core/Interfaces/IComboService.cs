using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IComboService
    {
        Task<List<ComboDto>> GetAllAsync(Guid? restauranteId = null);
        Task<ComboDto> GetByIdAsync(Guid id);
        Task<ComboDto> CreateAsync(ComboCreateDto dto);
        Task<ComboDto> UpdateAsync(Guid id, ComboCreateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
