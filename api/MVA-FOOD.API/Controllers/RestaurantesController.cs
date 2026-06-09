using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.API.Services;
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
        private readonly FtpStorageService _ftp;

        public RestaurantesController(IRestauranteService service, FtpStorageService ftp)
        {
            _service = service;
            _ftp = ftp;
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
        [HttpGet("{slug}/slug")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var result = await _service.GetBySlugAsync(slug);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<RestauranteDto>> Create(CrearRestauranteDto dto)
        {
            using var stream = dto.Image.OpenReadStream();
            var url = await _ftp.UploadImageAsync(stream, "restaurant", dto.Image.FileName);

            using var stream2 = dto.PerfilImage.OpenReadStream();
            var url2 = await _ftp.UploadImageAsync(stream2, "restaurant", dto.PerfilImage.FileName);

            dto.ImageUrl = url;
            dto.PerfilImageUrl = url2;

            var result = await _service.CreateAsync(dto);
            if (result == null) return BadRequest("No se pudo crear el restaurante.");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, CrearRestauranteDto dto)
        {
            using var stream = dto.Image.OpenReadStream();
            var url = await _ftp.UploadImageAsync(stream, "restaurant", dto.Image.FileName);

            using var stream2 = dto.PerfilImage.OpenReadStream();
            var url2 = await _ftp.UploadImageAsync(stream2, "restaurant", dto.PerfilImage.FileName);

            dto.ImageUrl = url;
            dto.PerfilImageUrl = url2;

            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound("Restaurante no encontrado o no se pudo actualizar.");
            return Ok(result);
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


