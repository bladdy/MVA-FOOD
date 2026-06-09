using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MVA_FOOD.API.Errors;
using MVA_FOOD.API.Services;
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
        private readonly FtpStorageService _ftp;

        public MenuController(IMenuService service, FtpStorageService ftp)
        {
            _service = service;
            _ftp = ftp;
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
            using var stream = dto.Image.OpenReadStream();
            var url = await _ftp.UploadImageAsync(stream, "menus", dto.Image.FileName);
            dto.ImageUrl = url;
            var menu = await _service.CreateAsync(dto);
            if (menu == null) return BadRequest(new ApiResponse(400, "No se pudo crear el menú."));

            return CreatedAtAction(nameof(Get), new { id = menu.Id }, menu);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MenuDto>> Update(Guid id, [FromForm] MenuUpdateDto dto)
        {
            using var stream = dto.Image.OpenReadStream();
            var url = await _ftp.UploadImageAsync(stream, "menus", dto.Image.FileName);
            dto.ImageUrl = url;
            var updated = await _service.UpdateAsync(id, dto);            
            if (updated == null) return BadRequest(new ApiResponse(400, "No se pudo actualizar el menú."));
            return CreatedAtAction(nameof(Get), new { id = updated.Id }, updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var menu = await _service.GetByIdAsync(id);
            if (menu == null) return NotFound();
            var imageName = Path.GetFileName(menu.Imagen);
            var deleted = await _service.DeleteAsync(id);
            if (deleted) await _ftp.DeleteFileAsync("menus", imageName);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
