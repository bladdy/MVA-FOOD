using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComboController : ControllerBase
    {
        private readonly IComboService _comboService;

        public ComboController(IComboService comboService)
        {
            _comboService = comboService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ComboDto>>> GetAll([FromQuery] Guid? restauranteId)
        {
            var combos = await _comboService.GetAllAsync(restauranteId);
            return Ok(combos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ComboDto>> GetById(Guid id)
        {
            var combo = await _comboService.GetByIdAsync(id);
            if (combo == null) return NotFound();
            return Ok(combo);
        }

        [HttpPost]
        public async Task<ActionResult<ComboDto>> Create([FromForm] ComboCreateDto dto)
        {
            if (dto == null) return BadRequest();
            var combo = await _comboService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = combo.Id }, combo);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ComboDto>> Update(Guid id, [FromForm] ComboCreateDto dto)
        {
            var combo = await _comboService.UpdateAsync(id, dto);
            if (combo == null) return NotFound();
            return Ok(combo);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var result = await _comboService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
