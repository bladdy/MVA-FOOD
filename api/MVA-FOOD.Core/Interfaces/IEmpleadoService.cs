using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IEmpleadoService
    {
        Task<IEnumerable<EmpleadoDto>> GetAllAsync();
        Task<EmpleadoDto> GetByIdAsync(Guid id);
        Task<EmpleadoDto> CreateAsync(EmpleadoCreateDto dto);
        Task<bool> UpdateAsync(Guid id, EmpleadoUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}