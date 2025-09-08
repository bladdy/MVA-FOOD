using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Menu
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Ingredientes { get; set; } = null!;
        public decimal Precio { get; set; }
        public string Imagen { get; set; } = null!;
        public bool Activo { get; set; }
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public Guid CategoriaId { get; set; }
        public Categoria Categoria { get; set; } = null!;
        public ICollection<VarianteMenus> VarianteMenus { get; set; } = null!;
    }

}