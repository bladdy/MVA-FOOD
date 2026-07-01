namespace MVA_FOOD.Core.Entities
{
    public class TipoEntregaRestaurante
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RestauranteId { get; set; }
        public Restaurante Restaurante { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public int? TiempoMinutos { get; set; }
        public decimal? CostoFijo { get; set; }
        public decimal? Porcentaje { get; set; }
        public bool Activo { get; set; } = true;
    }
}
