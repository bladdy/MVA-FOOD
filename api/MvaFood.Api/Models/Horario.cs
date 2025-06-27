using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MvaFood.Api.Models
{
    public class Horario
    {
        public int Id { get; set; }
        public string Dia { get; set; } = string.Empty;
        public string HoraApertura { get; set; } = string.Empty;
        public string HoraCierre { get; set; } = string.Empty;
        public bool Abierto { get; set; } = false;
        public Horario()
        {
            
        }
    }
}
