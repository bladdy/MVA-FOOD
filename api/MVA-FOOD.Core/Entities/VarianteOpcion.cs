
namespace MVA_FOOD.Core.Entities
{
    public class VarianteOpcion
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public decimal? Precio { get; set; }
        public Guid VarianteId { get; set; }
        public Variante Variante { get; set; } = null!;
    }

}