using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class EmpleadoDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public string RestauranteNombre { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }
}