namespace MVA_FOOD.Core.Entities
{
    public class MenuComboSugerido
    {
        public Guid Id { get; set; }
        public Guid MenuId { get; set; }
        public Menu Menu { get; set; } = null!;
        public Guid ComboId { get; set; }
        public Combo Combo { get; set; } = null!;
        public decimal PrecioAdicional { get; set; }
    }
}
