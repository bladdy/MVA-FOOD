using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Variante
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public bool Obligatorio { get; set; }
        public int? MaxSeleccion { get; set; }
        public Guid CategoriaId { get; set; }
        public Categoria Categoria { get; set; } = null!;
        public ICollection<VarianteMenus> MenuVariantes  { get; set; } = null!;
        public ICollection<VarianteOpcion> Opciones { get; set; } = new List<VarianteOpcion>();
    }

}