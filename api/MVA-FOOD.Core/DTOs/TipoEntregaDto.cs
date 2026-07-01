namespace MVA_FOOD.Core.DTOs
{
    public class TipoEntregaDto
    {
        public Guid Id { get; set; }
        public Guid RestauranteId { get; set; }
        public string Nombre { get; set; } = null!;
        public int? TiempoMinutos { get; set; }
        public decimal? CostoFijo { get; set; }
        public decimal? Porcentaje { get; set; }
        public bool Activo { get; set; }
    }

    public class CrearTipoEntregaDto
    {
        public string Nombre { get; set; } = null!;
        public int? TiempoMinutos { get; set; }
        public decimal? CostoFijo { get; set; }
        public decimal? Porcentaje { get; set; }
        public bool Activo { get; set; } = true;
    }
}
