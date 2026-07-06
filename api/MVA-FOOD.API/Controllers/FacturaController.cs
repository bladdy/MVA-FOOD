using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FacturaController : ControllerBase
    {
        private readonly IFacturaService _facturaService;
        private readonly IStripePaymentService _stripePaymentService;
        private readonly IConfiguration _configuration;

        public FacturaController(IFacturaService facturaService, IStripePaymentService stripePaymentService, IConfiguration configuration)
        {
            _facturaService = facturaService;
            _stripePaymentService = stripePaymentService;
            _configuration = configuration;
        }

        [HttpGet("restaurante/{restauranteId}")]
        public async Task<IActionResult> GetByRestaurante(Guid restauranteId)
        {
            var facturas = await _facturaService.GetByRestauranteAsync(restauranteId);
            return Ok(facturas);
        }

        [HttpGet("{id}")]
        [HttpGet("detalle/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var factura = await _facturaService.GetByIdAsync(id);
            if (factura == null) return NotFound();
            return Ok(factura);
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetPdf(Guid id)
        {
            try
            {
                var pdf = await _facturaService.GenerarPdfAsync(id);
                return File(pdf, "application/pdf", $"factura-{id}.pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost("pagar/{facturaId}")]
        public async Task<IActionResult> PagarFactura(Guid facturaId)
        {
            var factura = await _facturaService.GetByIdAsync(facturaId);
            if (factura == null)
                return NotFound(new { error = "Factura no encontrada" });

            if (factura.Pagado)
                return BadRequest(new { error = "La factura ya está pagada" });

            var userRestauranteId = User.FindFirstValue("restauranteId");
            if (string.IsNullOrEmpty(userRestauranteId) || userRestauranteId != factura.RestauranteId.ToString())
                return Forbid();

            var successUrl = _configuration["Stripe:SuccessUrl"]
                ?? "http://localhost:5147/api/Factura/checkout-success?session_id={CHECKOUT_SESSION_ID}";
            var cancelUrl = _configuration["Stripe:CancelUrl"]
                ?? "http://localhost:4321/admin/facturacion/facturas";

            var result = await _stripePaymentService.CreateCheckoutSessionAsync(
                factura.Monto,
                factura.Moneda,
                $"Factura {factura.NumeroFactura}",
                successUrl,
                cancelUrl,
                new Dictionary<string, string>
                {
                    { "facturaId", facturaId.ToString() },
                    { "restauranteId", factura.RestauranteId.ToString() },
                    { "monto", factura.Monto.ToString() },
                    { "moneda", factura.Moneda }
                });

            return Ok(new PagarFacturaResponseDto { CheckoutUrl = result.Url });
        }

        [HttpGet("checkout-success")]
        public async Task<IActionResult> CheckoutSuccess([FromQuery] string session_id)
        {
            var ok = await _facturaService.ProcesarPagoFacturaAsync(session_id);
            var frontendUrl = _configuration["Stripe:FrontendUrl"] ?? "http://localhost:4321";

            if (ok)
                return Redirect($"{frontendUrl}/admin/facturacion?pago=exito");
            else
                return Redirect($"{frontendUrl}/admin/facturacion?pago=error");
        }
    }
}
