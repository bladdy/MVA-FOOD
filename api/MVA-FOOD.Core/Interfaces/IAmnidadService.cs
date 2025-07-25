using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IAmenidadService
    {
        Task<IEnumerable<AmenidadDto>> GetAllAsync();
        Task<AmenidadDto> GetByIdAsync(Guid id);
        Task<AmenidadDto> CreateAsync(CreateAmenidadDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}