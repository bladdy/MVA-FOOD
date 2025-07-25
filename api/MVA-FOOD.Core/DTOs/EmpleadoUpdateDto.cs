namespace MVA_FOOD.Core.DTOs
{
    public class EmpleadoUpdateDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }
}
