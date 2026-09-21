namespace MVA_FOOD.Core.Entities
{
    public enum EstadoCuentaMesa
    {
        Abierta = 0,
        Cerrada = 1
    }

    public class CuentaMesa
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public Guid MesaId { get; set; }
        public Mesa Mesa { get; set; } = null!;
        public EstadoCuentaMesa Estado { get; set; } = EstadoCuentaMesa.Abierta;
        public DateTime FechaApertura { get; set; } = DateTime.UtcNow;
        public DateTime? FechaCierre { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string? MetodoPago { get; set; }
        public string TipoEntrega { get; set; } = "en mesa";
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public Guid? FacturaVentaId { get; set; }
        public FacturaVenta? FacturaVenta { get; set; }
        public List<Pedido> Pedidos { get; set; } = new List<Pedido>();
    }
}
