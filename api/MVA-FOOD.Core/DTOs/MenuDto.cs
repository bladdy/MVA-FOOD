using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class MenuDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Ingredientes { get; set; } = null!;
        public decimal Precio { get; set; }
        public Guid CategoriaId { get; set; }
        public CategoriaDto Categoria { get; set; } = null!;
        public string Imagen { get; set; } = null!;

        public Guid RestauranteId { get; set; }
        public RestauranteDto Restaurante { get; set; } = null!;
        public List<VarianteDto> Variantes { get; set; } = new();
    }
}