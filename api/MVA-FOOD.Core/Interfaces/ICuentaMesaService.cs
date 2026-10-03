using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface ICuentaMesaService
    {
        Task<CuentaMesaDetalleDto?> GetByMesaAsync(Guid mesaId);
        Task<List<CuentaMesaDetalleDto>> GetByRestauranteAsync(Guid restauranteId, bool soloAbiertas = false);
        Task<CuentaMesaDetalleDto> AbrirAsync(Guid restauranteId, Guid mesaId);
        Task<ValidarCierreResponseDto> ValidarCierreAsync(Guid cuentaMesaId);
        Task<CerrarCuentaResponseDto> CerrarAsync(Guid mesaId, CerrarCuentaMesaDto dto);
        Task<bool> LiberarMesaAsync(Guid mesaId);
    }
}
