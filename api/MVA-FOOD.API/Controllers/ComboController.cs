using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.API.Services;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComboController : ControllerBase
    {
        private readonly IComboService _comboService;
        private readonly FtpStorageService _ftp;

        public ComboController(IComboService comboService, FtpStorageService ftp)
        {
            _comboService = comboService;
            _ftp = ftp;
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
            if (dto.ImagenFile != null)
            {
                using var stream = dto.ImagenFile.OpenReadStream();
                var url = await _ftp.UploadImageAsync(stream, "menus", dto.ImagenFile.FileName);
                dto.ImagenUrl = url;
            }
            var combo = await _comboService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = combo.Id }, combo);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ComboDto>> Update(Guid id, [FromForm] ComboCreateDto dto)
        {
            if (dto.ImagenFile != null)
            {
                using var stream = dto.ImagenFile.OpenReadStream();
                var url = await _ftp.UploadImageAsync(stream, "menus", dto.ImagenFile.FileName);
                dto.ImagenUrl = url;
            }
            var combo = await _comboService.UpdateAsync(id, dto);
            if (combo == null) return NotFound();
            return Ok(combo);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var combo = await _comboService.GetByIdAsync(id);
            if (combo == null) return NotFound();
            var imageName = Path.GetFileName(combo.Imagen);
            var deleted = await _comboService.DeleteAsync(id);
            if (!deleted) return NotFound();
            if (!string.IsNullOrEmpty(imageName))
                await _ftp.DeleteFileAsync("menus", imageName);
            return NoContent();
        }
    }
}
