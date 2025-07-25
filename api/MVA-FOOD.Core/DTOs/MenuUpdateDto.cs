using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class MenuUpdateDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Ingredientes { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public Guid CategoriaId { get; set; }
    }
}