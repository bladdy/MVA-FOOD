using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class AmenidadRestaurantes
    {
        public Guid Id { get; set; }
        public Guid AmenidadId { get; set; }
        public Amenidad Amenidad { get; set; } = null!;
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
    }
}