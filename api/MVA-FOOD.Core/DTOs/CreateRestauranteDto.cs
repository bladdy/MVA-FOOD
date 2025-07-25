using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class CreateRestauranteDto
{
    public string Name { get; set; }
    public string Image { get; set; }
    public string PerfilImage { get; set; }
    public string Direccion { get; set; }
    public string Phone { get; set; }
    public Guid PlanId { get; set; }
}
}