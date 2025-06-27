using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MvaFood.Api.Models
{
    public class Restaurante
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string ImagenUrl { get; set; } = string.Empty;
        public List<Menu> Platos { get; set; } = new List<Menu>();
        public List<Amenidad> Amenidades { get; set; } = new List<Amenidad>();
        public List<Horario> Horarios { get; set; } = new List<Horario>();
        public double Calificacion { get; set; } = 0.0;
        public int NumeroCalificaciones { get; set; } = 0;

        public Restaurante()
        {
        }
    }
}
