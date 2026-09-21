using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CuentaMesaController : ControllerBase
    {
        private readonly ICuentaMesaService _service;

        public CuentaMesaController(ICuentaMesaService service)
        {
            _service = service;
        }

        private bool PuedeAcceder(Guid restauranteId)
        {
            var userRestauranteId = User.FindFirstValue("restauranteId");
            return !string.IsNullOrEmpty(userRestauranteId) && userRestauranteId == restauranteId.ToString();
        }

        [HttpGet("mesa/{mesaId}")]
        public async Task<IActionResult> GetByMesa(Guid mesaId)
        {
            var cuenta = await _service.GetByMesaAsync(mesaId);
            if (cuenta == null) return Ok(null);
            if (!PuedeAcceder(cuenta.RestauranteId)) return Forbid();
            return Ok(cuenta);
        }

        [HttpGet("restaurante/{restauranteId}")]
        public async Task<IActionResult> GetByRestaurante(Guid restauranteId, [FromQuery] bool soloAbiertas = false)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            var cuentas = await _service.GetByRestauranteAsync(restauranteId, soloAbiertas);
            return Ok(cuentas);
        }

        [HttpPost("{mesaId}/abrir")]
        public async Task<IActionResult> Abrir(Guid mesaId)
        {
            try
            {
                var mesa = await ObtenerMesaRestauranteIdAsync(mesaId);
                if (mesa == null) return NotFound();
                if (!PuedeAcceder(mesa.Value)) return Forbid();

                var cuenta = await _service.AbrirAsync(mesa.Value, mesaId);
                return Ok(cuenta);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{mesaId}/cerrar")]
        public async Task<IActionResult> Cerrar(Guid mesaId, CerrarCuentaMesaDto dto)
        {
            try
            {
                var cuenta = await _service.GetByMesaAsync(mesaId);
                if (cuenta == null) return NotFound();
                if (!PuedeAcceder(cuenta.RestauranteId)) return Forbid();

                var cerrada = await _service.CerrarAsync(mesaId, dto);
                return Ok(cerrada);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private async Task<Guid?> ObtenerMesaRestauranteIdAsync(Guid mesaId)
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MVA_FOOD.Infrastructure.Data.AppDbContext>();
            var mesa = await dbContext.Mesas.FindAsync(mesaId);
            return mesa?.RestauranteId;
        }
    }
}
