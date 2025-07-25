using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class CrearPlanDto
    {
        public string Nombre { get; set; } = null!;
        public decimal Precio { get; set; }
        public int DuracionDias { get; set; }
    }
}