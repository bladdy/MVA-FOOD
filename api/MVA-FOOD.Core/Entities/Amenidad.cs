
namespace MVA_FOOD.Core.Entities
{
    public class Amenidad
    {
        public Guid Id { get; set; }
        public string Svg { get; set; } = null!;
        public string Nombre { get; set; } = null!;

        public ICollection<Restaurante> Restaurantes { get; set; } = new List<Restaurante>();
    }
}