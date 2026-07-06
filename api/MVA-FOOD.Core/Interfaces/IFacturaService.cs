using MVA_FOOD.Core.DTOs;

namespace MVA_FOOD.Core.Interfaces
{
    public interface IFacturaService
    {
        Task<List<FacturaDto>> GetByRestauranteAsync(Guid restauranteId);
        Task<FacturaDetalleDto?> GetByIdAsync(Guid id);
        Task<Core.Entities.Factura> CrearFacturaAsync(Guid restauranteId, Guid planRestauranteId, decimal monto, string concepto);
        Task<bool> MarcarPagadaAsync(Guid id, string? paymentIntentId = null);
        Task<bool> ProcesarPagoFacturaAsync(string sessionId);
        Task<byte[]> GenerarPdfAsync(Guid id);
    }
}
