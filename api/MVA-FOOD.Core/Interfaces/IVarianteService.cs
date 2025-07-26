using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IVarianteService
    {
        Task<List<Variante>> GetAllAsync();
        Task<Variante> GetByIdAsync(Guid id);
        Task<Variante> CreateAsync(VarianteDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}