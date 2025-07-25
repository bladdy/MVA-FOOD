using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class MesaUpdateDto
    {
        
        public string Codigo { get; set; } = string.Empty;
        public int Numero { get; set; }
        public int Capacidad { get; set; }
        public bool EstaOcupada { get; set; }
        public Guid RestauranteId { get; set; }
    }
}