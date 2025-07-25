using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Plan
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;

        public ICollection<Restaurante> Restaurantes { get; set; } = new List<Restaurante>();
    }

}