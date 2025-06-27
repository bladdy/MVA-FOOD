using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MvaFood.Api.Data;
using MvaFood.Api.Models;

namespace MvaFood.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RestaurantesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Restaurante>>> GetRestaurantes()
        {
            return await _context.Restaurantes.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Restaurante>> GetRestaurante(int id)
        {
            var restaurante = await _context.Restaurantes.FindAsync(id);
            return restaurante == null ? NotFound() : Ok(restaurante);
        }

        [HttpPost]
        public async Task<ActionResult<Restaurante>> PostRestaurante(Restaurante restaurante)
        {
            _context.Restaurantes.Add(restaurante);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRestaurante), new { id = restaurante.Id }, restaurante);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRestaurante(int id, Restaurante input)
        {
            var restaurante = await _context.Restaurantes.FindAsync(id);
            if (restaurante == null) return NotFound();

            restaurante.Nombre = input.Nombre;
            restaurante.Direccion = input.Direccion;
            restaurante.Categoria = input.Categoria;

            await _context.SaveChangesAsync();
            return Ok(restaurante);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRestaurante(int id)
        {
            var restaurante = await _context.Restaurantes.FindAsync(id);
            if (restaurante == null) return NotFound();

            _context.Restaurantes.Remove(restaurante);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}