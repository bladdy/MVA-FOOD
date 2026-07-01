namespace MVA_FOOD.Core.DTOs
{
    public class MetodoPagoDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Icono { get; set; }
        public bool Activo { get; set; }
    }

    public class CrearMetodoPagoDto
    {
        public string Nombre { get; set; } = null!;
        public string? Icono { get; set; }
        public bool Activo { get; set; } = true;
    }
}
