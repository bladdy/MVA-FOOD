using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Wrappers;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IVarianteService
    {
        Task<PagedResult<Variante>> GetAllAsync(VarianteFilters filters);
        Task<Variante> GetByIdAsync(Guid id);
        Task<Variante> CreateAsync(VarianteDto dto);
        Task<Variante> UpdateAsync(Guid id, VarianteDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}