namespace MVA_FOOD.Core.Entities
{
    public class Restaurante
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Image { get; set; }
        public string PerfilImage { get; set; }
        public string Direccion { get; set; }
        public string Phone { get; set; }

        public Guid PlanRestauranteId { get; set; }
        public PlanRestaurante PlanRestaurante { get; set; } = null!;

        public ICollection<Horario> Horario { get; set; }
        public ICollection<Amenidad> Amenidades { get; set; }
        public ICollection<Menu> Menu { get; set; }
    }

}