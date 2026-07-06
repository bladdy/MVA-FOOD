using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Plan
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public decimal Precio { get; set; }
        public int DuracionDias { get; set; }
        public string? StripePriceId { get; set; }

        public ICollection<PlanRestaurante> PlanesContratados { get; set; } = new List<PlanRestaurante>();
    }

}