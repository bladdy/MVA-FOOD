using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.DTOs
{
    public class PedidoDto
    {
        public string ClienteNombre { get; set; } = null!;
        public string ClienteTelefono { get; set; } = null!;
        public Guid RestauranteId { get; set; }
        public Guid MesaId { get; set; }
        public Guid EmpleadoId { get; set; }

        public List<PedidoItemDto> Items { get; set; } = new();
    }
}