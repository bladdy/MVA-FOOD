namespace MVA_FOOD.Core.DTOs
{
    public class FacturaVentaItemDto
    {
        public string Nombre { get; set; } = null!;
        public decimal Precio { get; set; }
        public int Cantidad { get; set; }
        public string Opciones { get; set; } = string.Empty;
        public bool EsCombo { get; set; }
        public string? ComboNombre { get; set; }
        public string? ComboItemsJson { get; set; }
    }

    public class FacturaVentaDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public Guid? PedidoId { get; set; }
        public int? NumeroMesa { get; set; }
        public string NumeroFactura { get; set; } = null!;
        public DateTime FechaEmision { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string? MetodoPago { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public decimal PorcentajeImpuesto { get; set; }
        public bool ImpuestoIncluido { get; set; }
        public int Estado { get; set; }
        public string Moneda { get; set; } = "DOP";
    }

    public class FacturaVentaDetalleDto : FacturaVentaDto
    {
        public string ClienteNumeroFiscal { get; set; } = string.Empty;
        public string TipoEntrega { get; set; } = "recoger";
        public string? Nota { get; set; }
        public List<FacturaVentaItemDto> Items { get; set; } = new List<FacturaVentaItemDto>();
        public List<Guid> PedidoIds { get; set; } = new List<Guid>();
        public string RestauranteNombre { get; set; } = string.Empty;
        public string RestauranteDireccion { get; set; } = string.Empty;
        public string RestauranteTelefono { get; set; } = string.Empty;
        public string RestauranteNumeroFiscal { get; set; } = string.Empty;
        public string MensajePieFactura { get; set; } = string.Empty;
    }

    public class CrearFacturaVentaDto
    {
        public Guid? PedidoId { get; set; }
        public List<Guid>? PedidosIds { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string? ClienteNumeroFiscal { get; set; }
        public string TipoEntrega { get; set; } = "recoger";
        public string? MetodoPago { get; set; }
        public string? Nota { get; set; }
        public List<FacturaVentaItemDto> Items { get; set; } = new List<FacturaVentaItemDto>();
    }

    public class AnularFacturaVentaDto
    {
        public string Motivo { get; set; } = string.Empty;
    }

    public class PedidoFacturableItemDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Precio { get; set; }
        public string Notas { get; set; } = string.Empty;
        public string Opciones { get; set; } = string.Empty;
        public bool EsCombo { get; set; }
        public string? ComboNombre { get; set; }
        public string? ComboItemsJson { get; set; }
    }

    public class PedidoFacturableDto
    {
        public Guid Id { get; set; }
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteTelefono { get; set; } = string.Empty;
        public string TipoEntrega { get; set; } = "recoger";
        public string? MetodoPago { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public int Estado { get; set; }
        public Guid? MesaId { get; set; }
        public int? NumeroMesa { get; set; }
        public List<PedidoFacturableItemDto> Items { get; set; } = new List<PedidoFacturableItemDto>();
    }

    public class ConfigFacturacionDto
    {
        public string PrefijoFactura { get; set; } = "F";
        public int SecuenciaFactura { get; set; } = 1;
        public decimal PorcentajeImpuesto { get; set; }
        public bool ImpuestoIncluido { get; set; } = true;
        public string Moneda { get; set; } = "DOP";
        public string? NumeroFiscal { get; set; }
        public string? MensajePieFactura { get; set; }
        public string SiguienteNumero { get; set; } = "F-00001";
    }

    public class ResumenFacturacionHoyDto
    {
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public int CantidadVentas { get; set; }
        public int CantidadAnuladas { get; set; }
        public decimal Ingresos { get; set; }
        public string Moneda { get; set; } = "DOP";
    }

    public enum RangoReporteVentas
    {
        Hoy = 0,
        Semana = 1,
        Mes = 2
    }

    public class ReporteVentasPorDiaDto
    {
        public string Fecha { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Total { get; set; }
    }

    public class ReporteVentasPorMetodoPagoDto
    {
        public string MetodoPago { get; set; } = "Sin método";
        public int Cantidad { get; set; }
        public decimal Total { get; set; }
    }

    public class ReporteVentasPorProductoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Total { get; set; }
    }

    public class ReporteVentasDto
    {
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public RangoReporteVentas Rango { get; set; }
        public string Moneda { get; set; } = "DOP";
        public int CantidadVentas { get; set; }
        public int CantidadAnuladas { get; set; }
        public decimal Ingresos { get; set; }
        public decimal Impuestos { get; set; }
        public decimal MontoAnulado { get; set; }
        public decimal TicketPromedio { get; set; }
        public List<ReporteVentasPorDiaDto> VentasPorDia { get; set; } = new List<ReporteVentasPorDiaDto>();
        public List<ReporteVentasPorMetodoPagoDto> VentasPorMetodoPago { get; set; } = new List<ReporteVentasPorMetodoPagoDto>();
        public List<ReporteVentasPorProductoDto> TopProductos { get; set; } = new List<ReporteVentasPorProductoDto>();
    }
}
