using MVA_FOOD.Core.Entities;

namespace MVA_FOOD.Core.Filters
{
    public class PedidoFilters
    {
        public Guid RestauranteId { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public Estado? Estado { get; set; }
        public string Search { get; set; } = string.Empty;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
