using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace MVA_FOOD.Core.DTOs
{
    public class MenuUpdateDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Ingredientes { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public Guid CategoriaId { get; set; }
        public Guid RestauranteId { get; set; }
        public IFormFile Image { get; set; } = null!;
        public List<VarianteDto> Variantes { get; set; } = new List<VarianteDto>();
    }
}