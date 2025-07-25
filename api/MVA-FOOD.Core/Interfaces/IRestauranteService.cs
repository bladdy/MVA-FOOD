using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IRestauranteService
    {
        Task<IEnumerable<RestauranteDto>> GetAllAsync();
        Task<RestauranteDto> GetByIdAsync(Guid id);
        Task<RestauranteDto> CreateAsync(CreateRestauranteDto dto);
        Task<bool> DeleteAsync(Guid id);
        
    }
}