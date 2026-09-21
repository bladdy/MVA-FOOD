namespace MVA_FOOD.Core.Entities
{
    public enum EstadoFacturaVenta
    {
        Emitida = 0,
        Anulada = 1
    }

    public class FacturaVenta
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public Guid? PedidoId { get; set; }
        public Pedido? Pedido { get; set; }
        public string NumeroFactura { get; set; } = null!;
        public DateTime FechaEmision { get; set; } = DateTime.UtcNow;
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string? ClienteNumeroFiscal { get; set; }
        public string TipoEntrega { get; set; } = "recoger";
        public string? MetodoPago { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public decimal PorcentajeImpuesto { get; set; }
        public bool ImpuestoIncluido { get; set; }
        public EstadoFacturaVenta Estado { get; set; } = EstadoFacturaVenta.Emitida;
        public string? Nota { get; set; }
        public string Moneda { get; set; } = "DOP";
        public List<FacturaVentaItem> Items { get; set; } = new List<FacturaVentaItem>();
    }
}
