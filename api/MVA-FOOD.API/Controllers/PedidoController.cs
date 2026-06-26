using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.API.Services.Hubs;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidoController : ControllerBase
    {
        private readonly IPedidoService _service;
        private readonly IHubContext<OrderHub> _hubContext;

        public PedidoController(IPedidoService service, IHubContext<OrderHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? restauranteId)
        {
            var pedidos = await _service.GetAllAsync(restauranteId);
            return Ok(pedidos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var pedido = await _service.GetByIdAsync(id);
            if (pedido == null) return NotFound();
            return Ok(pedido);
        }

        [HttpPost]
        public async Task<IActionResult> Create(PedidoDto dto)
        {
            try
            {
                var pedido = await _service.CreateAsync(dto);

                var pedidoConItems = await _service.GetByIdSignalRAsync(pedido.Id);

                await _hubContext.Clients
                    .Group($"restaurant_{pedido.RestauranteId}")
                    .SendAsync("NuevoPedido", pedidoConItems);

                return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, pedido);
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException is DbUpdateException due
                    ? due.InnerException?.Message ?? due.Message
                    : ex.Message;
                return BadRequest(new { mensaje = msg });
            }
        }

        [HttpPatch("{id}/estado")]
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

        [HttpDelete("{id}")]
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

            return Ok(pedido);
        }
    }
}
