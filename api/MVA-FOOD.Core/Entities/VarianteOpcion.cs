using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class VarianteOpcion
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public decimal? Precio { get; set; }

    public string VarianteId { get; set; } = null!;
    public Variante Variante { get; set; } = null!;
}

}