using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IHorarioService
    {
        Task<IEnumerable<HorarioDto>> GetAllAsync();
        Task<HorarioDto> GetByIdAsync(Guid id);
        Task<HorarioDto> CreateAsync(HorarioCreateDto dto);
        Task<bool> UpdateAsync(Guid id, HorarioUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}