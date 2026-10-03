namespace MVA_FOOD.Core.Entities
{
    /// <summary>
    /// Ciclo de vida de la factura de venta.
    /// <list type="bullet">
    /// <item><see cref="Emitida"/>: venta directa en mostrador; el cliente paga en el acto.</item>
    /// <item><see cref="PendienteCobro"/>: el mesero cerró la cuenta y la envió a caja; falta cobrar.</item>
    /// <item><see cref="Pagada"/>: caja cobró y confirmó el pago (monto recibido, método y cambio).</item>
    /// <item><see cref="Anulada"/>: sin efecto contable; libera los pedidos para volver a facturar.</item>
    /// </list>
    /// Solo <see cref="Emitida"/> y <see cref="Pagada"/> representan dinero cobrado.
    /// </summary>
    public enum EstadoFacturaVenta
    {
        Emitida = 0,
        Anulada = 1,
        PendienteCobro = 2,
        Pagada = 3
    }

    public static class EstadoFacturaVentaExtensions
    {
        /// <summary>Dinero efectivamente cobrado: cuenta como ingreso.</summary>
        public static bool EstaCobrada(this EstadoFacturaVenta estado)
            => estado == EstadoFacturaVenta.Emitida || estado == EstadoFacturaVenta.Pagada;

        /// <summary>Emitida por el mesero y esperando que caja cobre: no cuenta como ingreso.</summary>
        public static bool EstaPendienteCobro(this EstadoFacturaVenta estado)
            => estado == EstadoFacturaVenta.PendienteCobro;

        /// <summary>Impide reutilizar los pedidos de una factura salvo que se anule.</summary>
        public static bool BloqueaPedidos(this EstadoFacturaVenta estado)
            => estado != EstadoFacturaVenta.Anulada;
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
        public Guid? MeseroUsuarioId { get; set; }
        public string? MeseroNombre { get; set; }
        public decimal PorcentajePropina { get; set; }
        public decimal Propina { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public decimal TotalConPropina { get; set; }
        public decimal PorcentajeImpuesto { get; set; }
        public bool ImpuestoIncluido { get; set; }
        public EstadoFacturaVenta Estado { get; set; } = EstadoFacturaVenta.Emitida;
        public string? Nota { get; set; }
        public string Moneda { get; set; } = "DOP";
        public DateTime? FechaLiquidacionPropina { get; set; }
        public Guid? PagoPropinaId { get; set; }
        public PagoPropina? PagoPropina { get; set; }

        // Cobro en caja. Se llenan al confirmar el pago de una factura PendienteCobro,
        // o de inmediato cuando la venta se genera en mostrador (cliente pagando en el acto).
        public DateTime? FechaPago { get; set; }
        public decimal? MontoRecibido { get; set; }
        public decimal? Cambio { get; set; }
        public Guid? UsuarioCajaId { get; set; }
        public string? UsuarioCajaNombre { get; set; }

        public List<FacturaVentaItem> Items { get; set; } = new List<FacturaVentaItem>();
    }
}
