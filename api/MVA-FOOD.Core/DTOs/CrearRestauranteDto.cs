
using Microsoft.AspNetCore.Http;

namespace MVA_FOOD.Core.DTOs
{
    public class CrearRestauranteDto
    {
        public string Nombre { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public IFormFile Image { get; set; } = null!;
        public IFormFile PerfilImage { get; set; } = null!;
        public Guid PlanId { get; set; } // nuevo campo obligatorio
        public DateTime? FechaInicio { get; set; } = DateTime.UtcNow; // opcional, por defecto hoy
        public Guid UsuarioId { get; set; } = Guid.NewGuid(); // 👈 nuevo campo
        public List<Guid> AmenidadIds { get; set; } = new List<Guid>();
        public List<Guid> CategoriaIds { get; set; } = new List<Guid>();
    }
}