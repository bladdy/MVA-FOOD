using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface ICategoriaService
    {
        Task<IEnumerable<CategoriaDto>> GetAllAsync();
        Task<CategoriaDto> GetByIdAsync(Guid id);
        Task<CategoriaDto> CreateAsync(CategoriaCreateDto dto);
        Task<bool> UpdateAsync(Guid id, CategoriaUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}