using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;
using MVA_FOOD.Infrastructure.Data;
using MVA_FOOD.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MVA_FOOD.Infrastructure.Services
{
    public class PlanService : IPlanService
    {
        private readonly AppDbContext _context;
        private readonly IStripePaymentService _stripePaymentService;
        private readonly ITipoCambioService _tipoCambioService;
        private readonly IFacturaService _facturaService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PlanService> _logger;

        public PlanService(AppDbContext context, IStripePaymentService stripePaymentService, ITipoCambioService tipoCambioService, IFacturaService facturaService, IConfiguration configuration, ILogger<PlanService> logger)
        {
            _context = context;
            _stripePaymentService = stripePaymentService;
            _tipoCambioService = tipoCambioService;
            _facturaService = facturaService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<List<PlanDto>> ObtenerPlanesAsync(Guid? restauranteId = null)
        {
            var moneda = "USD";
            decimal tasa = 1m;

            if (restauranteId.HasValue)
            {
                var rest = await _context.Restaurantes.FindAsync(restauranteId.Value);
                if (rest != null)
                {
                    moneda = MonedaHelper.PaisToMoneda(rest.Pais);
                    tasa = await _tipoCambioService.GetTasaUsdAsync(moneda);
                }
            }

            return await _context.Planes
                .Select(plan => new PlanDto
                {
                    Id = plan.Id,
                    Nombre = plan.Nombre,
                    Precio = Math.Round(plan.Precio * tasa, 2),
                    DuracionDias = plan.DuracionDias,
                    StripePriceId = plan.StripePriceId,
                    Moneda = moneda
                })
                .ToListAsync();
        }

        public async Task<PlanDto> CrearPlanAsync(CrearPlanDto dto)
        {
            var plan = new Plan
            {
                Nombre = dto.Nombre,
                Precio = dto.Precio,
                DuracionDias = dto.DuracionDias
            };

            _context.Planes.Add(plan);
            await _context.SaveChangesAsync();

            return new PlanDto
            {
                Id = plan.Id,
                Nombre = plan.Nombre,
                Precio = plan.Precio,
                DuracionDias = plan.DuracionDias
            };
        }

        public async Task<PlanRestaurante> ContratarPlanAsync(ContratarPlanDto dto)
        {
            var plan = await _context.Planes.FindAsync(dto.PlanId);

            if (plan == null)
                throw new Exception("Plan no encontrado");

            var fechaFin = dto.FechaInicio.AddDays(plan.DuracionDias);

            var contratacion = new PlanRestaurante
            {
                RestauranteId = dto.RestauranteId,
                PlanId = dto.PlanId,
                FechaInicio = dto.FechaInicio,
                FechaFin = fechaFin,
                FechaPago = DateTime.UtcNow,
                Pagado = false,
                Estado = "Activo"
            };

            _context.PlanesRestaurantes.Add(contratacion);
            await _context.SaveChangesAsync();

            return contratacion;
        }

        public async Task<CrearCheckoutResponseDto> CrearCheckoutSessionAsync(CrearCheckoutDto dto)
        {
            var nuevoPlan = await _context.Planes.FindAsync(dto.NuevoPlanId);
            if (nuevoPlan == null)
                throw new Exception("Plan no encontrado");

            var rest = await _context.Restaurantes.FindAsync(dto.RestauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");
            var tasa = await _tipoCambioService.GetTasaUsdAsync(moneda);
            var montoLocal = Math.Round(nuevoPlan.Precio * tasa, 2);

            var successUrl = _configuration["Stripe:SuccessUrl"]
                ?? "http://localhost:5147/api/Plan/checkout-success?session_id={CHECKOUT_SESSION_ID}";
            var cancelUrl = _configuration["Stripe:CancelUrl"]
                ?? "http://localhost:4321/admin/facturacion/planes";

            var sessionResult = await _stripePaymentService.CreateCheckoutSessionAsync(
                montoLocal,
                moneda,
                $"Plan {nuevoPlan.Nombre}",
                successUrl,
                cancelUrl,
                new Dictionary<string, string>
                {
                    { "restauranteId", dto.RestauranteId.ToString() },
                    { "planId", dto.NuevoPlanId.ToString() },
                    { "monto", montoLocal.ToString() },
                    { "moneda", moneda }
                });

            return new CrearCheckoutResponseDto
            {
                CheckoutUrl = sessionResult.Url,
                SessionId = sessionResult.SessionId
            };
        }

        public async Task<bool> ProcesarCheckoutExitosoAsync(string sessionId)
        {
            try
            {
                var verification = await _stripePaymentService.VerifyCheckoutSessionAsync(sessionId);

                if (!verification.IsPaid)
                    return false;

                if (string.IsNullOrEmpty(verification.RestauranteId) || string.IsNullOrEmpty(verification.PlanId))
                    return false;

                var restauranteId = Guid.Parse(verification.RestauranteId);
                var planId = Guid.Parse(verification.PlanId);
                var monto = decimal.Parse(verification.Monto ?? "0");
                var moneda = verification.Moneda ?? "DOP";

                // Si ya fue procesado (webhook race), devolver éxito
                var facturaExistente = await _context.Facturas
                    .FirstOrDefaultAsync(f => f.StripePaymentIntentId == sessionId);
                if (facturaExistente != null)
                    return facturaExistente.Pagado;

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Buscar plan activo existente para actualizar
                    var planActivo = await _context.PlanesRestaurantes
                        .Include(pr => pr.Plan)
                        .FirstOrDefaultAsync(pr => pr.RestauranteId == restauranteId && pr.Estado == "Activo");

                    var nuevoPlan = await _context.Planes.FindAsync(planId);
                    if (nuevoPlan == null)
                    {
                        await transaction.RollbackAsync();
                        return false;
                    }

                    PlanRestaurante planResultante;

                    if (planActivo != null)
                    {
                        planActivo.PlanId = planId;
                        planActivo.FechaInicio = DateTime.UtcNow;
                        planActivo.FechaFin = DateTime.UtcNow.AddDays(nuevoPlan.DuracionDias);
                        planActivo.FechaPago = DateTime.UtcNow;
                        planActivo.Pagado = true;
                        planActivo.Estado = "Activo";
                        planResultante = planActivo;
                    }
                    else
                    {
                        planResultante = new PlanRestaurante
                        {
                            RestauranteId = restauranteId,
                            PlanId = planId,
                            FechaInicio = DateTime.UtcNow,
                            FechaFin = DateTime.UtcNow.AddDays(nuevoPlan.DuracionDias),
                            FechaPago = DateTime.UtcNow,
                            Pagado = true,
                            Estado = "Activo"
                        };
                        _context.PlanesRestaurantes.Add(planResultante);
                    }

                    await _context.SaveChangesAsync();

                    var factura = await _facturaService.CrearFacturaAsync(
                        restauranteId,
                        planResultante.Id,
                        monto,
                        $"Plan {nuevoPlan.Nombre}");

                    factura.Pagado = true;
                    factura.FechaPago = DateTime.UtcNow;
                    factura.StripePaymentIntentId = sessionId;
                    factura.Moneda = moneda;
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return true;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error procesando checkout exitoso para session {SessionId}", sessionId);
                return false;
            }
        }

        public async Task<PlanRestaurante?> ObtenerPlanActivoAsync(Guid restauranteId)
        {
            var planActivo = await _context.PlanesRestaurantes
                .Include(pr => pr.Plan)
                .FirstOrDefaultAsync(pr => pr.RestauranteId == restauranteId && pr.Estado == "Activo");

            if (planActivo != null)
                return planActivo;

            var planGratuito = await _context.Planes.FirstOrDefaultAsync(p => p.Precio == 0);
            if (planGratuito == null)
                return null;

            planActivo = new PlanRestaurante
            {
                RestauranteId = restauranteId,
                PlanId = planGratuito.Id,
                FechaInicio = DateTime.UtcNow,
                FechaFin = DateTime.UtcNow.AddDays(planGratuito.DuracionDias),
                FechaPago = DateTime.UtcNow,
                Pagado = false,
                Estado = "Activo"
            };

            _context.PlanesRestaurantes.Add(planActivo);
            await _context.SaveChangesAsync();

            planActivo.Plan = planGratuito;
            return planActivo;
        }

        public async Task<Core.Entities.Restaurante?> GetRestauranteAsync(Guid id)
        {
            return await _context.Restaurantes.FindAsync(id);
        }

        public async Task<DashboardInfoDto> GetDashboardInfoAsync(Guid restauranteId)
        {
            var rest = await _context.Restaurantes.FindAsync(restauranteId);
            var moneda = MonedaHelper.PaisToMoneda(rest?.Pais ?? "DO");

            var planActivo = await _context.PlanesRestaurantes
                .Include(pr => pr.Plan)
                .FirstOrDefaultAsync(pr => pr.RestauranteId == restauranteId && pr.Estado == "Activo");

            if (planActivo == null)
            {
                var planGratuito = await _context.Planes.FirstOrDefaultAsync(p => p.Precio == 0);
                return new DashboardInfoDto
                {
                    PlanNombre = planGratuito?.Nombre ?? "Gratuito",
                    PlanPrecio = 0,
                    Moneda = moneda,
                    EsGratuito = true,
                    Estado = "Sin plan",
                    TieneFacturaPendiente = false
                };
            }

            var facturaPendiente = await _context.Facturas
                .Where(f => f.PlanRestauranteId == planActivo.Id && !f.Pagado)
                .OrderByDescending(f => f.FechaEmision)
                .FirstOrDefaultAsync();

            return new DashboardInfoDto
            {
                PlanNombre = planActivo.Plan.Nombre,
                PlanPrecio = planActivo.Plan.Precio,
                Moneda = moneda,
                FechaFin = planActivo.FechaFin,
                DiasRestantes = Math.Max(0, (int)Math.Ceiling((planActivo.FechaFin - DateTime.UtcNow).TotalDays)),
                EsGratuito = planActivo.Plan.Precio == 0,
                TieneFacturaPendiente = facturaPendiente != null,
                MontoPendiente = facturaPendiente?.Monto,
                FacturaPendienteId = facturaPendiente?.Id,
                Estado = planActivo.Estado
            };
        }
    }
}
