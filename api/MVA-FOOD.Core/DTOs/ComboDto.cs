namespace MVA_FOOD.Core.DTOs
{
    public class ComboDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal? Precio { get; set; }
        public string? Imagen { get; set; }
        public bool Activo { get; set; }
        public bool Predefinido { get; set; }
        public Guid RestauranteId { get; set; }
        public List<ComboItemDto> Items { get; set; } = new();
        public List<ComboSugeridoDto>? Sugerencias { get; set; }
    }

    public class ComboItemDto
    {
        public Guid MenuId { get; set; }
        public string MenuNombre { get; set; } = null!;
        public decimal MenuPrecio { get; set; }
        public string MenuImagen { get; set; } = null!;
        public int Cantidad { get; set; }
    }

    public class ComboSugeridoDto
    {
        public Guid MenuId { get; set; }
        public string MenuNombre { get; set; } = null!;
        public decimal PrecioAdicional { get; set; }
    }
}
