using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class VarianteOpcionDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public decimal? Precio { get; set; }
    }
}