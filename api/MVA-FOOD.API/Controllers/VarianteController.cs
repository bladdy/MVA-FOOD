using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MVA_FOOD.API.Errors;
using MVA_FOOD.Core.DTOs;
using MVA_FOOD.Core.Entities;
using MVA_FOOD.Core.Filters;
using MVA_FOOD.Core.Interfaces;

namespace MVA_FOOD.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VarianteController : ControllerBase
    {
        private readonly IVarianteService _service;

        public VarianteController(IVarianteService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] VarianteFilters filters)
        {
            var variantes = await _service.GetAllAsync(filters);
            if (variantes == null || !variantes.Items.Any()) return NotFound();
            return Ok(variantes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var variante = await _service.GetByIdAsync(id);
            if (variante == null) return NotFound();
            return Ok(variante);
        }

        [HttpPost]
        public async Task<ActionResult<VarianteDto>> Create([FromForm] VarianteDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (result == null) return BadRequest(new ApiResponse(400, "No se pudo crear la variante."));
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<VarianteDto>> Update(Guid id, [FromForm] VarianteDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return BadRequest(new ApiResponse(400, "No se pudo actualizar la variante."));
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
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