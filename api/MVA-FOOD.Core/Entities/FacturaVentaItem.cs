namespace MVA_FOOD.Core.Entities
{
    public class FacturaVentaItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FacturaVentaId { get; set; }
        public FacturaVenta FacturaVenta { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public decimal Precio { get; set; }
        public int Cantidad { get; set; }
        public string Opciones { get; set; } = string.Empty;
        public bool EsCombo { get; set; }
        public string? ComboNombre { get; set; }
        public string? ComboItemsJson { get; set; }
    }
}
