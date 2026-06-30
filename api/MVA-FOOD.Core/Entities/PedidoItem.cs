namespace MVA_FOOD.Core.Entities
{
    public class PedidoItem
    {
        public Guid Id { get; set; }
        public Guid? MenuId { get; set; }
        public Menu? Producto { get; set; }
        public Guid PedidoId { get; set; }
        public Pedido Pedido { get; set; } = null!;
        public decimal Precio { get; set; }
        public int Cantidad { get; set; }
        public string Notas { get; set; } = string.Empty;
        public string Opciones { get; set; } = string.Empty;
        public bool EsCombo { get; set; }
        public Guid? ComboId { get; set; }
        public string? ComboNombre { get; set; }
        public string? ComboItemsJson { get; set; }
    }
}
