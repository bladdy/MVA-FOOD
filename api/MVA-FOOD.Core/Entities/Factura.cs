namespace MVA_FOOD.Core.Entities
{
    public class Factura
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PlanRestauranteId { get; set; }
        public PlanRestaurante PlanRestaurante { get; set; } = null!;
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public string NumeroFactura { get; set; } = null!;
        public decimal Monto { get; set; }
        public DateTime FechaEmision { get; set; }
        public DateTime? FechaPago { get; set; }
        public bool Pagado { get; set; }
        public string Concepto { get; set; } = null!;
        public string? StripePaymentIntentId { get; set; }
        public string? StripeInvoiceId { get; set; }
        public string? PdfPath { get; set; }
        public string Moneda { get; set; } = "DOP";
    }
}
