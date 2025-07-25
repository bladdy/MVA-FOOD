namespace MVA_FOOD.Core.Entities
{
    public class Restaurante
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Image { get; set; } = null!;
    public string PerfilImage { get; set; } = null!;
    public string Direccion { get; set; } = null!;
    public string Phone { get; set; } = null!;

    public int PlanId { get; set; }
    public Plan Plan { get; set; } = null!;

    public ICollection<Horario> Horario { get; set; } = new List<Horario>();
    public ICollection<Amnidad> Amnidades { get; set; } = new List<Amnidad>();
    public ICollection<Menu> Menu { get; set; } = new List<Menu>();
}

}