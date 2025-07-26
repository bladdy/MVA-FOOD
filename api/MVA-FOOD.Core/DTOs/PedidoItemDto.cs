using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class PedidoItemDto
    {
        public Guid MenuId { get; set; }
        public int Cantidad { get; set; }
        public string Notas { get; set; } = string.Empty;
        public string Opciones { get; set; } = string.Empty; // Ej: "sin cebolla, extra queso"
    }
}