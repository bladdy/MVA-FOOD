using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FacturaVentaController : ControllerBase
    {
        private readonly IFacturaVentaService _facturaVentaService;

        public FacturaVentaController(IFacturaVentaService facturaVentaService)
        {
            _facturaVentaService = facturaVentaService;
        }

        private bool PuedeAcceder(Guid restauranteId)
        {
            var userRestauranteId = User.FindFirstValue("restauranteId");
            return !string.IsNullOrEmpty(userRestauranteId) && userRestauranteId == restauranteId.ToString();
        }

        [HttpGet("restaurante/{restauranteId}")]
        public async Task<IActionResult> GetByRestaurante(Guid restauranteId)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            var facturas = await _facturaVentaService.GetByRestauranteAsync(restauranteId);
            return Ok(facturas);
        }

        [HttpGet("restaurante/{restauranteId}/facturables")]
        public async Task<IActionResult> GetFacturables(Guid restauranteId)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            var pedidos = await _facturaVentaService.GetPedidosFacturablesAsync(restauranteId);
            return Ok(pedidos);
        }

        [HttpGet("restaurante/{restauranteId}/config")]
        public async Task<IActionResult> GetConfig(Guid restauranteId)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            try
            {
                var config = await _facturaVentaService.ObtenerConfiguracionAsync(restauranteId);
                return Ok(config);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("restaurante/{restauranteId}/resumen-hoy")]
        public async Task<IActionResult> GetResumenHoy(Guid restauranteId)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            var resumen = await _facturaVentaService.GetResumenHoyAsync(restauranteId);
            return Ok(resumen);
        }

        [HttpGet("restaurante/{restauranteId}/reporte")]
        public async Task<IActionResult> GetReporte(Guid restauranteId, [FromQuery] RangoReporteVentas rango = RangoReporteVentas.Hoy)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            var reporte = await _facturaVentaService.GetReporteVentasAsync(restauranteId, rango);
            return Ok(reporte);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var factura = await _facturaVentaService.GetByIdAsync(id);
            if (factura == null) return NotFound();
            if (!PuedeAcceder(factura.RestauranteId)) return Forbid();
            return Ok(factura);
        }

        [HttpPost("desde-pedido")]
        public async Task<IActionResult> CrearDesdePedido(CrearFacturaVentaDto dto)
        {
            if (!dto.PedidoId.HasValue)
                return BadRequest(new { error = "PedidoId es requerido" });

            var pedido = await GetPedidoRestauranteIdAsync(dto.PedidoId.Value);
            if (pedido == null)
                return BadRequest(new { error = "Pedido no encontrado" });
            if (!PuedeAcceder(pedido.Value))
                return Forbid();

            try
            {
                var factura = await _facturaVentaService.CrearDesdePedidoAsync(pedido.Value, dto);
                return Ok(factura);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("venta-rapida")]
        public async Task<IActionResult> CrearVentaRapida([FromQuery] Guid restauranteId, CrearFacturaVentaDto dto)
        {
            if (restauranteId == Guid.Empty)
                return BadRequest(new { error = "RestauranteId es requerido" });
            if (!PuedeAcceder(restauranteId)) return Forbid();

            try
            {
                var factura = await _facturaVentaService.CrearVentaRapidaAsync(restauranteId, dto);
                return Ok(factura);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/anular")]
        public async Task<IActionResult> Anular(Guid id, AnularFacturaVentaDto dto)
        {
            var factura = await _facturaVentaService.GetByIdAsync(id);
            if (factura == null) return NotFound();
            if (!PuedeAcceder(factura.RestauranteId)) return Forbid();

            var ok = await _facturaVentaService.AnularAsync(id, dto.Motivo);
            if (!ok) return BadRequest(new { error = "No se pudo anular la factura" });
            return NoContent();
        }

        private async Task<Guid?> GetPedidoRestauranteIdAsync(Guid pedidoId)
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MVA_FOOD.Infrastructure.Data.AppDbContext>();
            var pedido = await dbContext.Pedidos.FindAsync(pedidoId);
            return pedido?.RestauranteId;
        }
    }
}
