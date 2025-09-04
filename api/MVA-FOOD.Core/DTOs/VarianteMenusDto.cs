using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class VarianteMenusDto
    {
        public Guid VarianteId { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Obligatorio { get; set; }
        public int MaxSeleccion { get; set; }
        public List<VarianteOpcionDto> Opciones { get; set; } = new List<VarianteOpcionDto>();
    }
}