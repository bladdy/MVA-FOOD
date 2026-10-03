using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MVA_FOOD.API.Services.Hubs;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.CuentasYFacturas)]
    public class CuentaMesaController : ControllerBase
    {
        private readonly ICuentaMesaService _service;
        private readonly IHubContext<OrderHub> _hubContext;

        public CuentaMesaController(ICuentaMesaService service, IHubContext<OrderHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
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

        [HttpGet("{cuentaMesaId}/validar-cierre")]
        public async Task<IActionResult> ValidarCierre(Guid cuentaMesaId)
        {
            var cuenta = await ObtenerCuentaAsync(cuentaMesaId);
            if (cuenta == null) return NotFound();
            if (!PuedeAcceder(cuenta.RestauranteId)) return Forbid();

            var resultado = await _service.ValidarCierreAsync(cuentaMesaId);
            return Ok(resultado);
        }

        [HttpPost("{mesaId}/abrir")]
        public async Task<IActionResult> Abrir(Guid mesaId)
        {
            var mesa = await ObtenerMesaRestauranteIdAsync(mesaId);
            if (mesa == null) return NotFound();
            if (!PuedeAcceder(mesa.Value)) return Forbid();

            var cuenta = await _service.AbrirAsync(mesa.Value, mesaId);
            return Ok(cuenta);
        }

        [HttpPost("{mesaId}/cerrar")]
        public async Task<IActionResult> Cerrar(Guid mesaId, CerrarCuentaMesaDto dto)
        {
            var cuenta = await _service.GetByMesaAsync(mesaId);
            if (cuenta == null) return NotFound();
            if (!PuedeAcceder(cuenta.RestauranteId)) return Forbid();

            var cerrada = await _service.CerrarAsync(mesaId, dto);
            if (cerrada.Success && cerrada.FacturaVentaId.HasValue)
            {
                // Caja recibe la cuenta en su cola sin necesidad de recargar la página.
                await _hubContext.Clients
                    .Group($"restaurant_{cuenta.RestauranteId}")
                    .SendAsync("FacturaPendienteCobro", new
                    {
                        facturaVentaId = cerrada.FacturaVentaId,
                        numeroMesa = cuenta.NumeroMesa,
                        total = cerrada.Cuenta?.Total,
                        totalConPropina = cerrada.Cuenta?.TotalConPropina
                    });
            }

            return Ok(cerrada);
        }

        private async Task<Guid?> ObtenerMesaRestauranteIdAsync(Guid mesaId)
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MVA_FOOD.Infrastructure.Data.AppDbContext>();
            var mesa = await dbContext.Mesas.FindAsync(mesaId);
            return mesa?.RestauranteId;
        }

        private async Task<MVA_FOOD.Core.Entities.CuentaMesa?> ObtenerCuentaAsync(Guid cuentaMesaId)
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MVA_FOOD.Infrastructure.Data.AppDbContext>();
            return await dbContext.CuentasMesas.FindAsync(cuentaMesaId);
        }
    }
}