using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Wrappers;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IMenuService
    {
        Task<PagedResult<MenuDto>> GetAllAsync(MenuFilter filter);
        Task<MenuDto> GetByIdAsync(Guid id);
        Task<MenuDto> CreateAsync(MenuCreateDto dto);
        Task<MenuDto> UpdateAsync(Guid id, MenuUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}