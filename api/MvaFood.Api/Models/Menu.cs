using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MvaFood.Api.Models
{
    public class Menu
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Precio { get; set; } = 0.0m;
        public string ImagenUrl { get; set; } = string.Empty;

        public Menu()
        {
        }
    }
}