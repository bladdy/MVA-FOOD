using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MVA_FOOD.API.Services.Hubs;
using MVA_FOOD.Core;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.CuentasYFacturas)]
    public class FacturaVentaController : ControllerBase
    {
        private readonly IFacturaVentaService _facturaVentaService;
        private readonly IHubContext<OrderHub> _hubContext;

        public FacturaVentaController(IFacturaVentaService facturaVentaService, IHubContext<OrderHub> hubContext)
        {
            _facturaVentaService = facturaVentaService;
            _hubContext = hubContext;
        }

        private bool PuedeAcceder(Guid restauranteId)
        {
            var userRestauranteId = User.FindFirstValue("restauranteId");
            return !string.IsNullOrEmpty(userRestauranteId) && userRestauranteId == restauranteId.ToString();
        }

        private Guid UsuarioId =>
            Guid.TryParse(User.FindFirstValue("usuarioId"), out var id) ? id : Guid.Empty;

        [HttpGet("restaurante/{restauranteId}")]
        public async Task<IActionResult> GetByRestaurante(Guid restauranteId, [FromQuery] EstadoFacturaVenta? estado = null)
        {
            if (!PuedeAcceder(restauranteId)) return Forbid();
            var facturas = await _facturaVentaService.GetByRestauranteAsync(restauranteId, estado);
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
        [Authorize(Roles = Roles.Caja)]
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
                // Facturación de mostrador: el cliente paga en el acto.
                var factura = await _facturaVentaService.CrearDesdePedidoAsync(
                    pedido.Value, dto, EstadoFacturaVenta.Pagada, UsuarioId, User.Identity?.Name);
                return Ok(factura);
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message, error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("venta-rapida")]
        [Authorize(Roles = Roles.Caja)]
        public async Task<IActionResult> CrearVentaRapida([FromQuery] Guid restauranteId, CrearFacturaVentaDto dto)
        {
            if (restauranteId == Guid.Empty)
                return BadRequest(new { error = "RestauranteId es requerido" });
            if (!PuedeAcceder(restauranteId)) return Forbid();

            try
            {
                var factura = await _facturaVentaService.CrearVentaRapidaAsync(
                    restauranteId, dto, UsuarioId, User.Identity?.Name);
                return Ok(factura);
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message, error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Caja confirma el cobro de una cuenta que el mesero envió a cobrar: registra el
        /// monto recibido, el cambio y el método de pago real. La factura pasa a Pagada y
        /// recién entonces empieza a sumar como ingreso.
        /// </summary>
        [HttpPost("{id}/pagar")]
        [Authorize(Roles = Roles.Caja)]
        public async Task<IActionResult> Pagar(Guid id, PagarFacturaVentaDto dto)
        {
            var actual = await _facturaVentaService.GetByIdAsync(id);
            if (actual == null) return NotFound();
            if (!PuedeAcceder(actual.RestauranteId)) return Forbid();

            try
            {
                var factura = await _facturaVentaService.MarcarPagadaAsync(
                    id, dto, UsuarioId, User.Identity?.Name);
                if (factura == null) return NotFound();

                await _hubContext.Clients
                    .Group($"restaurant_{factura.RestauranteId}")
                    .SendAsync("FacturaPagada", factura);

                return Ok(factura);
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message, error = ex.Message });
            }
        }

        [HttpPost("{id}/anular")]
        [Authorize(Roles = Roles.SoloAdmin)]
        public async Task<IActionResult> Anular(Guid id, AnularFacturaVentaDto dto)
        {
            var factura = await _facturaVentaService.GetByIdAsync(id);
            if (factura == null) return NotFound();
            if (!PuedeAcceder(factura.RestauranteId)) return Forbid();

            try
            {
                var ok = await _facturaVentaService.AnularAsync(id, dto.Motivo);
                if (!ok) return BadRequest(new { error = "No se pudo anular la factura" });
                return NoContent();
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { codigo = ex.Code, mensaje = ex.Message, error = ex.Message });
            }
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
