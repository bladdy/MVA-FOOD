using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IFacturaVentaService
    {
        Task<List<FacturaVentaDto>> GetByRestauranteAsync(Guid restauranteId, EstadoFacturaVenta? estado = null);
        Task<FacturaVentaDetalleDto?> GetByIdAsync(Guid id);
        Task<List<PedidoFacturableDto>> GetPedidosFacturablesAsync(Guid restauranteId);
        Task<ConfigFacturacionDto> ObtenerConfiguracionAsync(Guid restauranteId);

        /// <param name="estadoInicial">
        /// Estado con el que nace la factura. <see cref="EstadoFacturaVenta.PendienteCobro"/> la
        /// envía el mesero a caja sin cobrar; <see cref="EstadoFacturaVenta.Pagada"/> la emite
        /// mostrador con el cliente pagando en el acto.
        /// </param>
        Task<FacturaVentaDetalleDto?> CrearDesdePedidoAsync(
            Guid restauranteId,
            CrearFacturaVentaDto dto,
            EstadoFacturaVenta estadoInicial = EstadoFacturaVenta.Emitida,
            Guid? usuarioCajaId = null,
            string? usuarioCajaNombre = null);

        Task<FacturaVentaDetalleDto?> CrearVentaRapidaAsync(
            Guid restauranteId,
            CrearFacturaVentaDto dto,
            Guid? usuarioCajaId = null,
            string? usuarioCajaNombre = null);

        Task<bool> AnularAsync(Guid id, string motivo);

        /// <summary>Caja confirma el cobro de una factura <see cref="EstadoFacturaVenta.PendienteCobro"/>.</summary>
        Task<FacturaVentaDetalleDto?> MarcarPagadaAsync(
            Guid id,
            PagarFacturaVentaDto dto,
            Guid usuarioCajaId,
            string? usuarioCajaNombre);

        Task<ResumenFacturacionHoyDto> GetResumenHoyAsync(Guid restauranteId);
        Task<ReporteVentasDto> GetReporteVentasAsync(Guid restauranteId, RangoReporteVentas rango);
    }
}
