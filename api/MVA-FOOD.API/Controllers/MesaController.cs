using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MesaController : ControllerBase
    {
        private readonly IMesaService _service;

        public MesaController(IMesaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? restauranteId)
        {
            if (restauranteId.HasValue && !PuedeAcceder(restauranteId.Value))
                return Unauthorized(new { mensaje = "No tiene acceso a este restaurante" });

            var mesas = await _service.GetAllAsync(restauranteId);
            return Ok(mesas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var mesa = await _service.GetByIdAsync(id);
            if (mesa == null) return NotFound();
            if (!PuedeAcceder(mesa.RestauranteId)) return Unauthorized();
            return Ok(mesa);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MesaCreateDto dto)
        {
            if (!PuedeAcceder(dto.RestauranteId)) return Unauthorized();
            var mesa = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = mesa.Id }, mesa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MesaUpdateDto dto)
        {
            if (!PuedeAcceder(dto.RestauranteId)) return Unauthorized();
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var mesa = await _service.GetByIdAsync(id);
            if (mesa == null) return NotFound();
            if (!PuedeAcceder(mesa.RestauranteId)) return Unauthorized();

            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/liberar")]
        public async Task<IActionResult> Liberar(Guid id)
        {
            var mesa = await _service.GetByIdAsync(id);
            if (mesa == null) return NotFound();
            if (!PuedeAcceder(mesa.RestauranteId)) return Unauthorized();

            var liberado = await _service.LiberarAsync(id);
            if (!liberado) return NotFound();
            return NoContent();
        }

        private bool PuedeAcceder(Guid restauranteId)
        {
            var userRestauranteId = User.FindFirst("restauranteId")?.Value;
            return !string.IsNullOrEmpty(userRestauranteId)
                   && Guid.TryParse(userRestauranteId, out var rid)
                   && rid == restauranteId;
        }
    }
}
