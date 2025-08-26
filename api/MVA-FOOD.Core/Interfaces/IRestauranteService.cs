using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Wrappers;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IRestauranteService
    {
        Task<PagedResult<RestauranteDto>> GetAllAsync(RestauranteFilter filter);
        Task<IEnumerable<RestauranteDto>> GetAllAsync();
        Task<RestauranteDto> GetByIdAsync(Guid id);
        Task<RestauranteDto> CreateAsync(CrearRestauranteDto dto);
        Task<bool> DeleteAsync(Guid id);
        
    }
}