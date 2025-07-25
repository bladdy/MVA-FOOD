using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IMesaService
    {
        Task<IEnumerable<MesaDto>> GetAllAsync();
        Task<MesaDto> GetByIdAsync(Guid id);
        Task<MesaDto> CreateAsync(MesaCreateDto dto);
        Task<bool> UpdateAsync(Guid id, MesaUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}