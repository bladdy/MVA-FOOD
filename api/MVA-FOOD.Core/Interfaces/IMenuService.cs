using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuDto>> GetAllAsync();
        Task<MenuDto> GetByIdAsync(Guid id);
        Task<MenuDto> CreateAsync(MenuCreateDto dto);
        Task<bool> UpdateAsync(Guid id, MenuUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}