namespace MVA_FOOD.Core.Entities
{
    public class ComboMenu
    {
        public Guid Id { get; set; }
        public Guid ComboId { get; set; }
        public Combo Combo { get; set; } = null!;
        public Guid MenuId { get; set; }
        public Menu Menu { get; set; } = null!;
        public int Cantidad { get; set; } = 1;
    }
}
