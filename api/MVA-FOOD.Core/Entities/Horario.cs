
namespace MVA_FOOD.Core.Entities
{
    public class Horario
    {
        public Guid Id { get; set; }
        
        public DayOfWeek Dia { get; set; }
        public TimeSpan HoraApertura { get; set; }
        public TimeSpan HoraCierre { get; set; }

        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
    }

}