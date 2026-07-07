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
        private readonly IUsuarioService _usuarioService;
        private readonly FtpStorageService _ftp;

        public RestaurantesController(IRestauranteService service, FtpStorageService ftp, IUsuarioService usuarioService)
        {
            _service = service;
            _usuarioService = usuarioService;
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

            //Verifica si el usuario existe
            if (_usuarioService.ObtenerPorUsuario(dto.Username) != null)
                return BadRequest("El usuario ya existe");

            
            if (dto.Image != null)
            {
                using var stream = dto.Image.OpenReadStream();

                dto.ImageUrl = await _ftp.UploadImageAsync(
                    stream,
                    "restaurant",
                    dto.Image.FileName);
            }

            if (dto.PerfilImage != null)
            {
                using var stream = dto.PerfilImage.OpenReadStream();

                dto.PerfilImageUrl = await _ftp.UploadImageAsync(
                    stream,
                    "restaurant",
                    dto.PerfilImage.FileName);
            }

            var result = await _service.CreateAsync(dto);
            if (result == null) return BadRequest("No se pudo crear el restaurante.");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, CrearRestauranteDto dto)
        {
            if (dto.Image != null)
            {
                using var stream = dto.Image.OpenReadStream();

                dto.ImageUrl = await _ftp.UploadImageAsync(
                    stream,
                    "restaurant",
                    dto.Image.FileName);
            }

            if (dto.PerfilImage != null)
            {
                using var stream = dto.PerfilImage.OpenReadStream();

                dto.PerfilImageUrl = await _ftp.UploadImageAsync(
                    stream,
                    "restaurant",
                    dto.PerfilImage.FileName);
            }

            var result = await _service.UpdateAsync(id, dto);

            if (result == null)
                return NotFound("Restaurante no encontrado o no se pudo actualizar.");

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var restaurante = await _service.GetByIdAsync(id);
            if (restaurante == null) return NotFound();

            if (!string.IsNullOrEmpty(restaurante.Image))
                await _ftp.DeleteFileAsync("restaurant", Path.GetFileName(restaurante.Image));
            if (!string.IsNullOrEmpty(restaurante.PerfilImage))
                await _ftp.DeleteFileAsync("restaurant", Path.GetFileName(restaurante.PerfilImage));

            foreach (var menu in restaurante.Menu)
            {
                if (!string.IsNullOrEmpty(menu.Imagen))
                    await _ftp.DeleteFileAsync("menus", Path.GetFileName(menu.Imagen));
            }

            foreach (var combo in restaurante.Combos)
            {
                if (!string.IsNullOrEmpty(combo.Imagen))
                    await _ftp.DeleteFileAsync("menus", Path.GetFileName(combo.Imagen));
            }

            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

    }

}


