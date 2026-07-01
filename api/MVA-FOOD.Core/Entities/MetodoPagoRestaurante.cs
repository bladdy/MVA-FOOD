namespace MVA_FOOD.Core.Entities
{
    public class MetodoPagoRestaurante
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Icono { get; set; }
        public bool Activo { get; set; } = true;
    }
}
