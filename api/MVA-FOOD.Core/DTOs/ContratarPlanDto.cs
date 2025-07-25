using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class ContratarPlanDto
    {
        public Guid RestauranteId { get; set; }
        public Guid PlanId { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Pagado { get; set; }
    }
}