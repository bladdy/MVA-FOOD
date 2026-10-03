namespace MVA_FOOD.Core.Entities
{
    /// <summary>
    /// Cabecera de una liquidación de propinas por rango de fechas. Al marcarse
    /// como pagada se crea este registro junto a sus Detalles y las FacturaVenta
    /// incluidas quedan marcadas (FechaLiquidacionPropina), impidiendo re-pago.
    /// </summary>
    public class PagoPropina
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public decimal TotalDividir { get; set; }
        public int CantidadFacturas { get; set; }
        public ModoRepartoPropina Modo { get; set; }
        public string Moneda { get; set; } = "DOP";
        public Guid UsuarioIdPago { get; set; }
        public string? UsuarioPagoNombre { get; set; }
        public DateTime FechaPago { get; set; } = DateTime.UtcNow;
        public List<PagoPropinaDetalle> Detalles { get; set; } = new List<PagoPropinaDetalle>();
    }

    /// <summary>
    /// Monto que recibe un miembro del personal en una liquidación de propinas.
    /// </summary>
    public class PagoPropinaDetalle
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PagoPropinaId { get; set; }
        public PagoPropina PagoPropina { get; set; } = null!;
        public Guid? UsuarioId { get; set; }
        public string? Nombre { get; set; }
        public string Rol { get; set; } = null!;
        public decimal Monto { get; set; }
    }
}