using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IPropinaService
    {
        Task<ConfigPropinaDto> ObtenerConfigAsync(Guid restauranteId);
        Task<ConfigPropinaDto> GuardarConfigAsync(Guid restauranteId, ConfigPropinaDto dto);
        Task<ResumenPropinaDto> ObtenerResumenAsync(Guid restauranteId, DateTime desde, DateTime hasta);
        Task<PagoPropinaDto> PagarAsync(Guid restauranteId, PagarPropinaDto dto, Guid usuarioId, string? usuarioNombre);
        Task<List<PagoPropinaDto>> ObtenerHistorialAsync(Guid restauranteId);
        Task<PagoPropinaDto?> ObtenerDetalleAsync(Guid id, Guid restauranteId);
    }
}