using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Variante
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = null!;
    public bool Obligatorio { get; set; }
    public int? MaxSeleccion { get; set; }

    public ICollection<VarianteOpcion> Opciones { get; set; } = new List<VarianteOpcion>();
}

}