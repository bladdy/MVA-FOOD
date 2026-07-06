using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.Interfaces;
using Stripe;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagoController : ControllerBase
    {
        private readonly IStripePaymentService _stripePaymentService;
        private readonly IPlanService _planService;
        private readonly IFacturaService _facturaService;
        private readonly ILogger<PagoController> _logger;

        public PagoController(IStripePaymentService stripePaymentService, IPlanService planService, IFacturaService facturaService, ILogger<PagoController> logger)
        {
            _stripePaymentService = stripePaymentService;
            _planService = planService;
            _facturaService = facturaService;
            _logger = logger;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].FirstOrDefault();

            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Webhook recibido sin firma Stripe");
                return BadRequest("Firma Stripe requerida");
            }

            try
            {
                var result = await _stripePaymentService.ParseWebhookEventAsync(json, signature);

                if (result == null)
                    return Ok(); // evento ignorado

                if (result.IsPaid && !string.IsNullOrEmpty(result.SessionId))
                {
                    bool ok;

                    if (!string.IsNullOrEmpty(result.FacturaId))
                        ok = await _facturaService.ProcesarPagoFacturaAsync(result.SessionId);
                    else
                        ok = await _planService.ProcesarCheckoutExitosoAsync(result.SessionId);

                    if (!ok)
                        _logger.LogWarning("Webhook: procesamiento falló para session {SessionId}", result.SessionId);
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Error de Stripe en webhook. Status: {Status}, Message: {Message}", ex.HttpStatusCode, ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado en webhook");
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
