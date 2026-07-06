using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlanController : ControllerBase
    {
        private readonly IPlanService _planService;
        private readonly IConfiguration _configuration;

        public PlanController(IPlanService planService, IConfiguration configuration)
        {
            _planService = planService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerPlanes([FromQuery] Guid? restauranteId)
        {
            var planes = await _planService.ObtenerPlanesAsync(restauranteId);
            return Ok(planes);
        }

        [HttpPost]
        public async Task<IActionResult> CrearPlan([FromBody] CrearPlanDto dto)
        {
            var plan = await _planService.CrearPlanAsync(dto);
            return Ok(plan);
        }

        [HttpPost("contratar")]
        public async Task<IActionResult> ContratarPlan([FromBody] ContratarPlanDto dto)
        {
            var contratado = await _planService.ContratarPlanAsync(dto);
            return Ok(contratado);
        }

        [HttpPost("cambiar")]
        public async Task<IActionResult> CambiarPlan([FromBody] CrearCheckoutDto dto)
        {
            var response = await _planService.CrearCheckoutSessionAsync(dto);
            return Ok(response);
        }

        [HttpGet("checkout-success")]
        public async Task<IActionResult> CheckoutSuccess([FromQuery] string session_id)
        {
            var ok = await _planService.ProcesarCheckoutExitosoAsync(session_id);
            var frontendUrl = _configuration["Stripe:FrontendUrl"] ?? "http://localhost:4321";

            if (ok)
                return Redirect($"{frontendUrl}/admin/facturacion/planes?pago=exito");
            else
                return Redirect($"{frontendUrl}/admin/facturacion/planes?pago=error");
        }

        [HttpGet("activo/{restauranteId}")]
        public async Task<IActionResult> ObtenerPlanActivo(Guid restauranteId)
        {
            var plan = await _planService.ObtenerPlanActivoAsync(restauranteId);
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpGet("dashboard-info/{restauranteId}")]
        public async Task<IActionResult> DashboardInfo(Guid restauranteId)
        {
            var info = await _planService.GetDashboardInfoAsync(restauranteId);
            return Ok(info);
        }
    }
}
