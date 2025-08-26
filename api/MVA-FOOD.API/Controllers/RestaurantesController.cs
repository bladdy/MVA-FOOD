using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantesController : BaseApiController
    {
        //Update Restaurantes amenidades y categorias
        private readonly IRestauranteService _service;

        public RestaurantesController(IRestauranteService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] RestauranteFilter filter)
        {
            var result = await _service.GetAllAsync(filter);
            if (result == null || !result.Items.Any()) return NotFound("No se encontraron restaurantes.");
            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<RestauranteDto>> Create(CrearRestauranteDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (result == null) return BadRequest("No se pudo crear el restaurante.");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
        
    }

}