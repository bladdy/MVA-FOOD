using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Amnidad
    {
        public int Id { get; set; }
    public string Svg { get; set; } = null!;
    public string Name { get; set; } = null!;
    
    public ICollection<Restaurante> Restaurantes { get; set; } = new List<Restaurante>();
    }
}