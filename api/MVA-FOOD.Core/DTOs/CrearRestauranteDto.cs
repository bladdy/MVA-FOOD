
using Microsoft.AspNetCore.Http;

namespace MVA_FOOD.Core.DTOs
{
    public class CrearRestauranteDto
    {
        public string Nombre { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public IFormFile? Image { get; set; } 
        public IFormFile? PerfilImage { get; set; }
        public Guid PlanId { get; set; } // nuevo campo obligatorio
        public DateTime? FechaInicio { get; set; } // opcional, por defecto hoy
        public Guid UsuarioId { get; set; } // 👈 nuevo campo
    }
}