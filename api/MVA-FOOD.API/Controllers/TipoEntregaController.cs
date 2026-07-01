using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoEntregaController : ControllerBase
    {
        private readonly ITipoEntregaService _tipoEntregaService;

        public TipoEntregaController(ITipoEntregaService tipoEntregaService)
        {
            _tipoEntregaService = tipoEntregaService;
        }

        [HttpGet("restaurante/{restauranteId}")]
        public async Task<ActionResult<List<TipoEntregaDto>>> GetAll(Guid restauranteId)
        {
            var result = await _tipoEntregaService.GetAllAsync(restauranteId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TipoEntregaDto>> GetById(Guid id)
        {
            var result = await _tipoEntregaService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("{restauranteId}")]
        public async Task<ActionResult<TipoEntregaDto>> Create(Guid restauranteId, [FromBody] CrearTipoEntregaDto dto)
        {
            if (dto == null) return BadRequest();
            var result = await _tipoEntregaService.CreateAsync(restauranteId, dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TipoEntregaDto>> Update(Guid id, [FromBody] CrearTipoEntregaDto dto)
        {
            var result = await _tipoEntregaService.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var result = await _tipoEntregaService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
