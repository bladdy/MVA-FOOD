using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class PlanRestaurante
    {
        public Guid Id { get; set; }

        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;

        public Guid PlanId { get; set; }
        public Plan Plan { get; set; } = null!;

        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Pagado { get; set; }
    }
}