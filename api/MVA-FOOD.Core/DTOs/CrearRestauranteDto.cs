
using Microsoft.AspNetCore.Http;

namespace MVA_FOOD.Core.DTOs;

public class CrearRestauranteDto
{
    public string Nombre { get; set; } = null!;
    public string Direccion { get; set; } = null!;
    public string Telefono { get; set; } = null!;
    public string Slogan { get; set; } = null!;
    public IFormFile Image { get; set; } = null!;
    public IFormFile PerfilImage { get; set; } = null!;

    public Guid PlanId { get; set; }
    public DateTime? FechaInicio { get; set; } = DateTime.UtcNow;

    // Usuario administrador
    public string NombreUsuario { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;

    public List<Guid> AmenidadIds { get; set; } = null!;
    public List<Guid> CategoriaIds { get; set; } = null!;
    public List<HorarioDto> Horarios { get; set; } = null!;

    public string ImageUrl { get; set; } = null!;
    public string PerfilImageUrl { get; set; } = null!;
}
