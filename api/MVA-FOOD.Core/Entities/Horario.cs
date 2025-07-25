
namespace MVA_FOOD.Core.Entities
{
    public class Horario
    {
        public int Id { get; set; }
        public string Dia { get; set; } = null!;
        public string Apertura { get; set; } = null!;
        public string Cierre { get; set; } = null!;

        public int RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
    }

}