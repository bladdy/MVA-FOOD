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
        public string TipoEntrega { get; set; } = "recoger";
        public string? Direccion { get; set; }
        public Guid RestauranteId { get; set; }

        public List<PedidoItemDto> Items { get; set; } = new();
    }
}