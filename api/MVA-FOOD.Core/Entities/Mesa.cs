using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Mesa
    {
        public Guid Id { get; set; }
        public int Numero { get; set; }
        public int Capacidad { get; set; }
        public bool EstaOcupada { get; set; }
        public string Codigo { get; set; } = string.Empty;

        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; }
    }
}