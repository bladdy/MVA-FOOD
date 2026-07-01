using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MetodoPagoController : ControllerBase
    {
        private readonly IMetodoPagoService _metodoPagoService;

        public MetodoPagoController(IMetodoPagoService metodoPagoService)
        {
            _metodoPagoService = metodoPagoService;
        }

        [HttpGet("restaurante/{restauranteId}")]
        public async Task<ActionResult<List<MetodoPagoDto>>> GetAll(Guid restauranteId)
        {
            var result = await _metodoPagoService.GetAllAsync(restauranteId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MetodoPagoDto>> GetById(Guid id)
        {
            var result = await _metodoPagoService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("{restauranteId}")]
        public async Task<ActionResult<MetodoPagoDto>> Create(Guid restauranteId, [FromBody] CrearMetodoPagoDto dto)
        {
            if (dto == null) return BadRequest();
            var result = await _metodoPagoService.CreateAsync(restauranteId, dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MetodoPagoDto>> Update(Guid id, [FromBody] CrearMetodoPagoDto dto)
        {
            var result = await _metodoPagoService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var result = await _metodoPagoService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
