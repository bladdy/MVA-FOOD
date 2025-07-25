namespace MVA_FOOD.Core.DTOs
{
    public class EmpleadoCreateDto
    {
        public Guid RestauranteId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
    }
}
