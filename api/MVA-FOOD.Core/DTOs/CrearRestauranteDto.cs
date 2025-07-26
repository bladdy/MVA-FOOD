using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class CrearRestauranteDto
    {
        public string Nombre { get; set; } = null!;
        public string Direccion { get; set; } = null!;
        public string Telefono { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string PerfilImage { get; set; } = null!;
        public Guid PlanId { get; set; } // nuevo campo obligatorio
        public DateTime? FechaInicio { get; set; } // opcional, por defecto hoy
        public Guid UsuarioId { get; set; } // 👈 nuevo campo
    }
}