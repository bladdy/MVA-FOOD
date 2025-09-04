using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class VarianteDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public Guid CategoriaId { get; set; }
        public bool Obligatorio { get; set; }
        public int? MaxSeleccion { get; set; }
        public List<VarianteOpcionDto> Opciones { get; set; } = new();
    }
}