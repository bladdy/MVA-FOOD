using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MVA_FOOD.Core.Entities
{
    public class PedidoItem
    {
        public Guid Id { get; set; }

        public Guid MenuId { get; set; }
        public Menu Producto { get; set; } = null!;
        public Guid PedidoId { get; set; }
        public Pedido Pedido { get; set; } = null!;

        public decimal Precio { get; set; }
        public int Cantidad { get; set; }
        public string Notas { get; set; } = string.Empty;

        // Nueva propiedad: Opciones/variantes
        public string Opciones { get; set; } = string.Empty; // JSON o texto plano con las variantes seleccionadas
    }


}