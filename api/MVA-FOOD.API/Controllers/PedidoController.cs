using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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

        public PedidoController(IPedidoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pedidos = await _service.GetAllAsync();
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
            var pedido = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, pedido);
        }

        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> UpdateEstado(Guid id, [FromQuery] Estado estado)
        {
            var actualizado = await _service.UpdateEstadoAsync(id, estado);
            if (!actualizado) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/cambiar-mesa")]
        public async Task<IActionResult> CambiarMesa(Guid id, [FromQuery] Guid nuevaMesaId)
        {
            var actualizado = await _service.CambiarMesaAsync(id, nuevaMesaId);
            if (!actualizado) return NotFound();
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

            // Aquí puedes aplicar lógica adicional para generar un layout de impresión
            return Ok(pedido);
        }
    }

}