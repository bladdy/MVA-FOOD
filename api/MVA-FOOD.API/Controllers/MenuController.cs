using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.API.Errors;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _service;

        public MenuController(IMenuService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] MenuFilter filter)
        {
            if (string.IsNullOrEmpty(filter.RestauranteId.ToString())) return NotFound();
            var menus = await _service.GetAllAsync(filter);
            if (menus == null || !menus.Items.Any()) return NotFound();  
            return Ok(menus);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var menu = await _service.GetByIdAsync(id);
            if (menu == null) return NotFound();
            return Ok(menu);
        }

        [HttpPost]
        public async Task<ActionResult<MenuDto>> Create([FromForm]MenuCreateDto dto)
        {
            var menu = await _service.CreateAsync(dto);
            if (menu == null) return BadRequest(new ApiResponse(400, "No se pudo crear el menú."));
            return CreatedAtAction(nameof(Get), new { id = menu.Id }, menu);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MenuDto>> Update(Guid id, [FromForm] MenuUpdateDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return BadRequest(new ApiResponse(400, "No se pudo actualizar el menú."));
            return CreatedAtAction(nameof(Get), new { id = updated.Id }, updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
