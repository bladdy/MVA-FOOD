using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class Menu
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = null!;
    public string Ingredientes { get; set; } = null!;
    public decimal Price { get; set; }
    public Categoria Categoria { get; set; }
    public string Imagen { get; set; } = null!;
    
    public int RestauranteId { get; set; }
    public Restaurante Restaurante { get; set; } = null!;
}

}