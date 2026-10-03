using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MVA_FOOD.API.Services.Hubs;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Enums;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Roles.Pedidos)]
    public class PedidoController : ControllerBase
    {
        private readonly IPedidoService _service;
        private readonly IHubContext<OrderHub> _hubContext;

        public PedidoController(IPedidoService service, IHubContext<OrderHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
        }

        private Guid? ResolverRestauranteDeUsuario()
        {
            var claim = User.FindFirstValue("restauranteId");
            return Guid.TryParse(claim, out var id) ? id : (Guid?)null;
        }

        private bool PuedeAcceder(Guid restauranteId)
        {
            return ResolverRestauranteDeUsuario() == restauranteId;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? restauranteId)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Unauthorized(new { mensaje = "No tiene acceso a este restaurante" });

            var pedidos = await _service.GetAllAsync(rid);
            return Ok(pedidos);
        }

        [HttpGet("historial")]
        public async Task<IActionResult> GetHistorial([FromQuery] PedidoFilters filters)
        {
            if (filters.RestauranteId == Guid.Empty) filters.RestauranteId = ResolverRestauranteDeUsuario() ?? Guid.Empty;
            if (filters.RestauranteId == Guid.Empty)
                return BadRequest(new { mensaje = "RestauranteId es requerido" });
            if (!PuedeAcceder(filters.RestauranteId))
                return Unauthorized(new { mensaje = "No tiene acceso a este restaurante" });

            var pedidos = await _service.GetHistorialAsync(filters);
            return Ok(pedidos);
        }

        [HttpGet("platos-listos-por-mesa")]
        public async Task<IActionResult> GetPlatosListosPorMesa([FromQuery] Guid? restauranteId)
        {
            var rid = restauranteId ?? ResolverRestauranteDeUsuario();
            if (!rid.HasValue) return Unauthorized(new { mensaje = "No se pudo determinar el restaurante" });
            if (!PuedeAcceder(rid.Value)) return Unauthorized(new { mensaje = "No tiene acceso a este restaurante" });

            var resultado = await _service.GetPlatosListosPorMesaAsync(rid.Value);
            return Ok(resultado);
        }

        [HttpGet("mesa/{mesaId}")]
        public async Task<IActionResult> GetByMesa(Guid mesaId)
        {
            var mesaRestauranteId = await GetMesaRestauranteIdAsync(mesaId);
            if (!mesaRestauranteId.HasValue) return NotFound();
            if (!PuedeAcceder(mesaRestauranteId.Value)) return Unauthorized();

            var pedidos = await _service.GetByMesaAsync(mesaId);
            return Ok(pedidos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var pedido = await _service.GetByIdAsync(id);
            if (pedido == null) return NotFound();
            if (!PuedeAcceder(pedido.RestauranteId)) return Unauthorized();
            return Ok(pedido);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create(PedidoDto dto)
        {
            // El flujo público de take-away/delivery no requiere autenticación, pero los
            // pedidos de mesa son exclusivos del personal autenticado.
            if (dto.MesaId.HasValue && !User.Identity.IsAuthenticated)
                return Unauthorized();

            // El mesero se toma del JWT (solo pedidos de mesa); nunca se confía en el cliente.
            Guid? meseroUsuarioId = null;
            string meseroNombre = null;
            if (dto.MesaId.HasValue && User.Identity.IsAuthenticated)
            {
                var claimId = User.FindFirstValue("usuarioId");
                if (Guid.TryParse(claimId, out var usuarioId))
                    meseroUsuarioId = usuarioId;
                meseroNombre = User.Identity.Name;
            }

            var pedido = await _service.CreateAsync(dto, meseroUsuarioId, meseroNombre);

            var pedidoConItems = await _service.GetByIdSignalRAsync(pedido.Id);

            await _hubContext.Clients
                .Group($"restaurant_{pedido.RestauranteId}")
                .SendAsync("NuevoPedido", pedidoConItems);

            return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, pedido);
        }

        [HttpPatch("{id}/estado")]
        [Authorize(Roles = Roles.MarcarEntregado)]
        public async Task<IActionResult> UpdateEstado(Guid id, [FromQuery] Estado estado)
        {
            var actualizado = await _service.UpdateEstadoAsync(id, estado);
            if (!actualizado) return NotFound();

            var pedido = await _service.GetByIdSignalRAsync(id);
            if (pedido != null)
            {
                await _hubContext.Clients
                    .Group($"restaurant_{pedido.RestauranteId}")
                    .SendAsync("EstadoPedidoActualizado", pedido);
            }

            return NoContent();
        }

        [HttpPatch("{id}/item/{itemId}/estado")]
        [Authorize(Roles = Roles.CocinaWorkflow)]
        public async Task<IActionResult> UpdateItemEstado(Guid id, Guid itemId, [FromQuery] Estado estado)
        {
            var resultado = await _service.UpdateItemEstadoAsync(id, itemId, estado);
            if (!resultado.success) return NotFound();

            var pedido = await _service.GetByIdSignalRAsync(id);
            if (pedido != null)
            {
                await _hubContext.Clients
                    .Group($"restaurant_{pedido.RestauranteId}")
                    .SendAsync("EstadoItemActualizado", new { pedidoId = id, itemId, estado = (int)estado });

                if (resultado.promovido)
                {
                    await _hubContext.Clients
                        .Group($"restaurant_{pedido.RestauranteId}")
                        .SendAsync("EstadoPedidoActualizado", pedido);
                }
            }

            return NoContent();
        }

        [HttpPost("{id}/cancelar")]
        public async Task<IActionResult> Cancelar(Guid id)
        {
            var pedido = await _service.CancelarAsync(id);
            if (pedido == null) return NotFound();

            var pedidoConItems = await _service.GetByIdSignalRAsync(id);
            if (pedidoConItems != null)
            {
                await _hubContext.Clients
                    .Group($"restaurant_{pedidoConItems.RestauranteId}")
                    .SendAsync("EstadoPedidoActualizado", pedidoConItems);
            }

            return Ok(pedido);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.SoloAdmin)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var eliminado = await _service.DeleteAsync(id);
            if (!eliminado) return NotFound();

            return NoContent();
        }

        [HttpGet("{id}/reimprimir")]
        public async Task<IActionResult> Reimprimir(Guid id)
        {
            var pedido = await _service.GetByIdAsync(id);
            if (pedido == null) return NotFound();
            if (!PuedeAcceder(pedido.RestauranteId)) return Unauthorized();

            return Ok(pedido);
        }

        private async Task<Guid?> GetMesaRestauranteIdAsync(Guid mesaId)
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<MVA_FOOD.Infrastructure.Data.AppDbContext>();
            var mesa = await dbContext.Mesas.FindAsync(mesaId);
            return mesa?.RestauranteId;
        }
    }
}