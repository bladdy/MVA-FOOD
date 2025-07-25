
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

        public PlanController(IPlanService planService)
        {
            _planService = planService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlanes()
        {
            var planes = await _planService.ObtenerPlanesAsync();
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

        [HttpPut("pagar/{id}")]
        public async Task<IActionResult> MarcarPagado(Guid id)
        {
            await _planService.MarcarComoPagadoAsync(id);
            return NoContent();
        }
    }

}