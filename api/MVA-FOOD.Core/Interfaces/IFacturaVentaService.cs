using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IFacturaVentaService
    {
        Task<List<FacturaVentaDto>> GetByRestauranteAsync(Guid restauranteId);
        Task<FacturaVentaDetalleDto?> GetByIdAsync(Guid id);
        Task<List<PedidoFacturableDto>> GetPedidosFacturablesAsync(Guid restauranteId);
        Task<ConfigFacturacionDto> ObtenerConfiguracionAsync(Guid restauranteId);
        Task<FacturaVentaDetalleDto?> CrearDesdePedidoAsync(Guid restauranteId, CrearFacturaVentaDto dto);
        Task<FacturaVentaDetalleDto?> CrearVentaRapidaAsync(Guid restauranteId, CrearFacturaVentaDto dto);
        Task<bool> AnularAsync(Guid id, string motivo);
        Task<ResumenFacturacionHoyDto> GetResumenHoyAsync(Guid restauranteId);
        Task<ReporteVentasDto> GetReporteVentasAsync(Guid restauranteId, RangoReporteVentas rango);
    }
}
