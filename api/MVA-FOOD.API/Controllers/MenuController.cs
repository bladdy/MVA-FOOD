using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.Core.DTOs;
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
        public async Task<IActionResult> GetAll()
        {
            var menus = await _service.GetAllAsync();
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
        public async Task<IActionResult> Create([FromForm]MenuCreateDto dto)
        {
            // Deserializar variantes desde el FormData
            if (Request.Form.TryGetValue("Variantes", out var variantesString) 
                && !string.IsNullOrWhiteSpace(variantesString))
            {
                dto.Variantes = JsonSerializer.Deserialize<List<VarianteDto>>(variantesString!);
            }

            // Ahora dto.Variantes contiene todos los datos correctamente
            Console.WriteLine("===== VARIANTES DETECTADAS =====");
            foreach (var v in dto.Variantes)
            {
                Console.WriteLine($"Variante: {v.Name}, Opciones: {v.Opciones?.Count}");
            }
            Console.WriteLine("=============================");
            //Modificar el servicio
            /*var menu = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = menu.Id }, menu);*/
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MenuUpdateDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
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
