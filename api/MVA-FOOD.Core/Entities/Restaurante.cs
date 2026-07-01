namespace MVA_FOOD.Core.Entities
{
    public class Restaurante
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Image { get; set; }
        public string PerfilImage { get; set; }
        public string Direccion { get; set; }
        public string Phone { get; set; }
        public Guid PlanRestauranteId { get; set; }
        public PlanRestaurante PlanRestaurante { get; set; } = null!;
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
        public ICollection<Horario> Horario { get; set; } = new List<Horario>();
        public ICollection<Menu> Menu { get; set; } = new List<Menu>();
        public ICollection<CategoriaRestaurantes> CategoriaRestaurantes { get; set; } = new List<CategoriaRestaurantes>();
        public ICollection<AmenidadRestaurantes> AmenidadRestaurantes { get; set; } = new List<AmenidadRestaurantes>();
        public ICollection<Combo> Combos { get; set; } = new List<Combo>();
        public ICollection<TipoEntregaRestaurante> TiposEntrega { get; set; } = new List<TipoEntregaRestaurante>();
        public ICollection<MetodoPagoRestaurante> MetodosPago { get; set; } = new List<MetodoPagoRestaurante>();
    }

}