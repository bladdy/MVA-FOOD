using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MvaFood.Api.Models
{
    public class Amenidad
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Icono { get; set; } = string.Empty;
        public Amenidad()
        {
        }
    }
}