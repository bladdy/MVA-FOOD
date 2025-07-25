namespace MVA_FOOD.Core.Entities
{
    public class Empleado
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;

        public string Nombre { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }
}
