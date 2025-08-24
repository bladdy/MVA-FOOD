namespace MVA_FOOD.Core.Entities
{
    public class Categoria
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public ICollection<Menu> Menus { get; set; } = new List<Menu>();
    }

}