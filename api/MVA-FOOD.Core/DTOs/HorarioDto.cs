using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class HorarioDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public string RestauranteNombre { get; set; } = string.Empty;
        public DayOfWeek Dia { get; set; }
        public TimeSpan HoraApertura { get; set; }
        public TimeSpan HoraCierre { get; set; }
    }
}