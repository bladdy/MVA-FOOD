namespace MVA_FOOD.Core.DTOs
{
    public class FacturaDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public string NumeroFactura { get; set; } = null!;
        public decimal Monto { get; set; }
        public DateTime FechaEmision { get; set; }
        public DateTime? FechaPago { get; set; }
        public bool Pagado { get; set; }
        public string Concepto { get; set; } = null!;
        public string? PdfPath { get; set; }
        public string PlanNombre { get; set; } = null!;
        public string Periodo { get; set; } = null!;
        public string Moneda { get; set; } = "DOP";
    }

    public class FacturaDetalleDto : FacturaDto
    {
        public string? StripePaymentIntentId { get; set; }
        public string RestauranteNombre { get; set; } = null!;
        public string RestauranteDireccion { get; set; } = null!;
        public string? RestauranteRnc { get; set; }
    }

    public class VerificarPagoDto
    {
        public string SessionId { get; set; } = null!;
    }

    public class DashboardInfoDto
    {
        public string PlanNombre { get; set; } = null!;
        public decimal PlanPrecio { get; set; }
        public string Moneda { get; set; } = "DOP";
        public DateTime? FechaFin { get; set; }
        public int DiasRestantes { get; set; }
        public bool EsGratuito { get; set; }
        public bool TieneFacturaPendiente { get; set; }
        public decimal? MontoPendiente { get; set; }
        public Guid? FacturaPendienteId { get; set; }
        public string Estado { get; set; } = null!;
    }

    public class PagarFacturaResponseDto
    {
        public string CheckoutUrl { get; set; } = null!;
    }
}
