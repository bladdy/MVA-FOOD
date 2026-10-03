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
        public string? MetodoPago { get; set; }
        public Guid RestauranteId { get; set; }
        public Guid? MesaId { get; set; }

        public List<PedidoItemDto> Items { get; set; } = new();
    }

    /// <summary>
    /// Cantidad de platos "Listo" (en cocina, sin entregar) de una mesa, para que
    /// el mesero vea de un vistazo qué mesas tienen platillos listos.
    /// </summary>
    public class MesaPlatosListosDto
    {
        public Guid MesaId { get; set; }
        public int NumeroMesa { get; set; }
        public int Listos { get; set; }
    }
}