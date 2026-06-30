namespace MVA_FOOD.Core.Entities
{
    public class Combo
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal? Precio { get; set; }
        public string? Imagen { get; set; }
        public bool Activo { get; set; } = true;
        public bool Predefinido { get; set; } = true;
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public ICollection<ComboMenu> Items { get; set; } = new List<ComboMenu>();
        public ICollection<MenuComboSugerido> Sugerencias { get; set; } = new List<MenuComboSugerido>();
    }
}
