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

        public Plan Plan { get; set; }
        public Guid PlanId { get; set; }

        public ICollection<Horario> Horario { get; set; }
        public ICollection<Amenidad> Amenidades { get; set; }
        public ICollection<Menu> Menu { get; set; }
    }

}