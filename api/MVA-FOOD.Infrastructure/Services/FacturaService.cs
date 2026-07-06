using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;

namespace MVA_FOOD.Infrastructure.Services
{
    public class FacturaService : IFacturaService
    {
        private readonly AppDbContext _context;
        private readonly IStripePaymentService _stripePaymentService;
        private readonly ILogger<FacturaService> _logger;

        public FacturaService(AppDbContext context, IStripePaymentService stripePaymentService, ILogger<FacturaService> logger)
        {
            _context = context;
            _stripePaymentService = stripePaymentService;
            _logger = logger;
        }

        public async Task<List<FacturaDto>> GetByRestauranteAsync(Guid restauranteId)
        {
            var facturas = await _context.Facturas
                .Include(f => f.PlanRestaurante).ThenInclude(pr => pr.Plan)
                .Where(f => f.RestauranteId == restauranteId)
                .OrderByDescending(f => f.FechaEmision)
                .ToListAsync();

            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            return facturas.Select(f => MapToDto(f, moneda)).ToList();
        }

        public async Task<FacturaDetalleDto?> GetByIdAsync(Guid id)
        {
            var factura = await _context.Facturas
                .Include(f => f.PlanRestaurante).ThenInclude(pr => pr.Plan)
                .Include(f => f.Restaurante)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (factura == null) return null;

            var moneda = MonedaHelper.PaisToMoneda(factura.Restaurante?.Pais ?? "DO");

            return MapToDetalleDto(factura, moneda);
        }

        public async Task<Factura> CrearFacturaAsync(Guid restauranteId, Guid planRestauranteId, decimal monto, string concepto)
        {
            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var count = await _context.Facturas.CountAsync(f => f.RestauranteId == restauranteId);
            var numeroFactura = $"FAC-{restauranteId.ToString("N")[..8].ToUpper()}-{count + 1:D4}";

            var factura = new Factura
            {
                RestauranteId = restauranteId,
                PlanRestauranteId = planRestauranteId,
                NumeroFactura = numeroFactura,
                Monto = monto,
                FechaEmision = DateTime.UtcNow,
                Pagado = false,
                Concepto = concepto,
                Moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO")
            };

            _context.Facturas.Add(factura);
            await _context.SaveChangesAsync();
            return factura;
        }

        public async Task<bool> MarcarPagadaAsync(Guid id, string? paymentIntentId = null)
        {
            var factura = await _context.Facturas.FindAsync(id);
            if (factura == null || factura.Pagado) return false;

            factura.Pagado = true;
            factura.FechaPago = DateTime.UtcNow;
            if (paymentIntentId != null)
                factura.StripePaymentIntentId = paymentIntentId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ProcesarPagoFacturaAsync(string sessionId)
        {
            try
            {
                var verification = await _stripePaymentService.VerifyCheckoutSessionAsync(sessionId);

                if (!verification.IsPaid)
                    return false;

                if (string.IsNullOrEmpty(verification.FacturaId))
                {
                    _logger.LogWarning("ProcesarPagoFactura: session {SessionId} no tiene facturaId en metadata", sessionId);
                    return false;
                }

                var facturaGuid = Guid.Parse(verification.FacturaId);
                return await MarcarPagadaAsync(facturaGuid, sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando pago de factura para session {SessionId}", sessionId);
                return false;
            }
        }

        public async Task<byte[]> GenerarPdfAsync(Guid id)
        {
            var factura = await _context.Facturas
                .Include(f => f.PlanRestaurante).ThenInclude(pr => pr.Plan)
                .Include(f => f.Restaurante)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (factura == null) throw new KeyNotFoundException("Factura no encontrada");

            return FacturaPdfGenerator.Generate(factura);
        }

        private static FacturaDto MapToDto(Factura f, string moneda)
        {
            return new FacturaDto
            {
                Id = f.Id,
                RestauranteId = f.RestauranteId,
                NumeroFactura = f.NumeroFactura,
                Monto = f.Monto,
                FechaEmision = f.FechaEmision,
                FechaPago = f.FechaPago,
                Pagado = f.Pagado,
                Concepto = f.Concepto,
                PdfPath = f.PdfPath,
                PlanNombre = f.PlanRestaurante?.Plan?.Nombre ?? "",
                Periodo = $"{f.PlanRestaurante?.FechaInicio:dd/MM/yyyy} - {f.PlanRestaurante?.FechaFin:dd/MM/yyyy}",
                Moneda = moneda
            };
        }

        private static FacturaDetalleDto MapToDetalleDto(Factura f, string moneda)
        {
            return new FacturaDetalleDto
            {
                Id = f.Id,
                RestauranteId = f.RestauranteId,
                NumeroFactura = f.NumeroFactura,
                Monto = f.Monto,
                FechaEmision = f.FechaEmision,
                FechaPago = f.FechaPago,
                Pagado = f.Pagado,
                Concepto = f.Concepto,
                PdfPath = f.PdfPath,
                PlanNombre = f.PlanRestaurante?.Plan?.Nombre ?? "",
                Periodo = $"{f.PlanRestaurante?.FechaInicio:dd/MM/yyyy} - {f.PlanRestaurante?.FechaFin:dd/MM/yyyy}",
                Moneda = moneda,
                StripePaymentIntentId = f.StripePaymentIntentId,
                RestauranteNombre = f.Restaurante?.Name ?? "",
                RestauranteDireccion = f.Restaurante?.Direccion ?? ""
            };
        }
    }
}
